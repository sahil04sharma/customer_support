import { Router } from 'express';
import {
  createCannedResponse,
  deleteCannedResponse,
  listCannedResponses,
  updateCannedResponse,
} from '../controllers/canned.controller';
import { requireBusiness, requireBusinessOrAgent } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', requireBusinessOrAgent, asyncHandler(listCannedResponses));
router.post('/', requireBusiness, asyncHandler(createCannedResponse));
router.put('/:id', requireBusiness, asyncHandler(updateCannedResponse));
router.delete('/:id', requireBusiness, asyncHandler(deleteCannedResponse));

export default router;
