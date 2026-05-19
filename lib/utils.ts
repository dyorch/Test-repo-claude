import { AppointmentStatus, PaymentStatus } from './types';

export function formatPEN(amount: number): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function getWeekDays(referenceDate: Date): Date[] {
  const day = referenceDate.getDay();
  const diff = referenceDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(referenceDate);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function statusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    SCHEDULED: 'Agendada',
    CONFIRMED: 'Confirmada',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No asistió',
    COMPLETED: 'Completada',
  };
  return labels[status];
}

export function statusColor(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    SCHEDULED: 'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-gray-100 text-gray-700',
  };
  return colors[status];
}

export function statusDot(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    SCHEDULED: 'bg-amber-400',
    CONFIRMED: 'bg-emerald-500',
    CANCELLED: 'bg-red-500',
    NO_SHOW: 'bg-purple-500',
    COMPLETED: 'bg-gray-400',
  };
  return colors[status];
}

export function paymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    WAIVED: 'Exento',
  };
  return labels[status];
}

export function paymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    WAIVED: 'bg-gray-100 text-gray-700',
  };
  return colors[status];
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
