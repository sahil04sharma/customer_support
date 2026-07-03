import { Router } from 'express';
import {
  bootstrapAdmin,
  getBusinessDetail,
  getPlatformMetrics,
  getPlatformUsage,
  listBusinesses,
  loginAdmin,
  updateBusinessPlan,
  updateBusinessStatus,
} from '../controllers/admin.controller';
import { requireSuperAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/bootstrap', asyncHandler(bootstrapAdmin));
router.post('/login', asyncHandler(loginAdmin));

router.use(requireSuperAdmin);

router.get('/metrics', asyncHandler(getPlatformMetrics));
router.get('/businesses', asyncHandler(listBusinesses));
router.get('/businesses/:id', asyncHandler(getBusinessDetail));
router.get('/usage', asyncHandler(getPlatformUsage));
router.patch('/businesses/:id/plan', asyncHandler(updateBusinessPlan));
router.patch('/businesses/:id/status', asyncHandler(updateBusinessStatus));

export default router;
