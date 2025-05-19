import jwt from "jsonwebtoken";
import {
  LoginDto,
  RegisterDto,
  resetPasswordDto,
} from "../../common/interface/auth.interface";
import {
  BadRequestException,
  HttpException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catch-errors";
import {
  anHourFromNow,
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
  threeMinutesAgo,
} from "../../common/utils/date-time";
import { config } from "../../config/app.config";
import { HTTPSTATUS } from "../../config/http.config";
import { ErrorCode } from "../../common/enums/error.enum";
import { VerificationEnum } from "../../common/enums/verifications.enum";
import { sendEmail } from "../../mailers";
import { passwordResetTemplate, verifyEmailTemplate } from "../../mailers/templates";
import { logger } from "../../common/utils/logger";
 // Import functions from new Prisma service
import prisma, { compareValue, createVerificationCode, findUserByEmail, hashValue, thirtyDaysFromNow, verifyCode } from "../../database";
import { refreshTokenSignOptions, RefreshTPayload, signJwtToken, verifyJwtToken } from "../../common/utils/jwt";

// Define email response interface to fix type errors
interface EmailResponse {
  data?: {
    id: string;
    [key: string]: any;
  };
  error?: {
    name: string;
    message: string;
  };
}

export class AuthService {
  public async register(registerData: RegisterDto) {
    const { name, email, password } = registerData;

    // Check if user exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw new BadRequestException(
        "User already exists with this email",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    // Create new user with Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashValue(password),
      }
    });

    const userId = newUser.id;

    // Create verification code with Prisma
    const verification = await createVerificationCode(
      userId, 
      VerificationEnum.EMAIL_VERIFICATION, 
      45/24 // 45 minutes in hours
    );

    // Sending verification email link
    const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });

    return {
      user: newUser,
    };
  }

  public async login(loginData: LoginDto) {
    const { email, password, userAgent } = loginData;

    logger.info(`Login attempt for email: ${email}`);
    const user = await findUserByEmail(email);

    if (!user) {
      logger.warn(`Login failed: User with email ${email} not found`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    // Use the compareValue function directly
    const isPasswordValid = compareValue(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    // Check if the user enable 2fa return user= null
    if (user.enable2FA) {
      logger.info(`2FA required for user ID: ${user.id}`);
      return {
        user: null,
        mfaRequired: true,
        accessToken: "",
        refreshToken: "",
      };
    }

    logger.info(`Creating session for user ID: ${user.id}`);
    // Create session with Prisma
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        userAgent,
        expiredAt: thirtyDaysFromNow(), // Using the utility function from Prisma module
      },
    });

    logger.info(`Signing tokens for user ID: ${user.id}`);
    const accessToken = signJwtToken({
      userId: user.id,
      sessionId: session.id,
    });

    const refreshToken = signJwtToken(
      {
        sessionId: session.id,
      },
      refreshTokenSignOptions
    );

    logger.info(`Login successful for user ID: ${user.id}`);
    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async refreshToken(refreshToken: string) {
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    });

    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Find session with Prisma
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId }
    });
    
    const now = Date.now();

    if (!session) {
      throw new UnauthorizedException("Session does not exist");
    }

    if (session.expiredAt.getTime() <= now) {
      throw new UnauthorizedException("Session expired");
    }

    const sessionRequireRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequireRefresh) {
      // Update session with Prisma
      await prisma.session.update({
        where: { id: session.id },
        data: {
          expiredAt: calculateExpirationDate(config.JWT.REFRESH_EXPIRES_IN)
        }
      });
    }

    const newRefreshToken = sessionRequireRefresh
      ? signJwtToken(
          {
            sessionId: session.id,
          },
          refreshTokenSignOptions
        )
      : undefined;

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session.id,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  public async verifyEmail(code: string) {
    // Find verification code with Prisma
    const validCode = await verifyCode(code, VerificationEnum.EMAIL_VERIFICATION);

    if (!validCode) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    // Update user with Prisma
    const updatedUser = await prisma.user.update({
      where: { id: validCode.userId },
      data: { isEmailVerified: true }
    });

    if (!updatedUser) {
      throw new BadRequestException(
        "Unable to verify email address",
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Delete the verification code
    await prisma.verificationCode.delete({
      where: { id: validCode.id }
    });

    return {
      user: updatedUser,
    };
  }

  public async forgotPassword(email: string) {
    const user = await findUserByEmail(email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    //check mail rate limit is 2 emails per 3 or 10 min
    const timeAgo = threeMinutesAgo();
    const maxAttempts = 2;

    // Count verification codes with Prisma
    const count = await prisma.verificationCode.count({
      where: {
        userId: user.id,
        type: VerificationEnum.PASSWORD_RESET as string,
        createdAt: { gt: timeAgo }
      }
    });

    if (count >= maxAttempts) {
      throw new HttpException(
        "Too many request, try again later",
        HTTPSTATUS.TOO_MANY_REQUESTS,
        ErrorCode.AUTH_TOO_MANY_ATTEMPTS
      );
    }

    const expiresAt = anHourFromNow();
    // Create verification code with Prisma
    const validCode = await createVerificationCode(
      user.id,
      VerificationEnum.PASSWORD_RESET ,
      1 // 1 hour
    );

    const resetLink = `${config.APP_ORIGIN}/reset-password?code=${
      validCode.code
    }&exp=${expiresAt.getTime()}`;

    const { data, error } = await sendEmail({
      to: user.email,
      ...passwordResetTemplate(resetLink),
    }) as EmailResponse;

    if (!data?.id) {
      throw new InternalServerException(`${error?.name} ${error?.message}`);
    }

    return {
      url: resetLink,
      emailId: data.id,
    };
  }

  public async resePassword({ password, verificationCode }: resetPasswordDto) {
    // Find verification code with Prisma
    const validCode = await verifyCode(verificationCode, VerificationEnum.PASSWORD_RESET);

    if (!validCode) {
      throw new NotFoundException("Invalid or expired verification code");
    }

    const hashedPassword = hashValue(password);

    // Update user with Prisma
    const updatedUser = await prisma.user.update({
      where: { id: validCode.userId },
      data: { password: hashedPassword }
    });

    if (!updatedUser) {
      throw new BadRequestException("Failed to reset password!");
    }

    // Delete the verification code
    await prisma.verificationCode.delete({
      where: { id: validCode.id }
    });

    // Delete all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: updatedUser.id }
    });

    return {
      user: updatedUser,
    };
  }

  public async logout(sessionId: string) {
    // Delete session with Prisma
    return await prisma.session.delete({
      where: { id: sessionId }
    });
  }
}