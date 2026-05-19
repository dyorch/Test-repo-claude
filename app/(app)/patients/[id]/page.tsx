'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';
import { formatDate, formatTime, formatCLP, statusColor, statusLabel, paymentStatusColor, paymentStatusLabel, getAge } from '@/lib/utils';
import AppointmentModal from '@/components/appointment-modal';
import { Appointment } from '@/lib/types';

type Tab = 'info' | 'appointments' | 'plans' | 'notes';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { patients, therapists, appointments, patientPlans, planTypes, clinicalNotes, addPatientPlan, role } = useApp();

  const patient = patients.find(p => p.id === id);
  const [tab, setTab] = useState<Tab>('info');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanTypeId, setNewPlanTypeId] = useState('');
  const [newPlanPaid, setNewPlanPaid] = useState(0);

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Paciente no encontrado.</p>
        <Link href="/patients" className="text-blue-600 text-sm">← Volver a pacientes</Link>
      </div>
    );
  }

  const therapist = therapists.find(t => t.id === patient.assignedTherapistId);
  const patientAppointments = appointments
    .filter(a => a.patientId === id)
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
  const activePatientPlans = patientPlans.filter(pp => pp.patientId === id);
  const patientNotes = clinicalNotes.filter(n => {
    return patientAppointments.some(a => a.id === n.appointmentId);
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function handleAddPlan() {
    const pt = planTypes.find(p => p.id === newPlanTypeId);
    if (!pt) return;
    addPatientPlan({
      patientId: id,
      planTypeId: newPlanTypeId,
      totalSessions: pt.sessionCount,
      usedSessions: 0,
      totalPaid: newPlanPaid,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setShowAddPlan(false);
    setNewPlanTypeId('');
    setNewPlanPaid(0);
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'info', label: 'Información' },
    { id: 'appointments', label: 'Historial citas', count: patientAppointments.length },
    { id: 'plans', label: 'Planes', count: activePatientPlans.length },
    { id: 'notes', label: 'Fichas clínicas', count: patientNotes.length },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/patients" className="text-sm text-slate-400 hover:text-slate-600 mb-4 inline-flex items-center gap-1">
        ← Pacientes
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6 mt-2">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ backgroundColor: therapist?.color ?? '#94a3b8' }}
        >
          {patient.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
            <span>{patient.rut}</span>
            <span>·</span>
            <span>{getAge(patient.birthDate)} años</span>
            {therapist && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: therapist.color }} />
                  {therapist.name}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`https://wa.me/${patient.phone.replace(/\D/g, '')}`} target="_blank"
            className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium">
            WhatsApp
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">Datos personales</h3>
            {[
              ['Nombre completo', patient.name],
              ['RUT', patient.rut],
              ['Teléfono', patient.phone],
              ['Email', patient.email],
              ['Fecha de nacimiento', `${formatDate(patient.birthDate)} (${getAge(patient.birthDate)} años)`],
              ['Paciente desde', formatDate(patient.createdAt)],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-xs text-slate-400 font-medium">{label}</div>
                <div className="text-sm text-slate-700 mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Contacto de emergencia</h3>
              <div>
                <div className="text-xs text-slate-400 font-medium">Nombre</div>
                <div className="text-sm text-slate-700 mt-0.5">{patient.emergencyContactName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Teléfono</div>
                <div className="text-sm text-slate-700 mt-0.5">{patient.emergencyContactPhone}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Información clínica</h3>
              <div>
                <div className="text-xs text-slate-400 font-medium">Motivo de consulta</div>
                <div className="text-sm text-slate-700 mt-0.5">{patient.consultationReason}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Antecedentes</div>
                <div className="text-sm text-slate-700 mt-0.5">{patient.medicalBackground}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Derivado por</div>
                <div className="text-sm text-slate-700 mt-0.5">{patient.referredBy}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Appointments */}
      {tab === 'appointments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {patientAppointments.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-400 text-sm">Sin citas registradas</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Terapeuta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Pago</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patientAppointments.map(appt => {
                  const t = therapists.find(x => x.id === appt.therapistId);
                  const note = clinicalNotes.find(n => n.appointmentId === appt.id);
                  return (
                    <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-700">{formatDate(appt.startTime)}</div>
                        <div className="text-xs text-slate-400">{formatTime(appt.startTime)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t?.color }} />
                          <span className="text-slate-600 text-xs">{t?.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(appt.status)}`}>
                          {statusLabel(appt.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {appt.paymentAmount > 0 && (
                          <div>
                            <div className="text-xs font-medium text-slate-700">{formatCLP(appt.paymentAmount)}</div>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${paymentStatusColor(appt.paymentStatus)}`}>
                              {paymentStatusLabel(appt.paymentStatus)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {note && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">Ficha ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Plans */}
      {tab === 'plans' && (
        <div className="space-y-4">
          {activePatientPlans.map(pp => {
            const pt = planTypes.find(p => p.id === pp.planTypeId);
            const progress = (pp.usedSessions / pp.totalSessions) * 100;
            const remaining = pp.totalSessions - pp.usedSessions;
            return (
              <div key={pp.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-slate-800">{pt?.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Desde {formatDate(pp.startDate)}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : pp.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                    {pp.status === 'ACTIVE' ? 'Activo' : pp.status === 'COMPLETED' ? 'Completado' : 'Cancelado'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-400">Sesiones usadas</div>
                    <div className="font-semibold text-slate-800">{pp.usedSessions} / {pp.totalSessions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Restantes</div>
                    <div className={`font-semibold ${remaining <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>{remaining}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Total pagado</div>
                    <div className="font-semibold text-slate-800">{formatCLP(pp.totalPaid)}</div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}

          {role === 'admin' && (
            showAddPlan ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="font-semibold text-slate-800 text-sm">Agregar plan</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de plan</label>
                  <select
                    value={newPlanTypeId}
                    onChange={e => {
                      setNewPlanTypeId(e.target.value);
                      const pt = planTypes.find(p => p.id === e.target.value);
                      setNewPlanPaid(pt?.price ?? 0);
                    }}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Seleccionar…</option>
                    {planTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name} — {formatCLP(pt.price)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Monto pagado ($)</label>
                  <input
                    type="number"
                    value={newPlanPaid}
                    onChange={e => setNewPlanPaid(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddPlan(false)} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button onClick={handleAddPlan} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Agregar</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddPlan(true)}
                className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 text-sm rounded-xl hover:border-blue-300 hover:text-blue-500 transition-colors"
              >
                + Agregar plan
              </button>
            )
          )}
        </div>
      )}

      {/* Tab: Clinical Notes */}
      {tab === 'notes' && (
        <div className="space-y-4">
          {patientNotes.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-12 text-center text-slate-400 text-sm">
              Sin fichas clínicas registradas
            </div>
          )}
          {patientNotes.map(note => {
            const appt = appointments.find(a => a.id === note.appointmentId);
            const t = therapists.find(x => x.id === note.therapistId);
            return (
              <div key={note.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-slate-800">{appt ? formatDate(appt.startTime) : '—'}</div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: t?.color }} />
                      {t?.name}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Qué se trabajó</div>
                    <p className="text-sm text-slate-700 leading-relaxed">{note.sessionContent}</p>
                  </div>
                  {note.observations && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Observaciones</div>
                      <p className="text-sm text-slate-700 leading-relaxed">{note.observations}</p>
                    </div>
                  )}
                  {note.nextSessionPlan && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Próxima sesión</div>
                      <p className="text-sm text-slate-700 leading-relaxed">{note.nextSessionPlan}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedAppt && (
        <AppointmentModal appointment={selectedAppt} onClose={() => setSelectedAppt(null)} />
      )}
    </div>
  );
}
