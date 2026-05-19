'use client';
import { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, PaymentMethod } from '@/lib/types';
import { useApp } from '@/contexts/app-context';
import { formatPEN, formatDate, statusLabel, statusColor, generateId } from '@/lib/utils';

interface Props {
  appointment?: Appointment | null;
  defaultDate?: string;
  defaultHour?: number;
  onClose: () => void;
}

const HOURS = [9,10,11,12,14,15,16,17];
const STATUSES: AppointmentStatus[] = ['SCHEDULED','CONFIRMED','CANCELLED','NO_SHOW','COMPLETED'];
const METHODS: PaymentMethod[] = ['CASH','TRANSFER','CARD'];
const METHOD_LABEL: Record<PaymentMethod, string> = { CASH: 'Efectivo', TRANSFER: 'Transferencia', CARD: 'Tarjeta' };

export default function AppointmentModal({ appointment, defaultDate, defaultHour, onClose }: Props) {
  const { patients, therapists, rooms, planTypes, patientPlans, addAppointment, updateAppointment } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const isEdit = !!appointment;

  const [patientId, setPatientId] = useState(appointment?.patientId ?? '');
  const [therapistId, setTherapistId] = useState(appointment?.therapistId ?? '');
  const [roomId, setRoomId] = useState(appointment?.roomId ?? '');
  const [date, setDate] = useState(
    appointment ? appointment.startTime.split('T')[0] : (defaultDate ?? todayStr)
  );
  const [hour, setHour] = useState(
    appointment ? new Date(appointment.startTime).getHours() : (defaultHour ?? 9)
  );
  const [status, setStatus] = useState<AppointmentStatus>(appointment?.status ?? 'SCHEDULED');
  const [patientPlanId, setPatientPlanId] = useState(appointment?.patientPlanId ?? '');
  const [paymentAmount, setPaymentAmount] = useState(appointment?.paymentAmount ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(appointment?.paymentMethod ?? '');
  const [notes, setNotes] = useState(appointment?.notes ?? '');

  const activePatientPlans = patientPlans.filter(pp => pp.patientId === patientId && pp.status === 'ACTIVE');
  const selectedPlan = planTypes.find(pt => {
    const pp = patientPlans.find(p => p.id === patientPlanId);
    return pp ? pt.id === pp.planTypeId : false;
  });
  const activeTherapists = therapists.filter(t => t.isActive);
  const activeRooms = rooms.filter(r => r.isActive);

  useEffect(() => {
    if (!patientPlanId) {
      const planType = planTypes.find(pt => pt.id === 'p3');
      setPaymentAmount(planType?.price ?? 80);
    }
  }, [patientId, patientPlanId, planTypes]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const startTime = `${date}T${String(hour).padStart(2, '0')}:00`;
    const endTime = `${date}T${String(hour + 1).padStart(2, '0')}:00`;

    const data: Omit<Appointment, 'id'> = {
      patientId, therapistId, roomId, startTime, endTime, status,
      patientPlanId: patientPlanId || null,
      paymentStatus: status === 'CANCELLED' || status === 'NO_SHOW' ? 'WAIVED' : paymentAmount > 0 ? 'PAID' : 'PENDING',
      paymentAmount,
      paymentMethod: paymentMethod || null,
      notes,
      whatsappReminderSent: false,
      whatsappDayOfSent: false,
    };

    if (isEdit && appointment) {
      updateAppointment({ ...data, id: appointment.id });
    } else {
      addAppointment(data);
    }
    onClose();
  }

  const patient = patients.find(p => p.id === patientId);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{isEdit ? 'Editar Cita' : 'Nueva Cita'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Patient */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Paciente</label>
            <select
              required
              value={patientId}
              onChange={e => { setPatientId(e.target.value); setPatientPlanId(''); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Seleccionar paciente…</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Therapist + Room */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Terapeuta</label>
              <select
                required
                value={therapistId}
                onChange={e => setTherapistId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccionar…</option>
                {activeTherapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Habitación</label>
              <select
                required
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccionar…</option>
                {activeRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Hour */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hora</label>
              <select
                value={hour}
                onChange={e => setHour(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00 – {String(h+1).padStart(2,'0')}:00</option>)}
              </select>
            </div>
          </div>

          {/* Plan */}
          {patientId && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plan del paciente</label>
              <select
                value={patientPlanId}
                onChange={e => setPatientPlanId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Sin plan — sesión individual</option>
                {activePatientPlans.map(pp => {
                  const pt = planTypes.find(p => p.id === pp.planTypeId);
                  return <option key={pp.id} value={pp.id}>{pt?.name} ({pp.usedSessions}/{pp.totalSessions} usadas)</option>;
                })}
              </select>
            </div>
          )}

          {/* Amount + Method */}
          {!patientPlanId && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Monto (S/.)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Método de pago</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Sin definir</option>
                  {METHODS.map(m => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Status (only edit) */}
          {isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${status === s ? statusColor(s) + ' border-current' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                  >
                    {statusLabel(s)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notas internas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas para el recepcionista…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isEdit ? 'Guardar cambios' : 'Crear cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
