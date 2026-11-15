import { Router } from 'express';
import { reminderController } from '../controllers/reminder.controller.js';
import { authenticateJwt, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Clinician schedules medication reminders
router.post('/create', authenticateJwt, requireRole(['CLINICIAN', 'ADMIN']), (req, res, next) =>
  reminderController.createReminder(req, res, next)
);

router.get('/patient/:patientId', authenticateJwt, (req, res, next) =>
  reminderController.getPatientReminders(req, res, next)
);

// Manual trigger for testing cron job
router.post('/trigger-cron', authenticateJwt, (req, res, next) =>
  reminderController.triggerCron(req, res, next)
);

export default router;

