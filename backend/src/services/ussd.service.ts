import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { appointmentService } from './appointment.service.js';
import { i18n } from '../localization/index.js';
import { Language, AfricasTalkingUssdPayload } from '../types/index.js';

export class UssdService {
  /**
   * Main USSD Webhook Handler for Africa's Talking
   */
  async handleUssdRequest(payload: AfricasTalkingUssdPayload): Promise<string> {
    const { sessionId, phoneNumber, text } = payload;
    const cleanPhone = this.formatPhoneNumber(phoneNumber);

    // 1. Get or create patient profile to fetch language preference
    let patient = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    if (!patient) {
      patient = await prisma.user.create({
        data: {
          phoneNumber: cleanPhone,
          fullName: `Patient ${cleanPhone.slice(-4)}`,
          passwordHash: 'USSD_AUTO_GENERATED',
          role: 'PATIENT',
          languagePref: 'EN'
        }
      });
    }

    const lang: Language = (patient.languagePref as Language) || 'EN';
    const inputs = text.split('*').filter(t => t.trim().length > 0);
    const depth = inputs.length;

    logger.info(`USSD Request: Phone=${cleanPhone}, InputPath=[${inputs.join(' > ')}], Depth=${depth}`);

    // Level 0: Welcome / Root Menu
    if (depth === 0) {
      return i18n.t('welcome', lang);
    }

    const rootChoice = inputs[0];

    // ROUTE 1: BOOK APPOINTMENT
    if (rootChoice === '1') {
      return await this.handleBookingFlow(inputs, patient, lang);
    }

    // ROUTE 2: VIEW SCHEDULED VISITS
    if (rootChoice === '2') {
      return await this.handleViewVisitsFlow(inputs, cleanPhone, lang);
    }

    // ROUTE 3: RESCHEDULE / CANCEL
    if (rootChoice === '3') {
      return await this.handleCancellationFlow(inputs, cleanPhone, lang);
    }

    // ROUTE 4: SELECT LANGUAGE (English / Luganda)
    if (rootChoice === '4') {
      return await this.handleLanguageFlow(inputs, patient);
    }

    return i18n.t('invalidInput', lang) + i18n.t('welcome', lang);
  }

  /**
   * Booking Flow:
   * Level 1: Select Department (OPD, ART, Antenatal)
   * Level 2: Select Clinic Facility
   * Level 3: Select Date (Next 3 days)
   * Level 4: Select Hourly Time Slot (08:00 - 09:00, 09:00 - 10:00, ...)
   * Level 5: Confirmation and Booking Creation
   */
  private async handleBookingFlow(inputs: string[], patient: any, lang: Language): Promise<string> {
    const depth = inputs.length;

    // Sub-level 1: Select Department
    if (depth === 1) {
      return i18n.t('selectDepartment', lang);
    }

    const deptMap: Record<string, string> = {
      '1': 'General Outpatient',
      '2': 'Chronic Care / ART Clinic',
      '3': 'Antenatal Care'
    };
    const selectedDept = deptMap[inputs[1]];
    if (!selectedDept) {
      return i18n.t('invalidInput', lang) + i18n.t('selectDepartment', lang);
    }

    // Sub-level 2: Select Clinic Facility offering this department
    const clinics = await prisma.clinic.findMany({
      where: {
        department: {
          contains: selectedDept === 'Chronic Care / ART Clinic' ? 'ART' : (selectedDept === 'Antenatal Care' ? 'Antenatal' : 'General')
        }
      },
      take: 4
    });

    if (depth === 2) {
      if (clinics.length === 0) {
        // Fallback to all clinics
        const allClinics = await prisma.clinic.findMany({ take: 4 });
        let menu = i18n.t('selectClinic', lang);
        allClinics.forEach((c, idx) => {
          menu += `${idx + 1}. ${c.name} (${c.location})\n`;
        });
        return menu.trim();
      }

      let menu = i18n.t('selectClinic', lang);
      clinics.forEach((c, idx) => {
        menu += `${idx + 1}. ${c.name}\n`;
      });
      return menu.trim();
    }

    const clinicIndex = parseInt(inputs[2], 10) - 1;
    const targetClinics = clinics.length > 0 ? clinics : await prisma.clinic.findMany({ take: 4 });
    const selectedClinic = targetClinics[clinicIndex];

    if (!selectedClinic) {
      return i18n.t('invalidInput', lang) + i18n.t('selectClinic', lang);
    }

    // Sub-level 3: Select Date (Offer 3 available dates: Today, Tomorrow, Day After Tomorrow)
    const availableDates = this.getNextDays(3);

    if (depth === 3) {
      let menu = i18n.t('selectDate', lang);
      availableDates.forEach((d, idx) => {
        menu += `${idx + 1}. ${d.label} (${d.formatted})\n`;
      });
      return menu.trim();
    }

    const dateIndex = parseInt(inputs[3], 10) - 1;
    const selectedDate = availableDates[dateIndex];
    if (!selectedDate) {
      return i18n.t('invalidInput', lang) + i18n.t('selectDate', lang);
    }

    // Sub-level 4: Select Hourly Time Slot Allocation
    const availableSlots = await appointmentService.getAvailableSlots(selectedClinic.id, selectedDate.dateString);

    if (depth === 4) {
      if (availableSlots.length === 0) {
        return i18n.t('noSlotsAvailable', lang);
      }

      let menu = i18n.t('selectSlot', lang);
      availableSlots.slice(0, 5).forEach((slot, idx) => {
        const spotsLeft = slot.maxPatients - slot.bookedCount;
        menu += `${idx + 1}. ${slot.startTime} - ${slot.endTime} (${spotsLeft} left)\n`;
      });
      return menu.trim();
    }

    const slotIndex = parseInt(inputs[4], 10) - 1;
    const selectedSlot = availableSlots[slotIndex];

    if (!selectedSlot) {
      return i18n.t('invalidInput', lang) + i18n.t('selectSlot', lang);
    }

    // Sub-level 5: Final Execution (Atomic Reservation)
    try {
      const bookedAppointment = await appointmentService.bookAppointment({
        patientId: patient.id,
        clinicId: selectedClinic.id,
        slotId: selectedSlot.id,
        bookingChannel: 'USSD',
        notes: `USSD Booking: ${selectedDept}`
      });

      return i18n.t('bookingConfirmed', lang, {
        date: selectedDate.formatted,
        time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
        clinic: selectedClinic.name,
        id: bookedAppointment.bookingReference
      });
    } catch (err: any) {
      logger.error('Error during USSD booking execution:', err);
      return i18n.t('bookingError', lang);
    }
  }

