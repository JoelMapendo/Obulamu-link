import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected: Patient & Clinician
router.post('/book', authenticateJwt, (req, res, next) => appointmentController.bookAppointment(req, res, next));
router.get('/my', authenticateJwt, (req, res, next) => appointmentController.getMyAppointments(req, res, next));

// Clinician queue view
router.get('/clinician/queue/today', authenticateJwt, requireRole(['CLINICIAN', 'ADMIN']), (req, res, next) =>
  appointmentController.getClinicianQueueToday(req, res, next)
);

// Update status (e.g. COMPLETED, NO_SHOW, CANCELLED)
router.patch('/:id/status', authenticateJwt, requireRole(['CLINICIAN', 'ADMIN']), (req, res, next) =>
  appointmentController.updateStatus(req, res, next)
);

export default router;

