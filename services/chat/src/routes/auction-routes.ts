// src/routes/auctionRoutes.ts
import { Router } from 'express';
import * as auctionController from '../controllers/auction-controllers';

const router = Router();

router.post('/auctions', auctionController.createAuction);
router.get('/auctions', auctionController.getAuctions);
router.get('/auctions/:id', auctionController.getAuction);
router.post('/auctions/:id/bids', auctionController.placeBid);

// Users endpoints
router.post('/users', auctionController.createUser);
router.get('/users', auctionController.getUsers);

export  {router as auctionRoutes};
