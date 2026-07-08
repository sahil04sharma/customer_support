import { Router } from 'express';
import {
  createWidgetSession,
  rateWidgetConversation,
  sendWidgetMessage,
  startWidgetConversation,
} from '../controllers/widget.controller';
import { requireWidgetSession } from '../middleware/widgetSession.middleware';
import { widgetSessionLimiter } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/session', widgetSessionLimiter, asyncHandler(createWidgetSession));
router.post('/conversation/start', requireWidgetSession, asyncHandler(startWidgetConversation));
router.post('/message', requireWidgetSession, asyncHandler(sendWidgetMessage));
router.post('/conversation/rate', requireWidgetSession, asyncHandler(rateWidgetConversation));

export default router;
