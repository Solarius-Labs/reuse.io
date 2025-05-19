// src/models/index.ts

import { PrismaClient } from "../../generated/prisma";
import { AuctionDTO, BidDTO, CreateAuctionInput, CreateBidInput } from "../types";

const prisma = new PrismaClient();

export default prisma;
