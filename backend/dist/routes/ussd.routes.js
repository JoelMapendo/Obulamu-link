"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ussd_controller_js_1 = require("../controllers/ussd.controller.js");
const router = (0, express_1.Router)();
// Africa's Talking USSD Webhook (supports GET and POST for testing flexibility)
router.post('/', (req, res) => ussd_controller_js_1.ussdController.handleUssd(req, res));
router.get('/', (req, res) => ussd_controller_js_1.ussdController.handleUssd(req, res));
// Outbound SMS logs stream for real-time simulator view
router.get('/sms-logs', (req, res) => ussd_controller_js_1.ussdController.getSmsLogs(req, res));
exports.default = router;
