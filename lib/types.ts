export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'WAIVED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD';

export interface Therapist {
  id: string;
  name: string;
  email: string;
  color: string;
  bgColor: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  name: string;
  isActive: boolean;
}

export interface PlanType {
  id: string;
  name: string;
  sessionCount: number;
  price: number;
  description: string;
}

export interface Patient {
  id: string;
  name: string;
  dni: string;
  phone: string;
  email: string;
  birthDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  consultationReason: string;
  medicalBackground: string;
  referredBy: string;
  assignedTherapistId: string;
  createdAt: string;
}

export interface PatientPlan {
  id: string;
  patientId: string;
  planTypeId: string;
  totalSessions: number;
  usedSessions: number;
  totalPaid: number;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Appointment {
  id: string;
  patientId: string;
  therapistId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  patientPlanId: string | null;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentMethod: PaymentMethod | null;
  notes: string;
  whatsappReminderSent: boolean;
  whatsappDayOfSent: boolean;
}

export interface ClinicalNote {
  id: string;
  appointmentId: string;
  therapistId: string;
  sessionContent: string;
  observations: string;
  nextSessionPlan: string;
  createdAt: string;
}

export interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  template24h: string;
  templateDayOf: string;
}
