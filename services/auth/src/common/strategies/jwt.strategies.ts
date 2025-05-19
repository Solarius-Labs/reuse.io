import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithRequest,
} from "passport-jwt";
import { config } from "../../config/app.config";
import passport, { PassportStatic } from "passport";
import { PrismaClient } from "../../../generated/prisma";
import { ErrorCode } from "../enums/error.enum";
import { UnauthorizedException } from "../utils/catch-errors";


// Initialize Prisma client
const prisma = new PrismaClient();

// Define JWT payload interface
interface JwtPayload {
  userId: string;
  sessionId: string;
}

// Extend Express Request type to include sessionId
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        throw new UnauthorizedException(
          "Unauthorized access token",
          ErrorCode.AUTH_TOKEN_NOT_FOUND
        );
      }
      return accessToken;
    },
  ]),
  secretOrKey: config.JWT.SECRET,
  audience: ["user"],
  algorithms: ["HS256"],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
      try {
        // Find user by ID using Prisma
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });

        if (!user) {
          return done(null, false);
        }

        // Check if the session exists and is valid
        const session = await prisma.session.findFirst({
          where: {
            id: payload.sessionId,
            userId: payload.userId,
            expiredAt: {
              gt: new Date(), // Session has not expired
            },
          },
        });

        if (!session) {
          return done(null, false);
        }

        // Add sessionId to request object for later use
        req.sessionId = payload.sessionId;
        
        // Exclude password and sensitive fields from user object
        const { password, twoFactorSecret, ...safeUser } = user;
        
        return done(null, safeUser);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export const authenticateJWT = passport.authenticate("jwt", { session: false });

// User service for direct usage elsewhere
export const userService = {
  findUserById: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) return null;
    
    // Exclude sensitive data
    const { password, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  },
  
  findUserByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) return null;
    
    // Exclude sensitive data
    const { password, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  },
  
  // Add more user service methods as needed
};