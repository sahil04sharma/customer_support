import { Router } from 'express';
import {
  deleteDocument,
  getDocumentsSummary,
  listDocuments,
  uploadDocumentHandler,
  uploadMiddleware,
} from '../controllers/document.controller';
import { requireBusiness } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(requireBusiness);

router.post('/upload', uploadMiddleware, asyncHandler(uploadDocumentHandler));
router.get('/summary', asyncHandler(getDocumentsSummary));
router.get('/', asyncHandler(listDocuments));
router.delete('/:id', asyncHandler(deleteDocument));

export default router;
