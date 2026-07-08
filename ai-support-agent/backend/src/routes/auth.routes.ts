import { Router } from 'express';
import {
  loginAgent,
  loginBusiness,
  logout,
  refresh,
  registerBusiness,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/business/register', asyncHandler(registerBusiness));
router.post('/business/login', asyncHandler(loginBusiness));
router.post('/business/forgot-password', asyncHandler(forgotPassword));
router.post('/business/reset-password', asyncHandler(resetPassword));
router.post('/agent/login', asyncHandler(loginAgent));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));

export default router;
