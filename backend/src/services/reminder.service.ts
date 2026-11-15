import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { smsService } from './sms.service.js';
import { i18n } from '../localization/index.js';
import { Language, ReminderChannel } from '../types/index.js';

export class ReminderService {
  /**
   * Clinician creates automated medication reminders for a patient
   */
  async createMedicationReminder(params: {
    patientId: string;
    appointmentId?: string;
    medicationName: string;
    dosage: string;
    reminderDate: string;
    reminderTime?: string;
    channel?: ReminderChannel;
  }) {
    const {
      patientId,
      appointmentId,
      medicationName,
      dosage,
      reminderDate,
      reminderTime = '08:00',
      channel = 'SMS'
    } = params;

    const patient = await prisma.user.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const reminder = await prisma.medicationReminder.create({
      data: {
        patientId,
        appointmentId,
        medicationName,
        dosage,
        reminderDate,
        reminderTime,
        channel,
        language: patient.languagePref,
        sentStatus: 'PENDING'
      }
    });

    logger.info(`Medication reminder created for patient ${patient.phoneNumber}: ${medicationName} (${dosage}) on ${reminderDate}`);
    return reminder;
  }

  /**
   * Process all due appointment reminders (e.g. 24h prior) and medication alerts
   */
  async processDueReminders() {
    logger.info('Running automated SMS reminder dispatcher...');
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Calculate tomorrow date string for 24-hour appointment reminders
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let processedAppointments = 0;
    let processedMedications = 0;

    // 1. Process 24-Hour Appointment Reminders
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        reminderSent: false,
        status: 'SCHEDULED',
        slot: {
          slotDate: tomorrowStr
        }
      },
      include: {
        patient: true,
        clinic: true,
        slot: true
      }
    });

    for (const app of upcomingAppointments) {
      try {
        const lang = (app.patient.languagePref || 'EN') as Language;
        const msg = i18n.t('sms24HourReminder', lang, {
          clinic: app.clinic.name,
          date: app.slot.slotDate,
          time: `${app.slot.startTime} - ${app.slot.endTime}`
        });

        await smsService.sendSms(app.patient.phoneNumber, msg);
        await prisma.appointment.update({
          where: { id: app.id },
          data: { reminderSent: true }
        });
        processedAppointments++;
      } catch (err) {
        logger.error(`Failed to process appointment reminder for ${app.id}:`, err);
      }
    }

    // 2. Process Pending Medication Reminders for Today
    const dueMedications = await prisma.medicationReminder.findMany({
      where: {
        sentStatus: 'PENDING',
        reminderDate: {
          lte: todayStr
        }
      },
      include: {
        patient: true
      }
    });

    for (const med of dueMedications) {
      try {
        const lang = (med.language || med.patient.languagePref || 'EN') as Language;
        const msg = i18n.t('smsMedicationReminder', lang, {
          medication: med.medicationName,
          dosage: med.dosage
        });

        const res = await smsService.sendSms(med.patient.phoneNumber, msg);
        await prisma.medicationReminder.update({
          where: { id: med.id },
          data: { sentStatus: res.success ? 'SENT' : 'FAILED' }
        });
        processedMedications++;
      } catch (err) {
        logger.error(`Failed to process medication reminder for ${med.id}:`, err);
      }
    }

    logger.info(`Reminder dispatch complete: ${processedAppointments} appointment alerts, ${processedMedications} medication alerts.`);
    return {
      processedAppointments,
      processedMedications
    };
  }
}

export const reminderService = new ReminderService();

