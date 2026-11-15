"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_js_1 = require("../controllers/appointment.controller.js");
const auth_middleware_js_1 = require("../middlewares/auth.middleware.js");
const router = (0, express_1.Router)();
// Protected: Patient & Clinician
router.post('/book', auth_middleware_js_1.authenticateJwt, (req, res, next) => appointment_controller_js_1.appointmentController.bookAppointment(req, res, next));
router.get('/my', auth_middleware_js_1.authenticateJwt, (req, res, next) => appointment_controller_js_1.appointmentController.getMyAppointments(req, res, next));
// Clinician queue view
router.get('/clinician/queue/today', auth_middleware_js_1.authenticateJwt, (0, auth_middleware_js_1.requireRole)(['CLINICIAN', 'ADMIN']), (req, res, next) => appointment_controller_js_1.appointmentController.getClinicianQueueToday(req, res, next));
// Update status (e.g. COMPLETED, NO_SHOW, CANCELLED)
router.patch('/:id/status', auth_middleware_js_1.authenticateJwt, (0, auth_middleware_js_1.requireRole)(['CLINICIAN', 'ADMIN']), (req, res, next) => appointment_controller_js_1.appointmentController.updateStatus(req, res, next));
exports.default = router;
