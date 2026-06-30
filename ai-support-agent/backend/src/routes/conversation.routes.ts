import { Router } from 'express';
import {
  getConversation,
  listConversations,
} from '../controllers/conversation.controller';
import { requireBusiness } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireBusiness);

router.get('/', asyncHandler(listConversations));
router.get('/:id', asyncHandler(getConversation));

export default router;
