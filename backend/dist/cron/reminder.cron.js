"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeReminderCron = initializeReminderCron;
const node_cron_1 = __importDefault(require("node-cron"));
const reminder_service_js_1 = require("../services/reminder.service.js");
const logger_js_1 = require("../utils/logger.js");
function initializeReminderCron() {
    // Run every 15 minutes: '*/15 * * * *'
    node_cron_1.default.schedule('*/15 * * * *', async () => {
        try {
            logger_js_1.logger.info('[CRON] Executing scheduled 15-minute SMS reminder check...');
            await reminder_service_js_1.reminderService.processDueReminders();
        }
        catch (err) {
            logger_js_1.logger.error('[CRON ERROR] Failed during reminder cron execution:', err);
        }
    });
    logger_js_1.logger.info('[CRON] Obulamu-Link SMS reminder worker scheduled (runs every 15 minutes).');
}
