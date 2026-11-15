import { config } from '../config/index.js';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';

export class SmsService {
  private static instance: SmsService;
  private atSmsClient: any = null;

  private constructor() {
    if (config.africasTalking.apiKey && config.africasTalking.apiKey !== 'sandbox') {
      try {
        // Dynamically import or load africastalking
        const AfricasTalking = require('africastalking');
        const at = AfricasTalking({
          apiKey: config.africasTalking.apiKey,
          username: config.africasTalking.username
        });
        this.atSmsClient = at.SMS;
        logger.info("Africa's Talking SMS client initialized for user: " + config.africasTalking.username);
      } catch (err) {
        logger.warn("Could not load Africa's Talking SDK, falling back to database logger simulator.");
      }
    } else {
      logger.info("Africa's Talking running in sandbox/simulation mode. SMS will be logged to database and console.");
    }
  }

  public static getInstance(): SmsService {
    if (!SmsService.instance) {
      SmsService.instance = new SmsService();
    }
    return SmsService.instance;
  }

  /**
   * Send SMS via Africa's Talking or simulate in local environment
   */
  async sendSms(toPhoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Standardize phone number format (e.g. 0771234567 -> +256771234567)
      const formattedPhone = this.formatUgandanNumber(toPhoneNumber);

      let providerId = `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      if (this.atSmsClient) {
        try {
          const result = await this.atSmsClient.send({
            to: [formattedPhone],
            message: message,
            from: config.africasTalking.senderId || undefined
          });
          const recipient = result.SMSMessageData?.Recipients?.[0];
          if (recipient && recipient.status === 'Success') {
            providerId = recipient.messageId;
          }
        } catch (apiErr: any) {
          logger.error("Africa's Talking API error:", apiErr.message);
        }
      }

      // Always log to database for audit trail & simulation UI
      await prisma.sMSLog.create({
        data: {
          phoneNumber: formattedPhone,
          message: message,
          status: 'SENT',
          providerId: providerId
        }
      });

      logger.info(`[SMS SENT] -> To: ${formattedPhone} | Text: "${message}"`);
      return { success: true, messageId: providerId };
    } catch (err: any) {
      logger.error('Failed to dispatch SMS:', err);
      return { success: false };
    }
  }

  private formatUgandanNumber(phone: string): string {
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

export const smsService = SmsService.getInstance();

