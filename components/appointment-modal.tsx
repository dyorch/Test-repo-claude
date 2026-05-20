'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Appointment, AppointmentStatus, PaymentMethod } from '@/lib/types';
import { useApp } from '@/contexts/app-context';
import { formatPEN, formatDate, formatTime, statusLabel, statusColor } from '@/lib/utils';

interface Props {
  appointment?: Appointment | null;
  defaultDate?: string;
  defaultHour?: number;
  onClose: () => void;
}

const HOURS = [9,10,11,12,14,15,16,17];
const STATUSES: AppointmentStatus[] = ['SCHEDULED','CONFIRMED_24H','CONFIRMED_TODAY','CANCELLED','NO_SHOW','COMPLETED'];
const METHODS: PaymentMethod[] = ['CASH','TRANSFER','CARD','YAPE','PLIN'];
const METHOD_LABEL: Record<PaymentMethod, string> = { CASH: 'Efectivo', TRANSFER: 'Transferencia', CARD: 'Tarjeta', YAPE: 'Yape', PLIN: 'Plin' };

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs text-slate-500 w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

export default function AppointmentModal({ appointment, defaultDate, defaultHour, onClose }: Props) {
  const { patients, therapists, rooms, planTypes, patientPlans, clinicalNotes, addAppointment, updateAppointment } = useApp();

  const isNew = !appointment;
  const [mode, setMode] = useState<'detail' | 'edit'>(isNew ? 'edit' : 'detail');

  const todayStr = new Date().toISOString().split('T')[0];

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
  const activeTherapists = therapists.filter(t => t.isActive);
  const activeRooms = rooms.filter(r => r.isActive);

  useEffect(() => {
    if (!patientPlanId) setPaymentAmount(120);
  }, [patientId, patientPlanId]);

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
    if (!isNew && appointment) {
      updateAppointment({ ...data, id: appointment.id });
    } else {
      addAppointment(data);
    }
    onClose();
  }

  // Detail view data
  const detailPatient = patients.find(p => p.id === appointment?.patientId);
  const detailTherapist = therapists.find(t => t.id === appointment?.therapistId);
  const detailRoom = rooms.find(r => r.id === appointment?.roomId);
  const detailPlan = patientPlans.find(pp => pp.id === appointment?.patientPlanId);
  const detailPlanType = planTypes.find(pt => pt.id === detailPlan?.planTypeId);
  const clinicalNote = clinicalNotes.find(n => n.appointmentId === appointment?.id);

  const modalTitle = isNew ? 'Nueva Cita' : mode === 'detail' ? 'Detalle de cita' : 'Editar cita';

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">{modalTitle}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        {/* ── DETAIL MODE ── */}
        {mode === 'detail' && appointment && (
          <div className="px-6 py-5 space-y-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor(appointment.status)}`}>
              {statusLabel(appointment.status)}
            </span>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
              <DetailRow label="Paciente" value={detailPatient?.name ?? '—'} />
              <DetailRow label="Terapeuta" value={detailTherapist?.name ?? '—'} />
              <DetailRow label="Consultorio" value={detailRoom?.name ?? '—'} />
              <DetailRow
                label="Fecha y hora"
                value={`${formatDate(appointment.startTime)} · ${formatTime(appointment.startTime)} – ${formatTime(appointment.endTime)}`}
              />
              {detailPlan && detailPlanType && (
                <DetailRow label="Plan" value={`${detailPlanType.name} (${detailPlan.usedSessions}/${detailPlan.totalSessions} sesiones)`} />
              )}
              {!appointment.patientPlanId && appointment.paymentAmount > 0 && (
                <DetailRow label="Monto" value={formatPEN(appointment.paymentAmount)} />
              )}
              {appointment.paymentMethod && (
                <DetailRow label="Método de pago" value={METHOD_LABEL[appointment.paymentMethod]} />
              )}
              {appointment.notes && (
                <DetailRow label="Notas" value={appointment.notes} />
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Editar cita
              </button>
              <Link
                href={`/appointments/${appointment.id}/clinical-note`}
                onClick={onClose}
                className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium flex items-center gap-1.5"
              >
                <span>📋</span>
                {clinicalNote ? 'Ver ficha' : 'Llenar ficha'}
              </Link>
            </div>
          </div>
        )}

        {/* ── EDIT / CREATE MODE ── */}
        {mode === 'edit' && (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Consultorio</label>
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

            {!isNew && (
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => isNew ? onClose() : setMode('detail')}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {isNew ? 'Cancelar' : '← Volver'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isNew ? 'Crear cita' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
