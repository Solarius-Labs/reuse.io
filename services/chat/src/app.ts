import express from 'express';
import cors from 'cors';
import { auctionRoutes } from './routes/auction-routes';
import { chatRoutes } from './routes/chat-routes';



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', chatRoutes);
app.use('/api', auctionRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;