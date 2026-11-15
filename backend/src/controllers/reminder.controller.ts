import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { reminderService } from '../services/reminder.service.js';
import { prisma } from '../utils/prisma.js';

export class ReminderController {
  /**
   * POST /api/reminders/create
   */
  async createReminder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { patientId, appointmentId, medicationName, dosage, reminderDate, reminderTime, channel } = req.body;

      if (!patientId || !medicationName || !dosage || !reminderDate) {
        return res.status(400).json({
          success: false,
          message: 'patientId, medicationName, dosage, and reminderDate are required'
        });
      }

      const reminder = await reminderService.createMedicationReminder({
        patientId,
        appointmentId,
        medicationName,
        dosage,
        reminderDate,
        reminderTime,
        channel
      });

      res.status(201).json({
        success: true,
        message: 'Medication reminder scheduled successfully',
        data: reminder
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/reminders/patient/:patientId
   */
  async getPatientReminders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const reminders = await prisma.medicationReminder.findMany({
        where: { patientId },
        orderBy: { reminderDate: 'desc' }
      });

      res.status(200).json({ success: true, data: reminders });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/reminders/trigger-cron
   * Allows manual triggering for testing and demo purposes
   */
  async triggerCron(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await reminderService.processDueReminders();
      res.status(200).json({
        success: true,
        message: 'Manual reminder check executed',
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const reminderController = new ReminderController();

