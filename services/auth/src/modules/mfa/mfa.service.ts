import { Request } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

// Extend the User type to include enable2FA and twoFactorSecret
declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      enable2FA?: boolean;
      twoFactorSecret?: string | null;
      // add other properties as needed
    }
  }
}

import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catch-errors";
import { refreshTokenSignOptions, signJwtToken } from "../../common/utils/jwt";
import { thirtyDaysFromNow } from "../../common/utils/date-time";
import prisma from "../../database";
 
export class MfaService {
  public async generateMFASetup(req: Request) {
    const user = req.user;

    if (!user) {
      
      throw new UnauthorizedException("User not authorized");
    }

    if (user.enable2FA) {
      return {
        message: "MFA already enabled", 
      };
    }

    let secretKey = user.twoFactorSecret;
    if (!secretKey) {
      const secret = speakeasy.generateSecret({ name: "Squeezy" });
      secretKey = secret.base32;
      
      // Update user with Prisma
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secretKey }
      });
    }

    const url = speakeasy.otpauthURL({
      secret: secretKey,
      label: `${user.name}`,
      issuer: "squeezy.com",
      encoding: "base32",
    });

    const qrImageUrl = await qrcode.toDataURL(url);

    return {
      message: "Scan the QR code or use the setup key.",
      secret: secretKey,
      qrImageUrl,
    };
  }

  public async verifyMFASetup(req: Request, code: string, secretKey: string) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (user.enable2FA) {
      return {
        message: "MFA is already enabled",
        userPreferences: {
          enable2FA: user.enable2FA,
        },
      };
    }

    const isValid = speakeasy.totp.verify({
      secret: secretKey,
      encoding: "base32",
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code. Please try again.");
    }

    // Update user with Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: { enable2FA: true }
    });

    return {
      message: "MFA setup completed successfully",
      userPreferences: {
        enable2FA: true,
      },
    };
  }

  public async revokeMFA(req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (!user.enable2FA) {
      return {
        message: "MFA is not enabled",
        userPreferences: {
          enable2FA: user.enable2FA,
        },
      };
    }

    // Update user with Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorSecret: null,
        enable2FA: false 
      }
    });

    return {
      message: "MFA revoke successfully",
      userPreferences: {
        enable2FA: false,
      },
    };
  }

  public async verifyMFAForLogin(
    code: string,
    email: string,
    userAgent?: string
  ) {
    // Find user with Prisma
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.enable2FA || !user.twoFactorSecret) {
      throw new UnauthorizedException("MFA not enabled for this user");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code. Please try again.");
    }

    //sign access token & refresh token
    // Create session with Prisma
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        userAgent,
        expiredAt: thirtyDaysFromNow()
      }
    });

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

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}