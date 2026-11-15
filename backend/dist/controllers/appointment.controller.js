"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentController = exports.AppointmentController = void 0;
const appointment_service_js_1 = require("../services/appointment.service.js");
class AppointmentController {
    /**
     * POST /api/appointments/book
     */
    async bookAppointment(req, res, next) {
        try {
            const { clinicId, slotId, notes, bookingChannel = 'ANDROID' } = req.body;
            const patientId = req.user?.id;
            if (!patientId) {
                return res.status(401).json({ success: false, message: 'Patient authentication required' });
            }
            if (!clinicId || !slotId) {
                return res.status(400).json({ success: false, message: 'clinicId and slotId are required' });
            }
            const appointment = await appointment_service_js_1.appointmentService.bookAppointment({
                patientId,
                clinicId,
                slotId,
                bookingChannel: bookingChannel,
                notes
            });
            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully',
                data: appointment
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Failed to book appointment'
            });
        }
    }
    /**
     * GET /api/appointments/my
     */
    async getMyAppointments(req, res, next) {
        try {
            const phoneNumber = req.user?.phoneNumber;
            if (!phoneNumber) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const appointments = await appointment_service_js_1.appointmentService.getPatientAppointments(phoneNumber);
            res.status(200).json({ success: true, data: appointments });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * GET /api/clinician/queue/today
     */
    async getClinicianQueueToday(req, res, next) {
        try {
            const clinicId = req.query.clinicId;
            const date = req.query.date;
            const queueData = await appointment_service_js_1.appointmentService.getDailyQueue(clinicId, date);
            res.status(200).json({
                success: true,
                data: queueData
            });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * PATCH /api/appointments/:id/status
     */
    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status || !['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid status required: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW'
                });
            }
            const updated = await appointment_service_js_1.appointmentService.updateStatus(id, status);
            res.status(200).json({
                success: true,
                message: `Appointment marked as ${status}`,
                data: updated
            });
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
}
exports.AppointmentController = AppointmentController;
exports.appointmentController = new AppointmentController();
