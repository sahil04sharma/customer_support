import { Router } from 'express';
import {
  getAgentConversation,
  listAgentConversations,
  resolveAgentConversation,
  sendAgentMessage,
} from '../controllers/agent.controller';
import { requireAgent } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireAgent);

router.get('/conversations', asyncHandler(listAgentConversations));
router.get('/conversations/:id', asyncHandler(getAgentConversation));
router.post('/message', asyncHandler(sendAgentMessage));
router.put('/conversations/:id/resolve', asyncHandler(resolveAgentConversation));

export default router;
