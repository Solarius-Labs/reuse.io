// src/routes/chatRoutes.ts
import { Router } from 'express';
import * as chatController from '../controllers/chat-controllers';

const router = Router();

router.post('/messages', chatController.sendMessage);
router.get('/messages', chatController.getMessages);

export {router as chatRoutes};