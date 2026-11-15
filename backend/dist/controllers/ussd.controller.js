"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ussdController = exports.UssdController = void 0;
const ussd_service_js_1 = require("../services/ussd.service.js");
const prisma_js_1 = require("../utils/prisma.js");
const logger_js_1 = require("../utils/logger.js");
class UssdController {
    /**
     * POST /api/ussd
     * Africa's Talking USSD Webhook Endpoint
     * Expects: sessionId, serviceCode, phoneNumber, text
     * Returns: text/plain response starting with CON or END
     */
    async handleUssd(req, res) {
        try {
            // Africa's Talking sends x-www-form-urlencoded or JSON
            const sessionId = req.body.sessionId || req.query.sessionId || `SES-${Date.now()}`;
            const serviceCode = req.body.serviceCode || req.query.serviceCode || '*284#';
            const phoneNumber = req.body.phoneNumber || req.query.phoneNumber || '+256700000001';
            const text = req.body.text !== undefined ? req.body.text : (req.query.text !== undefined ? req.query.text : '');
            const responseText = await ussd_service_js_1.ussdService.handleUssdRequest({
                sessionId: String(sessionId),
                serviceCode: String(serviceCode),
                phoneNumber: String(phoneNumber),
                text: String(text).trim()
            });
            logger_js_1.logger.ussd(String(sessionId), String(phoneNumber), String(text), responseText);
            res.setHeader('Content-Type', 'text/plain');
            return res.status(200).send(responseText);
        }
        catch (err) {
            logger_js_1.logger.error('USSD Webhook Controller Error:', err);
            res.setHeader('Content-Type', 'text/plain');
            return res.status(200).send('END System error occurred. Please try again later.');
        }
    }
    /**
     * GET /api/ussd/sms-logs
     * Allows the frontend UI to display sent SMS messages in real-time
     */
    async getSmsLogs(req, res) {
        try {
            const phoneNumber = req.query.phoneNumber;
            const logs = await prisma_js_1.prisma.sMSLog.findMany({
                where: phoneNumber ? { phoneNumber: { contains: phoneNumber.slice(-9) } } : undefined,
                orderBy: { createdAt: 'desc' },
                take: 30
            });
            return res.status(200).json({ success: true, data: logs });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
}
exports.UssdController = UssdController;
exports.ussdController = new UssdController();
