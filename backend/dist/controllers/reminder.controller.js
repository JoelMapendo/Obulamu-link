"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderController = exports.ReminderController = void 0;
const reminder_service_js_1 = require("../services/reminder.service.js");
const prisma_js_1 = require("../utils/prisma.js");
class ReminderController {
    /**
     * POST /api/reminders/create
     */
    async createReminder(req, res, next) {
        try {
            const { patientId, appointmentId, medicationName, dosage, reminderDate, reminderTime, channel } = req.body;
            if (!patientId || !medicationName || !dosage || !reminderDate) {
                return res.status(400).json({
                    success: false,
                    message: 'patientId, medicationName, dosage, and reminderDate are required'
                });
            }
            const reminder = await reminder_service_js_1.reminderService.createMedicationReminder({
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
        }
        catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
    /**
     * GET /api/reminders/patient/:patientId
     */
    async getPatientReminders(req, res, next) {
        try {
            const { patientId } = req.params;
            const reminders = await prisma_js_1.prisma.medicationReminder.findMany({
                where: { patientId },
                orderBy: { reminderDate: 'desc' }
            });
            res.status(200).json({ success: true, data: reminders });
        }
        catch (err) {
            next(err);
        }
    }
    /**
     * POST /api/reminders/trigger-cron
     * Allows manual triggering for testing and demo purposes
     */
    async triggerCron(req, res, next) {
        try {
            const result = await reminder_service_js_1.reminderService.processDueReminders();
            res.status(200).json({
                success: true,
                message: 'Manual reminder check executed',
                data: result
            });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}
exports.ReminderController = ReminderController;
exports.reminderController = new ReminderController();
