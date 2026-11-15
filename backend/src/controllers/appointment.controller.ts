import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { appointmentService } from '../services/appointment.service.js';
import { BookingChannel, AppointmentStatus } from '../types/index.js';

export class AppointmentController {
  /**
   * POST /api/appointments/book
   */
  async bookAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { clinicId, slotId, notes, bookingChannel = 'ANDROID' } = req.body;
      const patientId = req.user?.id;

      if (!patientId) {
        return res.status(401).json({ success: false, message: 'Patient authentication required' });
      }

      if (!clinicId || !slotId) {
        return res.status(400).json({ success: false, message: 'clinicId and slotId are required' });
      }

      const appointment = await appointmentService.bookAppointment({
        patientId,
        clinicId,
        slotId,
        bookingChannel: bookingChannel as BookingChannel,
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to book appointment'
      });
    }
  }

  /**
   * GET /api/appointments/my
   */
  async getMyAppointments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const phoneNumber = req.user?.phoneNumber;
      if (!phoneNumber) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const appointments = await appointmentService.getPatientAppointments(phoneNumber);
      res.status(200).json({ success: true, data: appointments });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/clinician/queue/today
   */
  async getClinicianQueueToday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const clinicId = req.query.clinicId as string | undefined;
      const date = req.query.date as string | undefined;

      const queueData = await appointmentService.getDailyQueue(clinicId, date);
      res.status(200).json({
        success: true,
        data: queueData
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/appointments/:id/status
   */
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status required: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW'
        });
      }

      const updated = await appointmentService.updateStatus(id, status as AppointmentStatus);
      res.status(200).json({
        success: true,
        message: `Appointment marked as ${status}`,
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

export const appointmentController = new AppointmentController();

