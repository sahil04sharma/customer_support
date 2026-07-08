import { Router } from 'express';
import {
  deleteAgent,
  getAnalytics,
  getOnboarding,
  getPlanUsage,
  getProfile,
  getWidgetKey,
  inviteAgent,
  listAgents,
  rotateWidgetKey,
  updateAllowedDomains,
  updateSettings,
  uploadWidgetImageHandler,
  widgetImageMiddleware,
} from '../controllers/business.controller';
import {
  getAiConfigHandler,
  reembedHandler,
  testAiConfigHandler,
  updateAiConfigHandler,
} from '../controllers/aiConfig.controller';
import { requireBusiness } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireBusiness);

router.get('/profile', asyncHandler(getProfile));
router.get('/onboarding', asyncHandler(getOnboarding));
router.put('/settings', asyncHandler(updateSettings));
router.put('/allowed-domains', asyncHandler(updateAllowedDomains));
router.post('/widget-image', widgetImageMiddleware, asyncHandler(uploadWidgetImageHandler));
router.get('/widget-key', asyncHandler(getWidgetKey));
router.post('/widget-key/rotate', asyncHandler(rotateWidgetKey));
router.get('/plan-usage', asyncHandler(getPlanUsage));
router.get('/ai-config', asyncHandler(getAiConfigHandler));
router.put('/ai-config', asyncHandler(updateAiConfigHandler));
router.post('/ai-config/test', asyncHandler(testAiConfigHandler));
router.post('/ai-config/re-embed', asyncHandler(reembedHandler));
router.get('/agents', asyncHandler(listAgents));
router.post('/agents/invite', asyncHandler(inviteAgent));
router.delete('/agents/:id', asyncHandler(deleteAgent));
router.get('/analytics', asyncHandler(getAnalytics));

export default router;
