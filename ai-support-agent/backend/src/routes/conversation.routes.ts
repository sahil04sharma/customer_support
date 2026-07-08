import { Router } from 'express';
import {
  getConversation,
  exportConversation,
  listConversations,
  replyToConversation,
} from '../controllers/conversation.controller';
import { requireBusiness } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireBusiness);

router.get('/', asyncHandler(listConversations));
router.get('/:id/export', asyncHandler(exportConversation));
router.get('/:id', asyncHandler(getConversation));
router.post('/:id/reply', asyncHandler(replyToConversation));

export default router;
