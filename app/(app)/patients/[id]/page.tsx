'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';
import { formatDate, formatTime, formatPEN, statusColor, statusLabel, paymentStatusColor, paymentStatusLabel, getAge } from '@/lib/utils';
import AppointmentModal from '@/components/appointment-modal';
import { Appointment, WORK_POSTURE_LABEL, PHYSICAL_ACTIVITY_LABEL, DOMINANT_HAND_LABEL } from '@/lib/types';

type Tab = 'info' | 'appointments' | 'plans' | 'notes';

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { patients, therapists, appointments, patientPlans, planTypes, clinicalNotes, addPatientPlan, role } = useApp();

  const patient = patients.find(p => p.id === id);
  const [tab, setTab] = useState<Tab>('info');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanTypeId, setNewPlanTypeId] = useState('');
  const [newPlanPaid, setNewPlanPaid] = useState(0);
  const [newPlanPending, setNewPlanPending] = useState(0);
  const [newPlanNote, setNewPlanNote] = useState('');

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

  // Pain evolution: from oldest to newest
  const painHistory = [...patientNotes]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(n => {
      const appt = appointments.find(a => a.id === n.appointmentId);
      return { date: appt?.startTime ?? n.createdAt, painLevel: n.painLevel };
    });
  const initialPain = patient.initialPainLevel;
  const latestPain = painHistory.length > 0 ? painHistory[painHistory.length - 1].painLevel : initialPain;
  const painDelta = initialPain - latestPain;

  function handleAddPlan() {
    const pt = planTypes.find(p => p.id === newPlanTypeId);
    if (!pt) return;
    addPatientPlan({
      patientId: id,
      planTypeId: newPlanTypeId,
      totalSessions: pt.sessionCount,
      usedSessions: 0,
      totalPaid: newPlanPaid,
      pendingAmount: newPlanPending,
      pendingPaymentNote: newPlanNote,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });
    setShowAddPlan(false);
    setNewPlanTypeId('');
    setNewPlanPaid(0);
    setNewPlanPending(0);
    setNewPlanNote('');
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'info', label: 'Información' },
    { id: 'appointments', label: 'Historial citas', count: patientAppointments.length },
    { id: 'plans', label: 'Planes', count: activePatientPlans.length },
    { id: 'notes', label: 'Fichas de seguimiento', count: patientNotes.length },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
            {patient.isPregnant && (
              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">Gestante</span>
            )}
            {patient.chronicConditions.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium" title={patient.chronicConditions.join(', ')}>
                ⚠ {patient.chronicConditions.length} cond. crónica{patient.chronicConditions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
            {patient.dni && <span>DNI {patient.dni}</span>}
            {patient.birthDate && <><span>·</span><span>{getAge(patient.birthDate)} años</span></>}
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
      <div className="flex gap-0 border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
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
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm">Datos personales</h3>
              <InfoField label="Nombre completo" value={patient.name} />
              <InfoField label="DNI" value={patient.dni} />
              <InfoField label="Fecha de nacimiento" value={patient.birthDate ? `${formatDate(patient.birthDate)} (${getAge(patient.birthDate)} años)` : '—'} />
              <InfoField label="Dirección" value={patient.address} />
              <InfoField label="Ocupación" value={patient.occupation} />
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Peso" value={patient.weight ? `${patient.weight} kg` : '—'} />
                <InfoField label="Talla" value={patient.height ? `${patient.height} cm` : '—'} />
              </div>
              <InfoField label="Mano dominante" value={DOMINANT_HAND_LABEL[patient.dominantHand]} />
              <InfoField label="Celular" value={patient.phone} />
              <InfoField label="Correo" value={patient.email} />
              <InfoField label="Paciente desde" value={formatDate(patient.createdAt)} />
            </div>

            <div className="space-y-6">
              {/* Contacto de emergencia */}
              <div className="bg-rose-50 rounded-xl border border-rose-200 p-5 space-y-3">
                <h3 className="font-semibold text-rose-800 text-sm flex items-center gap-2">
                  🚨 Contacto de emergencia
                </h3>
                {(patient.emergencyContactName || patient.emergencyContactPhone) ? (
                  <>
                    <InfoField label="Nombre" value={patient.emergencyContactName} />
                    <InfoField label="Celular" value={patient.emergencyContactPhone} />
                    <InfoField label="Parentesco" value={patient.emergencyContactRelationship} />
                    {patient.emergencyContactPhone && (
                      <a href={`https://wa.me/${patient.emergencyContactPhone.replace(/\D/g, '')}`} target="_blank"
                        className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium">
                        Contactar por WhatsApp
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-rose-600/70 italic">No registrado</p>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 text-sm mb-3">Origen</h3>
                <InfoField label="¿Cómo se enteró?" value={patient.referralSource} />
              </div>
            </div>
          </div>

          {/* Información clínica completa */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">Información clínica</h3>
            <InfoField label="Motivo de consulta" value={patient.consultationReason} />

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-slate-400 font-medium">Zona de dolor principal</div>
                <div className="text-sm text-slate-700 mt-0.5 font-medium">{patient.painZone || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Nivel inicial (EVA)</div>
                <div className="text-sm mt-0.5">
                  <span className="font-bold text-orange-600 text-lg">{patient.initialPainLevel}</span>
                  <span className="text-slate-400">/10</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Última medición</div>
                <div className="text-sm mt-0.5">
                  {painHistory.length > 0 ? (
                    <>
                      <span className={`font-bold text-lg ${latestPain < initialPain ? 'text-emerald-600' : 'text-orange-600'}`}>{latestPain}</span>
                      <span className="text-slate-400">/10</span>
                      {painDelta > 0 && (
                        <span className="ml-2 text-xs text-emerald-600 font-medium">↓ {painDelta} pts</span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-400">Sin sesiones</span>
                  )}
                </div>
              </div>
            </div>

            {patient.chronicConditions.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 font-medium mb-1">Condiciones crónicas</div>
                <div className="flex gap-1.5 flex-wrap">
                  {patient.chronicConditions.map(c => (
                    <span key={c} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">{c}</span>
                  ))}
                </div>
              </div>
            )}

            <InfoField label="Medicamentos actuales" value={patient.currentMedications} />

            <div className="grid md:grid-cols-2 gap-4">
              <InfoField label="Postura laboral" value={WORK_POSTURE_LABEL[patient.workPosture]} />
              <InfoField label="Actividad física" value={PHYSICAL_ACTIVITY_LABEL[patient.physicalActivity]} />
            </div>

            <div>
              <div className="text-xs text-slate-400 font-medium">Tratamientos previos</div>
              <div className="text-sm text-slate-700 mt-0.5">
                {patient.previousTreatments ? 'Sí' : 'No'}
                {patient.previousTreatments && patient.previousTreatmentsDetail && (
                  <div className="text-slate-600 mt-0.5">{patient.previousTreatmentsDetail}</div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoField label="Exámenes" value={patient.exams} />
              <InfoField label="Alergias" value={patient.allergies} />
            </div>

            <InfoField label="Gestante" value={patient.isPregnant ? 'Sí' : 'No'} />
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
                            <div className="text-xs font-medium text-slate-700">{formatPEN(appt.paymentAmount)}</div>
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
            const totalPrice = pp.totalPaid + pp.pendingAmount;
            return (
              <div key={pp.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-slate-800">{pt?.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Desde {formatDate(pp.startDate)}</div>
                  </div>
                  <div className="flex gap-2">
                    {pp.pendingAmount > 0 && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                        2 cuotas
                      </span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : pp.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                      {pp.status === 'ACTIVE' ? 'Activo' : pp.status === 'COMPLETED' ? 'Completado' : 'Cancelado'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-400">Sesiones</div>
                    <div className="font-semibold text-slate-800">{pp.usedSessions} / {pp.totalSessions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Restantes</div>
                    <div className={`font-semibold ${remaining <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>{remaining}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Pagado</div>
                    <div className="font-semibold text-slate-800">{formatPEN(pp.totalPaid)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Pendiente</div>
                    <div className={`font-semibold ${pp.pendingAmount > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                      {pp.pendingAmount > 0 ? formatPEN(pp.pendingAmount) : '—'}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {pp.pendingAmount > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                      Plan en 2 cuotas — total {formatPEN(totalPrice)}, pendiente {formatPEN(pp.pendingAmount)}
                    </div>
                    {pp.pendingPaymentNote && (
                      <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <span className="font-medium text-slate-500">Observación: </span>
                        {pp.pendingPaymentNote}
                      </div>
                    )}
                  </div>
                )}
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
                      setNewPlanPending(0);
                    }}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Seleccionar…</option>
                    {planTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name} — {formatPEN(pt.price)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Pagado ahora (S/.)</label>
                    <input type="number" value={newPlanPaid} onChange={e => setNewPlanPaid(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Pendiente (2da cuota)</label>
                    <input type="number" value={newPlanPending} onChange={e => setNewPlanPending(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                {newPlanPending > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Observación de cuota pendiente</label>
                    <input value={newPlanNote} onChange={e => setNewPlanNote(e.target.value)}
                      placeholder="Ej. Pagará antes de la sesión 4, vía Yape"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
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

      {/* Tab: Clinical Notes (Ficha de seguimiento) */}
      {tab === 'notes' && (
        <div className="space-y-4">
          {/* Pain evolution */}
          {painHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 text-sm">Evolución del dolor (EVA)</h3>
                <div className="text-xs text-slate-500">
                  Inicial <span className="font-bold text-orange-600">{initialPain}</span> →
                  Actual <span className={`font-bold ${latestPain < initialPain ? 'text-emerald-600' : 'text-orange-600'}`}>{latestPain}</span>
                  {painDelta > 0 && <span className="ml-2 text-emerald-600 font-medium">↓ {painDelta} pts</span>}
                </div>
              </div>
              <PainChart initialPain={initialPain} history={painHistory} />
            </div>
          )}

          {patientNotes.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-12 text-center text-slate-400 text-sm">
              Sin fichas de seguimiento registradas
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
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-medium">Dolor (EVA)</div>
                    <div className={`text-lg font-bold ${note.painLevel <= 3 ? 'text-emerald-600' : note.painLevel <= 6 ? 'text-amber-600' : 'text-red-600'}`}>
                      {note.painLevel}<span className="text-sm text-slate-400">/10</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {note.reason && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Motivo</div>
                      <p className="text-sm text-slate-700 leading-relaxed">{note.reason}</p>
                    </div>
                  )}
                  {note.positionsWorked.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Posiciones trabajadas</div>
                      <div className="flex gap-1.5 flex-wrap">
                        {note.positionsWorked.map(pos => (
                          <span key={pos} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium capitalize">{pos}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {note.machinesUsed && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Máquinas utilizadas</div>
                      <p className="text-sm text-slate-700">{note.machinesUsed}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <TreatmentBadge label="Acupuntura" value={note.acupuncture} detail={note.acupunctureDetail} />
                    <TreatmentBadge label="Tracción" value={note.traction} detail={note.tractionDetail} extra={note.traction === 'si' ? note.tractionType : ''} />
                    <TreatmentBadge label="Manual" value={note.manual} detail={note.manualDetail} />
                    <TreatmentBadge label="Quiropráctica" value={note.chiropractic} detail={note.chiropracticDetail} />
                  </div>
                  {note.observations && (
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Observaciones</div>
                      <p className="text-sm text-slate-700 leading-relaxed">{note.observations}</p>
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

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400 font-medium">{label}</div>
      <div className="text-sm text-slate-700 mt-0.5">{value || '—'}</div>
    </div>
  );
}

function TreatmentBadge({ label, value, detail, extra }: { label: string; value: string; detail: string; extra?: string }) {
  const bg = value === 'si' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
             value === 'otros' ? 'bg-amber-50 text-amber-700 border-amber-200' :
             value === 'no' ? 'bg-slate-50 text-slate-500 border-slate-200' :
             'bg-slate-50 text-slate-400 border-slate-200';
  const valueLabel = value === 'si' ? 'Sí' : value === 'no' ? 'No' : value === 'otros' ? 'Otros' : '—';
  return (
    <div className={`border rounded-lg px-3 py-2 ${bg}`}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-sm font-medium mt-0.5">
        {valueLabel}{extra ? ` · ${extra}` : ''}
      </div>
      {detail && <div className="text-xs opacity-75 mt-0.5 truncate" title={detail}>{detail}</div>}
    </div>
  );
}

function PainChart({ initialPain, history }: { initialPain: number; history: { date: string; painLevel: number }[] }) {
  const series = [{ date: 'Inicial', painLevel: initialPain }, ...history.map(h => ({ date: formatDate(h.date), painLevel: h.painLevel }))];
  const maxBar = 10;
  return (
    <div>
      <div className="flex items-end gap-2 h-32">
        {series.map((s, i) => {
          const height = (s.painLevel / maxBar) * 100;
          const color = s.painLevel <= 3 ? 'bg-emerald-500' : s.painLevel <= 6 ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
              <div className="text-[10px] font-bold text-slate-700">{s.painLevel}</div>
              <div className={`w-full rounded-t transition-all ${color}`} style={{ height: `${Math.max(height, 4)}%` }} />
              <div className="text-[9px] text-slate-400 text-center truncate w-full">{s.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
