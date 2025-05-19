
import { compareSync, hashSync } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { PrismaClient } from '../../generated/prisma';

// Initialize Prisma client
const prisma = new PrismaClient();

// Function to connect to the database
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database");
    return prisma;
  } catch (error) {
    console.log("Error connecting to PostgreSQL database", error);
    process.exit(1);
  }
};

// Password hashing and comparison functions
export const hashValue = (value: string): string => {
  return hashSync(value, 10);
};

export const compareValue = (plainText: string, hashedValue: string): boolean => {
  return compareSync(plainText, hashedValue);
};

// Date utility functions
export const thirtyDaysFromNow = (): Date => {
  return addDays(new Date(), 30);
};

// UUID generation for verification codes
export const generateUniqueCode = (): string => {
  return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
};

// Verification code types enum
export enum VerificationEnum {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_AUTH = 'TWO_FACTOR_AUTH',
}

// User service functions
export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const hashedPassword = hashValue(data.password);
  
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const compareUserPassword = async (userId: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  
  if (!user) return false;
  
  return compareValue(password, user.password);
};

// Session service functions
export const createSession = async (userId: string, userAgent?: string) => {
  return prisma.session.create({
    data: {
      userId,
      userAgent,
      expiredAt: thirtyDaysFromNow(),
    },
  });
};

export const findSessionById = async (id: string) => {
  return prisma.session.findUnique({
    where: { id },
    include: { user: true },
  });
};

// Verification code service functions
export const createVerificationCode = async (
  userId: string,
  type: VerificationEnum,
  expiresInHours: number = 24
) => {
  const expiresAt = addDays(new Date(), expiresInHours / 24);
  
  return prisma.verificationCode.create({
    data: {
      userId,
      type,
      code: generateUniqueCode(),
      expiresAt,
    },
  });
};

export const findVerificationCode = async (code: string) => {
  return prisma.verificationCode.findUnique({
    where: { code },
    include: { user: true },
  });
};

export const verifyCode = async (code: string, type: VerificationEnum) => {
  const verificationCode = await prisma.verificationCode.findFirst({
    where: {
      code,
      type,
      expiresAt: {
        gte: new Date(),
      },
    },
  });
  
  return verificationCode;
};

// Export Prisma client for use in other files
export default prisma;