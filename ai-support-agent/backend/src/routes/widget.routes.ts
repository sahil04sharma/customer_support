import { Router } from 'express';
import {
  sendWidgetMessage,
  startWidgetConversation,
} from '../controllers/widget.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/conversation/start', asyncHandler(startWidgetConversation));
router.post('/message', asyncHandler(sendWidgetMessage));

export default router;
