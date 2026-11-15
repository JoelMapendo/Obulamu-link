"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentService = exports.AppointmentService = void 0;
const prisma_js_1 = require("../utils/prisma.js");
const logger_js_1 = require("../utils/logger.js");
const sms_service_js_1 = require("./sms.service.js");
const index_js_1 = require("../localization/index.js");
class AppointmentService {
    /**
     * Book an appointment with strict atomic concurrency control to prevent over-allocation.
     */
    async bookAppointment(params) {
        const { patientId, clinicId, slotId, bookingChannel, notes } = params;
        // Use Prisma interactive transaction for atomic isolation
        return await prisma_js_1.prisma.$transaction(async (tx) => {
            // 1. Fetch slot with current booked count
            const slot = await tx.appointmentSlot.findUnique({
                where: { id: slotId },
                include: { clinic: true }
            });
            if (!slot) {
                throw new Error('Appointment slot not found.');
            }
            if (slot.clinicId !== clinicId) {
                throw new Error('Slot does not belong to the selected clinic.');
            }
            // Check capacity
            if (slot.bookedCount >= slot.maxPatients) {
                throw new Error('This time slot is completely booked. Please select another slot.');
            }
            // Fetch patient for phone number and language
            const patient = await tx.user.findUnique({
                where: { id: patientId }
            });
            if (!patient) {
                throw new Error('Patient not found.');
            }
            // Generate a human-friendly booking reference (e.g. OBL-4829)
            const bookingRef = `OBL-${Math.floor(1000 + Math.random() * 9000)}`;
            // 2. Increment booked count atomically with condition
            const updatedSlot = await tx.appointmentSlot.update({
                where: {
                    id: slotId,
                    version: slot.version // Optimistic lock condition
                },
                data: {
                    bookedCount: { increment: 1 },
                    version: { increment: 1 }
                }
            });
            if (updatedSlot.bookedCount > updatedSlot.maxPatients) {
                // Rollback condition
                throw new Error('Slot exceeded capacity during race condition check.');
            }
            // 3. Create Appointment Record
            const appointment = await tx.appointment.create({
                data: {
                    bookingReference: bookingRef,
                    patientId,
                    clinicId,
                    slotId,
                    bookingChannel,
                    status: 'SCHEDULED',
                    notes
                },
                include: {
                    clinic: true,
                    slot: true,
                    patient: true
                }
            });
            // 4. Send Confirmation SMS
            const lang = (patient.languagePref || 'EN');
            const smsMessage = index_js_1.i18n.t('smsBookingConfirmation', lang, {
                clinic: slot.clinic.name,
                dept: slot.clinic.department,
                date: slot.slotDate,
                time: `${slot.startTime} - ${slot.endTime}`,
                id: bookingRef
            });
            // Asynchronously trigger SMS without blocking transaction commit
            setImmediate(() => {
                sms_service_js_1.smsService.sendSms(patient.phoneNumber, smsMessage).catch(err => {
                    logger_js_1.logger.error('Error dispatching booking confirmation SMS:', err);
                });
            });
            logger_js_1.logger.info(`Appointment booked: ${bookingRef} for patient ${patient.phoneNumber} at ${slot.clinic.name}`);
            return appointment;
        });
    }
    /**
     * Get available slots for a specific clinic and date
     */
    async getAvailableSlots(clinicId, date) {
        const slots = await prisma_js_1.prisma.appointmentSlot.findMany({
            where: {
                clinicId,
                slotDate: date
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        return slots.map(slot => ({
            ...slot,
            availableCapacity: Math.max(0, slot.maxPatients - slot.bookedCount),
            isFull: slot.bookedCount >= slot.maxPatients
        }));
    }
    /**
     * Get daily patient queue for healthcare workers, grouped and ordered by hour
     */
    async getDailyQueue(clinicId, date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const whereClause = {
            slot: {
                slotDate: targetDate
            }
        };
        if (clinicId) {
            whereClause.clinicId = clinicId;
        }
        const appointments = await prisma_js_1.prisma.appointment.findMany({
            where: whereClause,
            include: {
                patient: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                        languagePref: true
                    }
                },
                clinic: true,
                slot: true,
                medicationReminders: true
            },
            orderBy: [
                { slot: { startTime: 'asc' } },
                { createdAt: 'asc' }
            ]
        });
        // Compute hourly distribution statistics
        const hourlyDistribution = {};
        appointments.forEach(app => {
            const window = `${app.slot.startTime} - ${app.slot.endTime}`;
            if (!hourlyDistribution[window]) {
                hourlyDistribution[window] = { timeWindow: window, total: 0, completed: 0, scheduled: 0 };
            }
            hourlyDistribution[window].total += 1;
            if (app.status === 'COMPLETED') {
                hourlyDistribution[window].completed += 1;
            }
            else if (app.status === 'SCHEDULED') {
                hourlyDistribution[window].scheduled += 1;
            }
        });
        return {
            date: targetDate,
            totalCount: appointments.length,
            hourlyDistribution: Object.values(hourlyDistribution),
            appointments
        };
    }
    /**
     * Update appointment status (COMPLETED, NO_SHOW, CANCELLED)
     */
    async updateStatus(appointmentId, status) {
        const appointment = await prisma_js_1.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { slot: true }
        });
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        // If cancelling, decrement the booked count
        if (status === 'CANCELLED' && appointment.status !== 'CANCELLED') {
            await prisma_js_1.prisma.appointmentSlot.update({
                where: { id: appointment.slotId },
                data: {
                    bookedCount: { decrement: 1 }
                }
            });
        }
        return await prisma_js_1.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status }
        });
    }
    /**
     * Look up upcoming appointments for a patient by phone number
     */
    async getPatientAppointments(phoneNumber) {
        return await prisma_js_1.prisma.appointment.findMany({
            where: {
                patient: {
                    phoneNumber: phoneNumber
                },
                status: 'SCHEDULED'
            },
            include: {
                clinic: true,
                slot: true
            },
            orderBy: {
                slot: {
                    slotDate: 'asc'
                }
            }
        });
    }
}
exports.AppointmentService = AppointmentService;
exports.appointmentService = new AppointmentService();
