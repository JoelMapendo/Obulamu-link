"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SmsService = void 0;
const index_js_1 = require("../config/index.js");
const prisma_js_1 = require("../utils/prisma.js");
const logger_js_1 = require("../utils/logger.js");
class SmsService {
    static instance;
    atSmsClient = null;
    constructor() {
        if (index_js_1.config.africasTalking.apiKey && index_js_1.config.africasTalking.apiKey !== 'sandbox') {
            try {
                // Dynamically import or load africastalking
                const AfricasTalking = require('africastalking');
                const at = AfricasTalking({
                    apiKey: index_js_1.config.africasTalking.apiKey,
                    username: index_js_1.config.africasTalking.username
                });
                this.atSmsClient = at.SMS;
                logger_js_1.logger.info("Africa's Talking SMS client initialized for user: " + index_js_1.config.africasTalking.username);
            }
            catch (err) {
                logger_js_1.logger.warn("Could not load Africa's Talking SDK, falling back to database logger simulator.");
            }
        }
        else {
            logger_js_1.logger.info("Africa's Talking running in sandbox/simulation mode. SMS will be logged to database and console.");
        }
    }
    static getInstance() {
        if (!SmsService.instance) {
            SmsService.instance = new SmsService();
        }
        return SmsService.instance;
    }
    /**
     * Send SMS via Africa's Talking or simulate in local environment
     */
    async sendSms(toPhoneNumber, message) {
        try {
            // Standardize phone number format (e.g. 0771234567 -> +256771234567)
            const formattedPhone = this.formatUgandanNumber(toPhoneNumber);
            let providerId = `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            if (this.atSmsClient) {
                try {
                    const result = await this.atSmsClient.send({
                        to: [formattedPhone],
                        message: message,
                        from: index_js_1.config.africasTalking.senderId || undefined
                    });
                    const recipient = result.SMSMessageData?.Recipients?.[0];
                    if (recipient && recipient.status === 'Success') {
                        providerId = recipient.messageId;
                    }
                }
                catch (apiErr) {
                    logger_js_1.logger.error("Africa's Talking API error:", apiErr.message);
                }
            }
            // Always log to database for audit trail & simulation UI
            await prisma_js_1.prisma.sMSLog.create({
                data: {
                    phoneNumber: formattedPhone,
                    message: message,
                    status: 'SENT',
                    providerId: providerId
                }
            });
            logger_js_1.logger.info(`[SMS SENT] -> To: ${formattedPhone} | Text: "${message}"`);
            return { success: true, messageId: providerId };
        }
        catch (err) {
            logger_js_1.logger.error('Failed to dispatch SMS:', err);
            return { success: false };
        }
    }
    formatUgandanNumber(phone) {
        const clean = phone.replace(/[^0-9+]/g, '');
        if (clean.startsWith('0')) {
            return `+256${clean.substring(1)}`;
        }
        if (clean.startsWith('256')) {
            return `+${clean}`;
        }
        if (!clean.startsWith('+')) {
            return `+${clean}`;
        }
        return clean;
    }
}
exports.SmsService = SmsService;
exports.smsService = SmsService.getInstance();
