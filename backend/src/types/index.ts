export type Role = 'PATIENT' | 'CLINICIAN' | 'ADMIN';
export type Language = 'EN' | 'LG' | 'SW';
export type BookingChannel = 'ANDROID' | 'USSD' | 'WEB';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type ReminderChannel = 'SMS' | 'PUSH';
export type SentStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface AfricasTalkingUssdPayload {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

export interface UssdSessionData {
  language?: Language;
  selectedClinicId?: string;
  selectedDate?: string;
  selectedSlotId?: string;
  selectedDepartment?: string;
  patientName?: string;
  action?: 'BOOK' | 'VIEW' | 'CANCEL' | 'LANG';
  step?: string;
}

export interface AuthUserPayload {
  id: string;
  phoneNumber: string;
  role: Role;
  fullName: string;
  languagePref: Language;
}
