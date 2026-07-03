import { Router } from 'express';
import {
  deleteAgent,
  getAnalytics,
  getOnboarding,
  getProfile,
  getWidgetKey,
  inviteAgent,
  listAgents,
  updateSettings,
  uploadWidgetImageHandler,
  widgetImageMiddleware,
} from '../controllers/business.controller';
import { requireBusiness } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireBusiness);

router.get('/profile', asyncHandler(getProfile));
router.get('/onboarding', asyncHandler(getOnboarding));
router.put('/settings', asyncHandler(updateSettings));
router.post('/widget-image', widgetImageMiddleware, asyncHandler(uploadWidgetImageHandler));
router.get('/widget-key', asyncHandler(getWidgetKey));
router.get('/agents', asyncHandler(listAgents));
router.post('/agents/invite', asyncHandler(inviteAgent));
router.delete('/agents/:id', asyncHandler(deleteAgent));
router.get('/analytics', asyncHandler(getAnalytics));

export default router;
