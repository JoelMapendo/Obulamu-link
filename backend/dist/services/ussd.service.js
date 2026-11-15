"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ussdService = exports.UssdService = void 0;
const prisma_js_1 = require("../utils/prisma.js");
const logger_js_1 = require("../utils/logger.js");
const appointment_service_js_1 = require("./appointment.service.js");
const index_js_1 = require("../localization/index.js");
class UssdService {
    /**
     * Main USSD Webhook Handler for Africa's Talking
     */
    async handleUssdRequest(payload) {
        const { sessionId, phoneNumber, text } = payload;
        const cleanPhone = this.formatPhoneNumber(phoneNumber);
        // 1. Get or create patient profile to fetch language preference
        let patient = await prisma_js_1.prisma.user.findUnique({
            where: { phoneNumber: cleanPhone }
        });
        if (!patient) {
            patient = await prisma_js_1.prisma.user.create({
                data: {
                    phoneNumber: cleanPhone,
                    fullName: `Patient ${cleanPhone.slice(-4)}`,
                    passwordHash: 'USSD_AUTO_GENERATED',
                    role: 'PATIENT',
                    languagePref: 'EN'
                }
            });
        }
        const lang = patient.languagePref || 'EN';
        const inputs = text.split('*').filter(t => t.trim().length > 0);
        const depth = inputs.length;
        logger_js_1.logger.info(`USSD Request: Phone=${cleanPhone}, InputPath=[${inputs.join(' > ')}], Depth=${depth}`);
        // Level 0: Welcome / Root Menu
        if (depth === 0) {
            return index_js_1.i18n.t('welcome', lang);
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
        return index_js_1.i18n.t('invalidInput', lang) + index_js_1.i18n.t('welcome', lang);
    }
    /**
     * Booking Flow:
     * Level 1: Select Department (OPD, ART, Antenatal)
     * Level 2: Select Clinic Facility
     * Level 3: Select Date (Next 3 days)
     * Level 4: Select Hourly Time Slot (08:00 - 09:00, 09:00 - 10:00, ...)
     * Level 5: Confirmation and Booking Creation
     */
    async handleBookingFlow(inputs, patient, lang) {
        const depth = inputs.length;
        // Sub-level 1: Select Department
        if (depth === 1) {
            return index_js_1.i18n.t('selectDepartment', lang);
        }
        const deptMap = {
            '1': 'General Outpatient',
            '2': 'Chronic Care / ART Clinic',
            '3': 'Antenatal Care'
        };
        const selectedDept = deptMap[inputs[1]];
        if (!selectedDept) {
            return index_js_1.i18n.t('invalidInput', lang) + index_js_1.i18n.t('selectDepartment', lang);
        }
        // Sub-level 2: Select Clinic Facility offering this department
        const clinics = await prisma_js_1.prisma.clinic.findMany({
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
                const allClinics = await prisma_js_1.prisma.clinic.findMany({ take: 4 });
                let menu = index_js_1.i18n.t('selectClinic', lang);
                allClinics.forEach((c, idx) => {
                    menu += `${idx + 1}. ${c.name} (${c.location})\n`;
                });
                return menu.trim();
            }
            let menu = index_js_1.i18n.t('selectClinic', lang);
            clinics.forEach((c, idx) => {
                menu += `${idx + 1}. ${c.name}\n`;
            });
            return menu.trim();
        }
        const clinicIndex = parseInt(inputs[2], 10) - 1;
        const targetClinics = clinics.length > 0 ? clinics : await prisma_js_1.prisma.clinic.findMany({ take: 4 });
        const selectedClinic = targetClinics[clinicIndex];
        if (!selectedClinic) {
            return index_js_1.i18n.t('invalidInput', lang) + index_js_1.i18n.t('selectClinic', lang);
        }
        // Sub-level 3: Select Date (Offer 3 available dates: Today, Tomorrow, Day After Tomorrow)
        const availableDates = this.getNextDays(3);
        if (depth === 3) {
            let menu = index_js_1.i18n.t('selectDate', lang);
            availableDates.forEach((d, idx) => {
                menu += `${idx + 1}. ${d.label} (${d.formatted})\n`;
            });
            return menu.trim();
        }
        const dateIndex = parseInt(inputs[3], 10) - 1;
        const selectedDate = availableDates[dateIndex];
        if (!selectedDate) {
            return index_js_1.i18n.t('invalidInput', lang) + index_js_1.i18n.t('selectDate', lang);
        }
        // Sub-level 4: Select Hourly Time Slot Allocation
        const availableSlots = await appointment_service_js_1.appointmentService.getAvailableSlots(selectedClinic.id, selectedDate.dateString);
        if (depth === 4) {
            if (availableSlots.length === 0) {
                return index_js_1.i18n.t('noSlotsAvailable', lang);
            }
            let menu = index_js_1.i18n.t('selectSlot', lang);
            availableSlots.slice(0, 5).forEach((slot, idx) => {
                const spotsLeft = slot.maxPatients - slot.bookedCount;
                menu += `${idx + 1}. ${slot.startTime} - ${slot.endTime} (${spotsLeft} left)\n`;
            });
            return menu.trim();
        }
        const slotIndex = parseInt(inputs[4], 10) - 1;
        const selectedSlot = availableSlots[slotIndex];
        if (!selectedSlot) {
            return index_js_1.i18n.t('invalidInput', lang) + index_js_1.i18n.t('selectSlot', lang);
        }
        // Sub-level 5: Final Execution (Atomic Reservation)
        try {
            const bookedAppointment = await appointment_service_js_1.appointmentService.bookAppointment({
                patientId: patient.id,
                clinicId: selectedClinic.id,
                slotId: selectedSlot.id,
                bookingChannel: 'USSD',
                notes: `USSD Booking: ${selectedDept}`
            });
            return index_js_1.i18n.t('bookingConfirmed', lang, {
                date: selectedDate.formatted,
                time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
                clinic: selectedClinic.name,
                id: bookedAppointment.bookingReference
            });
        }
        catch (err) {
            logger_js_1.logger.error('Error during USSD booking execution:', err);
            return index_js_1.i18n.t('bookingError', lang);
        }
    }
    /**
     * View Scheduled Visits Flow
     */
    async handleViewVisitsFlow(inputs, phone, lang) {
        const appointments = await appointment_service_js_1.appointmentService.getPatientAppointments(phone);
        if (appointments.length === 0) {
            return index_js_1.i18n.t('noAppointmentsFound', lang);
        }
        if (inputs.length === 1) {
            let list = '';
            appointments.slice(0, 3).forEach((app, idx) => {
                list += `${idx + 1}. ${app.bookingReference}: ${app.clinic.name}\n   ${app.slot.slotDate} (${app.slot.startTime})\n`;
            });
            return index_js_1.i18n.t('yourAppointments', lang, { list: list.trim() });
        }
        if (inputs[1] === '0') {
            return index_js_1.i18n.t('welcome', lang);
        }
        return index_js_1.i18n.t('sessionEnded', lang);
    }
    /**
     * Reschedule / Cancel Flow
     */
    async handleCancellationFlow(inputs, phone, lang) {
        const appointments = await appointment_service_js_1.appointmentService.getPatientAppointments(phone);
        if (appointments.length === 0) {
            return index_js_1.i18n.t('noAppointmentsFound', lang);
        }
        if (inputs.length === 1) {
            let list = '';
            appointments.slice(0, 3).forEach((app, idx) => {
                list += `${idx + 1}. Cancel ${app.bookingReference} (${app.slot.slotDate} ${app.slot.startTime})\n`;
            });
            return index_js_1.i18n.t('cancelSelect', lang, { list: list.trim() });
        }
        const selectIdx = parseInt(inputs[1], 10) - 1;
        const targetAppointment = appointments[selectIdx];
        if (!targetAppointment) {
            return index_js_1.i18n.t('cancelFailed', lang);
        }
        try {
            await appointment_service_js_1.appointmentService.updateStatus(targetAppointment.id, 'CANCELLED');
            return index_js_1.i18n.t('cancelConfirmed', lang, { id: targetAppointment.bookingReference });
        }
        catch (err) {
            return index_js_1.i18n.t('cancelFailed', lang);
        }
    }
    /**
     * Change Language Flow (English or Luganda)
     */
    async handleLanguageFlow(inputs, patient) {
        if (inputs.length === 1) {
            return index_js_1.i18n.t('selectLanguage', 'EN');
        }
        const choice = inputs[1];
        let newLang = 'EN';
        if (choice === '2') {
            newLang = 'LG';
        }
        else if (choice === '3') {
            newLang = 'SW';
        }
        await prisma_js_1.prisma.user.update({
            where: { id: patient.id },
            data: { languagePref: newLang }
        });
        return index_js_1.i18n.t('languageUpdated', newLang);
    }
    getNextDays(count) {
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
    formatPhoneNumber(phone) {
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
exports.UssdService = UssdService;
exports.ussdService = new UssdService();
