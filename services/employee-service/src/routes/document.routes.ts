import { Router } from 'express';
import { getAuthMiddleware, documentUploadMiddleware } from '@hrm/common';
import {
  uploadDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  verifyDocument,
  rejectDocument,
  getDocumentsByEmployee,
  getDocumentsByCompany,
  getPendingDocuments,
  searchDocuments,
  getAllDocuments,
} from '../controllers/document.controller';

const { authenticate } = getAuthMiddleware();

const router = Router();

router.use(authenticate);

router.post('/upload', documentUploadMiddleware, uploadDocument);
router.get('/search', searchDocuments);
router.get('/all', getAllDocuments);
router.get('/pending/:companyId', getPendingDocuments);
router.get('/employee/:employeeId', getDocumentsByEmployee);
router.get('/company/:companyId', getDocumentsByCompany);
router.post('/:id/verify', verifyDocument);
router.post('/:id/reject', rejectDocument);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
