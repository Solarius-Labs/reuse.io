// src/services/auctionService.ts
import prisma from '../models';
import { AuctionDTO, BidDTO, CreateAuctionInput, CreateBidInput } from '../types';
import { io } from '../config/socket';

export const createAuction = async (auctionData: CreateAuctionInput): Promise<AuctionDTO> => {
  const auction = await prisma.auction.create({
    data: {
      ...auctionData,
      currentPrice: auctionData.startPrice
    },
    include: {
      user: true
    }
  });

  // Emit new auction event
  io.emit('new_auction', auction);

  return auction;
};

export const getAuctions = async (): Promise<AuctionDTO[]> => {
  return prisma.auction.findMany({
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getAuctionById = async (id: string): Promise<AuctionDTO | null> => {
  return prisma.auction.findUnique({
    where: { id },
    include: {
      user: true,
      bids: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });
};

export const createBid = async (bidData: CreateBidInput): Promise<BidDTO> => {
  // Validate bid amount
  const auction = await prisma.auction.findUnique({
    where: { id: bidData.auctionId }
  });

  if (!auction) {
    throw new Error('Auction not found');
  }

  if (auction.status !== 'ACTIVE') {
    throw new Error('Auction is not active');
  }

  if (bidData.amount <= auction.currentPrice) {
    throw new Error('Bid amount must be higher than current price');
  }

  // Create bid in transaction to ensure data consistency
  const [bid, updatedAuction] = await prisma.$transaction([
    prisma.bid.create({
      data: bidData,
      include: {
        user: true
      }
    }),
    prisma.auction.update({
      where: { id: bidData.auctionId },
      data: { currentPrice: bidData.amount },
      include: {
        user: true
      }
    })
  ]);

  // Emit bid and updated auction events
  io.to(`auction_${bidData.auctionId}`).emit('new_bid', bid);
  io.to(`auction_${bidData.auctionId}`).emit('auction_updated', updatedAuction);

  return bid;
};

// Utility function to update auction status
export const updateAuctionStatus = async () => {
  const now = new Date();

  // Update pending auctions to active
  await prisma.auction.updateMany({
    where: {
      status: 'PENDING',
      startTime: {
        lte: now
      }
    },
    data: {
      status: 'ACTIVE'
    }
  });

  // Update active auctions to ended
  await prisma.auction.updateMany({
    where: {
      status: 'ACTIVE',
      endTime: {
        lte: now
      }
    },
    data: {
      status: 'ENDED'
    }
  });

  // Get newly updated auctions
  const updatedAuctions = await prisma.auction.findMany({
    where: {
      OR: [
        { status: 'ACTIVE', startTime: { lte: now } },
        { status: 'ENDED', endTime: { lte: now } }
      ]
    }
  });

  // Emit events for updated auctions
  updatedAuctions.forEach((auction: any) => {
    io.emit('auction_updated', auction);
  });
};

// Create a service for users
export const createUser = async (name: string) => {
  return prisma.user.create({
    data: { name }
  });
};

export const getUsers = async () => {
  return prisma.user.findMany();
};
