import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { appointmentService } from '../services/appointment.service.js';

export class ClinicController {
  async listClinics(req: Request, res: Response, next: NextFunction) {
    try {
      const clinics = await prisma.clinic.findMany({
        orderBy: { name: 'asc' }
      });
      res.status(200).json({ success: true, data: clinics });
    } catch (err) {
      next(err);
    }
  }

  async getClinicById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const clinic = await prisma.clinic.findUnique({
        where: { id },
        include: { slots: true }
      });

      if (!clinic) {
        return res.status(404).json({ success: false, message: 'Clinic not found' });
      }

      res.status(200).json({ success: true, data: clinic });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/clinics/slots?clinicId=X&date=YYYY-MM-DD
   */
  async getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const clinicId = req.query.clinicId as string;
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'clinicId query parameter is required' });
      }

      const slots = await appointmentService.getAvailableSlots(clinicId, date);
      res.status(200).json({ success: true, data: slots });
    } catch (err) {
      next(err);
    }
  }
}

export const clinicController = new ClinicController();

