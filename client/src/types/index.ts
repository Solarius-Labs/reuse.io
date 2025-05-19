export type forgotPasswordType = { email: string };
export type resetPasswordType = { password: string; verificationCode: string };

export type  LoginType = {
  email: string;
  password: string;
};

export type  registerType = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type  verifyEmailType = { code: string };
export type verifyMFAType = { code: string; secretKey: string };
export type  mfaLoginType = { code: string; email: string };

export type SessionType = {
  _id: string;
  userId: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

export type SessionResponseType = {
  message: string;
  sessions: SessionType[];
};

export type mfaType = {
  message: string;
  secret: string;
  qrImageUrl: string;
};

export type DeviceType = "desktop" | "mobile";

export type UserType = {
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  userPreferences: {
    enable2FA: boolean;
  };
};

export type AuthContextType = {
  user?: UserType;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

// src/types/index.ts
export interface User {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string | Date;
  userId: string;
  user?: User;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startPrice: number;
  currentPrice: number;
  startTime: string | Date;
  endTime: string | Date;
  status: 'PENDING' | 'ACTIVE' | 'ENDED';
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  user?: User;
}

export interface Bid {
  id: string;
  amount: number;
  createdAt: string | Date;
  userId: string;
  auctionId: string;
  user?: User;
}

export interface CreateAuctionInput {
  title: string;
  description: string;
  imageUrl?: string;
  startPrice: number;
  startTime: Date | string;
  endTime: Date | string;
  createdBy: string;
}