  /**
   * View Scheduled Visits Flow
   */
  private async handleViewVisitsFlow(inputs: string[], phone: string, lang: Language): Promise<string> {
    const appointments = await appointmentService.getPatientAppointments(phone);

    if (appointments.length === 0) {
      return i18n.t('noAppointmentsFound', lang);
    }

    if (inputs.length === 1) {
      let list = '';
      appointments.slice(0, 3).forEach((app, idx) => {
        list += `${idx + 1}. ${app.bookingReference}: ${app.clinic.name}\n   ${app.slot.slotDate} (${app.slot.startTime})\n`;
      });
      return i18n.t('yourAppointments', lang, { list: list.trim() });
    }

    if (inputs[1] === '0') {
      return i18n.t('welcome', lang);
    }

    return i18n.t('sessionEnded', lang);
  }

  /**
   * Reschedule / Cancel Flow
   */
  private async handleCancellationFlow(inputs: string[], phone: string, lang: Language): Promise<string> {
    const appointments = await appointmentService.getPatientAppointments(phone);

    if (appointments.length === 0) {
      return i18n.t('noAppointmentsFound', lang);
    }

    if (inputs.length === 1) {
      let list = '';
      appointments.slice(0, 3).forEach((app, idx) => {
        list += `${idx + 1}. Cancel ${app.bookingReference} (${app.slot.slotDate} ${app.slot.startTime})\n`;
      });
      return i18n.t('cancelSelect', lang, { list: list.trim() });
    }

    const selectIdx = parseInt(inputs[1], 10) - 1;
    const targetAppointment = appointments[selectIdx];

    if (!targetAppointment) {
      return i18n.t('cancelFailed', lang);
    }

    try {
      await appointmentService.updateStatus(targetAppointment.id, 'CANCELLED');
      return i18n.t('cancelConfirmed', lang, { id: targetAppointment.bookingReference });
    } catch (err) {
      return i18n.t('cancelFailed', lang);
    }
  }

  /**
   * Change Language Flow (English or Luganda)
   */
  private async handleLanguageFlow(inputs: string[], patient: any): Promise<string> {
    if (inputs.length === 1) {
      return i18n.t('selectLanguage', 'EN');
    }

    const choice = inputs[1];
    let newLang: Language = 'EN';
    if (choice === '2') {
      newLang = 'LG';
    } else if (choice === '3') {
      newLang = 'SW';
    }

    await prisma.user.update({
      where: { id: patient.id },
      data: { languagePref: newLang }
    });

    return i18n.t('languageUpdated', newLang);
  }

  private getNextDays(count: number) {
    const days = [];
    const today = new Date();

    for (let i = 0; i < count; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' }));
      const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      days.push({
        dateString: iso,
        label,
        formatted
      });
    }
    return days;
  }

  private formatPhoneNumber(phone: string): string {
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

export const ussdService = new UssdService();

