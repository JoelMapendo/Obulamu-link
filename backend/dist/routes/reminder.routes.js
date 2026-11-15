"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reminder_controller_js_1 = require("../controllers/reminder.controller.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
// Clinician schedules medication reminders
router.post('/create', auth_middleware_js_1.authenticateJwt, (0, auth_middleware_js_1.requireRole)(['CLINICIAN', 'ADMIN']), (req, res, next) => reminder_controller_js_1.reminderController.createReminder(req, res, next));
router.get('/patient/:patientId', auth_middleware_js_1.authenticateJwt, (req, res, next) => reminder_controller_js_1.reminderController.getPatientReminders(req, res, next));
// Manual trigger for testing cron job
router.post('/trigger-cron', auth_middleware_js_1.authenticateJwt, (req, res, next) => reminder_controller_js_1.reminderController.triggerCron(req, res, next));
exports.default = router;
