export type Role = 'PATIENT' | 'CLINICIAN' | 'ADMIN';
export type Language = 'EN' | 'LG';
export type BookingChannel = 'ANDROID' | 'USSD' | 'WEB';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: Role;
  languagePref: Language;
}

export interface Clinic {
  id: string;
  name: string;
  location: string;
  department: string;
  dailyCapacity: number;
  openTime: string;
  closeTime: string;
}

export interface AppointmentSlot {
  id: string;
  clinicId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  bookedCount: number;
  availableCapacity?: number;
  isFull?: boolean;
}

export interface MedicationReminder {
  id: string;
  appointmentId?: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  reminderDate: string;
  reminderTime: string;
  channel: 'SMS' | 'PUSH';
  sentStatus: 'PENDING' | 'SENT' | 'FAILED';
  language: Language;
}

export interface Appointment {
  id: string;
  bookingReference: string;
  patientId: string;
  clinicId: string;
  slotId: string;
  bookingChannel: BookingChannel;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  clinic: Clinic;
  slot: AppointmentSlot;
  patient: {
    id: string;
    fullName: string;
    phoneNumber: string;
    languagePref: Language;
  };
  medicationReminders?: MedicationReminder[];
}

export interface SMSLog {
  id: string;
  phoneNumber: string;
  message: string;
  status: string;
  providerId?: string;
  createdAt: string;
}

