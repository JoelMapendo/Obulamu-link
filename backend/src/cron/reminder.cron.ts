import cron from 'node-cron';
import { reminderService } from '../services/reminder.service.js';
import { logger } from '../utils/logger.js';

export function initializeReminderCron() {
  // Run every 15 minutes: '*/15 * * * *'
  cron.schedule('*/15 * * * *', async () => {
    try {
      logger.info('[CRON] Executing scheduled 15-minute SMS reminder check...');
      await reminderService.processDueReminders();
    } catch (err) {
      logger.error('[CRON ERROR] Failed during reminder cron execution:', err);
    }
  });

  logger.info('[CRON] Obulamu-Link SMS reminder worker scheduled (runs every 15 minutes).');
}

