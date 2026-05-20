export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED_24H' | 'CONFIRMED_TODAY' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'WAIVED';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'YAPE' | 'PLIN';
export type TreatmentApplied = 'si' | 'no' | 'otros' | '';
export type TractionType = 'cervical' | 'lumbar' | 'otros' | '';

export interface Therapist {
  id: string;
  name: string;
  email: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  startHour: number;
  endHour: number;
  lunchStart: number;
  lunchEnd: number;
  workingDays: number[];
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
  birthDate: string;
  address: string;
  occupation: string;
  weight: number;
  height: number;
  phone: string;
  email: string;
  consultationReason: string;
  previousTreatments: boolean;
  previousTreatmentsDetail: string;
  exams: string;
  allergies: string;
  isPregnant: boolean;
  referralSource: string;
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
  pendingAmount: number;
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
  createdAt: string;
  reason: string;
  positionsWorked: string[];
  machinesUsed: string;
  acupuncture: TreatmentApplied;
  acupunctureDetail: string;
  traction: TreatmentApplied;
  tractionDetail: string;
  tractionType: TractionType;
  tractionTypeDetail: string;
  manual: TreatmentApplied;
  manualDetail: string;
  chiropractic: TreatmentApplied;
  chiropracticDetail: string;
  observations: string;
}

export interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  template24h: string;
  templateDayOf: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
}

export interface InventoryPurchase {
  id: string;
  itemId: string;
  quantity: number;
  date: string;
  notes: string;
}

export interface Payment {
  id: string;
  date: string;
  patientId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  observation: string;
  evidencePhotoUrl: string | null;
  relatedTo: 'appointment' | 'plan' | 'other';
  relatedId: string | null;
}

export const POSITIONS_WORKED = ['boca abajo', 'boca arriba', 'de costado', 'ambos lados', 'lado derecho', 'lado izquierdo'] as const;
