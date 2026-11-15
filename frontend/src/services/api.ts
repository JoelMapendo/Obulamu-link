import { Clinic, AppointmentSlot, Appointment, User, SMSLog } from '../types/index.js';

const API_BASE = '/api';

export class ApiService {
  private static token: string | null = localStorage.getItem('obulamu_token');

  static setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('obulamu_token', token);
    } else {
      localStorage.removeItem('obulamu_token');
    }
  }

  static getToken(): string | null {
    return this.token;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Server communication error' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth Endpoints
  static async login(phoneNumber: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ success: boolean; data: { token: string; user: User } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, password })
    });
    this.setToken(res.data.token);
    return res.data;
  }

  static async register(data: { phoneNumber: string; password: string; fullName: string; role?: string; languagePref?: string }) {
    return this.request<{ success: boolean; data: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const res = await this.request<{ success: boolean; data: User }>('/auth/me');
      return res.data;
    } catch {
      return null;
    }
  }

  // Clinic & Slots
  static async getClinics(): Promise<Clinic[]> {
    const res = await this.request<{ success: boolean; data: Clinic[] }>('/clinics');
    return res.data;
  }

  static async getSlots(clinicId: string, date: string): Promise<AppointmentSlot[]> {
    const res = await this.request<{ success: boolean; data: AppointmentSlot[] }>(`/clinics/slots?clinicId=${clinicId}&date=${date}`);
    return res.data;
  }

  // Appointments
  static async bookAppointment(data: { clinicId: string; slotId: string; notes?: string; bookingChannel?: string }): Promise<Appointment> {
    const res = await this.request<{ success: boolean; data: Appointment }>('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  static async getMyAppointments(): Promise<Appointment[]> {
    const res = await this.request<{ success: boolean; data: Appointment[] }>('/appointments/my');
    return res.data;
  }

  static async getClinicianQueue(clinicId?: string, date?: string) {
    const query = new URLSearchParams();
    if (clinicId) query.append('clinicId', clinicId);
    if (date) query.append('date', date);

    const res = await this.request<{
      success: boolean;
      data: {
        date: string;
        totalCount: number;
        hourlyDistribution: Array<{ timeWindow: string; total: number; completed: number; scheduled: number }>;
        appointments: Appointment[];
      };
    }>(`/appointments/clinician/queue/today?${query.toString()}`);
    return res.data;
  }

  static async updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
    const res = await this.request<{ success: boolean; data: Appointment }>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.data;
  }

  // Reminders
  static async createReminder(data: {
    patientId: string;
    appointmentId?: string;
    medicationName: string;
    dosage: string;
    reminderDate: string;
    reminderTime?: string;
  }) {
    return this.request('/reminders/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async triggerReminderCron() {
    return this.request('/reminders/trigger-cron', {
      method: 'POST'
    });
  }

  // USSD Simulation & SMS Logs
  static async postUssd(sessionId: string, phoneNumber: string, text: string): Promise<string> {
    const response = await fetch(`${API_BASE}/ussd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        sessionId,
        serviceCode: '*284#',
        phoneNumber,
        text
      })
    });
    return response.text();
  }

  static async getSmsLogs(phoneNumber?: string): Promise<SMSLog[]> {
    const query = phoneNumber ? `?phoneNumber=${encodeURIComponent(phoneNumber)}` : '';
    const res = await this.request<{ success: boolean; data: SMSLog[] }>(`/ussd/sms-logs${query}`);
    return res.data;
  }
}

