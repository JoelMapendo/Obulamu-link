"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clinicController = exports.ClinicController = void 0;
const prisma_js_1 = require("../utils/prisma.js");
const appointment_service_js_1 = require("../services/appointment.service.js");
class ClinicController {
    async listClinics(req, res, next) {
        try {
            const clinics = await prisma_js_1.prisma.clinic.findMany({
                orderBy: { name: 'asc' }
            });
            res.status(200).json({ success: true, data: clinics });
        }
        catch (err) {
            next(err);
        }
    }
    async getClinicById(req, res, next) {
        try {
            const { id } = req.params;
            const clinic = await prisma_js_1.prisma.clinic.findUnique({
                where: { id },
                include: { slots: true }
            });
            if (!clinic) {
                return res.status(404).json({ success: false, message: 'Clinic not found' });
            }
            res.status(200).json({ success: true, data: clinic });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * GET /api/clinics/slots?clinicId=X&date=YYYY-MM-DD
     */
    async getSlots(req, res, next) {
        try {
            const clinicId = req.query.clinicId;
            const date = req.query.date || new Date().toISOString().split('T')[0];
            if (!clinicId) {
                return res.status(400).json({ success: false, message: 'clinicId query parameter is required' });
            }
            const slots = await appointment_service_js_1.appointmentService.getAvailableSlots(clinicId, date);
            res.status(200).json({ success: true, data: slots });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ClinicController = ClinicController;
exports.clinicController = new ClinicController();
