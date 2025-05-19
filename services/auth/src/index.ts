import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";
import authRoutes from "./modules/auth/auth.routes";
import mfaRoutes from "./modules/mfa/mfa.routes";
import { authenticateJWT } from "./common/strategies/jwt.strategies";
import sessionRoutes from "./modules/session/session.routes";
import { errorHandler } from "./middlewares/errorHandler";
import passport from "./middlewares/passportHandler";
import { PrismaClient } from "../generated/prisma";

// Initialize Prisma client
const prisma = new PrismaClient();

const app = express();
const BASE_PATH = config.BASE_PATH;

// Connect to the database
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database"); 
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
    process.exit(1);
  }
};

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(passport.initialize());

// Health check route
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribers!!!",
      database: "PostgreSQL with Prisma",
    });
  })
);

// API routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/mfa`, mfaRoutes);
app.use(`${BASE_PATH}/session`, authenticateJWT, sessionRoutes);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Database connection closed');
  process.exit(0);
});

// Start the server
app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});

// Export Prisma client for use in other modules
export { prisma };