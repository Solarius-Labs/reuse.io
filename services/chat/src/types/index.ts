export interface UserDTO {
  id: string;
  name: string;
}

export interface MessageDTO {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user?: UserDTO;
}

export interface AuctionDTO {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startPrice: number;
  currentPrice: number;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'ACTIVE' | 'ENDED';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  user?: UserDTO;
}

export interface BidDTO {
  id: string;
  amount: number;
  createdAt: Date;
  userId: string;
  auctionId: string;
  user?: UserDTO;
}

export interface CreateUserInput {
  name: string;
}

export interface CreateMessageInput {
  content: string;
  userId: string;
}

export interface CreateAuctionInput {
  title: string;
  description: string;
  imageUrl?: string;
  startPrice: number;
  startTime: Date;
  endTime: Date;
  createdBy: string;
}

export interface CreateBidInput {
  amount: number;
  userId: string;
  auctionId: string;
}