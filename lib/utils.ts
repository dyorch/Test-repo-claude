import { AppointmentStatus, PaymentStatus, PaymentMethod } from './types';

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
    SCHEDULED: 'Sin confirmar',
    CONFIRMED_24H: 'Confirmada 24h',
    CONFIRMED_TODAY: 'Confirmada hoy',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No asistió',
    COMPLETED: 'Completada',
  };
  return labels[status];
}

export function statusColor(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    SCHEDULED: 'bg-amber-100 text-amber-800',
    CONFIRMED_24H: 'bg-sky-100 text-sky-800',
    CONFIRMED_TODAY: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-slate-200 text-slate-700',
    COMPLETED: 'bg-violet-100 text-violet-800',
  };
  return colors[status];
}

export function statusDot(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    SCHEDULED: 'bg-amber-500',
    CONFIRMED_24H: 'bg-sky-500',
    CONFIRMED_TODAY: 'bg-emerald-500',
    CANCELLED: 'bg-red-500',
    NO_SHOW: 'bg-slate-500',
    COMPLETED: 'bg-violet-500',
  };
  return colors[status];
}

export function statusSolidBg(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    SCHEDULED: '#F59E0B',
    CONFIRMED_24H: '#0EA5E9',
    CONFIRMED_TODAY: '#10B981',
    CANCELLED: '#EF4444',
    NO_SHOW: '#64748B',
    COMPLETED: '#8B5CF6',
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

export function paymentMethodLabel(method: PaymentMethod | null): string {
  if (!method) return '—';
  const labels: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    CARD: 'Tarjeta',
    YAPE: 'Yape',
    PLIN: 'Plin',
  };
  return labels[method];
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

export function getBirthdayMonth(birthDate: string): number {
  return new Date(birthDate).getMonth();
}

export function getBirthdayDay(birthDate: string): number {
  return new Date(birthDate).getDate();
}

export function formatMonth(month: number): string {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[month];
}

export type DatePreset = 'today' | 'week' | 'month' | 'custom';

export function getPresetRange(preset: DatePreset, today: Date): { from: string; to: string } {
  if (preset === 'today') {
    const d = today.toISOString().split('T')[0];
    return { from: d, to: d };
  }
  if (preset === 'week') {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(today);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      from: monday.toISOString().split('T')[0],
      to: sunday.toISOString().split('T')[0],
    };
  }
  if (preset === 'month') {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0],
    };
  }
  return { from: '', to: '' };
}

export function isDateInRange(dateStr: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  const d = dateStr.split('T')[0];
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}
