'use client';
import { useApp } from '@/contexts/app-context';
import { formatTime, statusLabel, statusColor, statusDot, formatCLP } from '@/lib/utils';
import Link from 'next/link';

const TODAY = '2026-05-19';

export default function DashboardPage() {
  const { appointments, patients, therapists, patientPlans, planTypes, role, activeTherapistId, updateAppointmentStatus } = useApp();

  const todayAppts = appointments.filter(a => {
    const match = a.startTime.startsWith(TODAY);
    if (role === 'therapist') return match && a.therapistId === activeTherapistId;
    return match;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const confirmed = todayAppts.filter(a => a.status === 'CONFIRMED').length;
  const scheduled = todayAppts.filter(a => a.status === 'SCHEDULED').length;
  const cancelled = todayAppts.filter(a => a.status === 'CANCELLED').length;
  const completed = todayAppts.filter(a => a.status === 'COMPLETED').length;

  const pendingPlans = patientPlans.filter(pp => {
    const remaining = pp.totalSessions - pp.usedSessions;
    return pp.status === 'ACTIVE' && remaining <= 2 && remaining > 0;
  });

  const noWhatsApp = todayAppts.filter(a =>
    a.status === 'SCHEDULED' && !a.whatsappReminderSent && !a.whatsappDayOfSent
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Martes 19 de mayo, 2026</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Citas hoy', value: todayAppts.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Confirmadas', value: confirmed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sin confirmar', value: scheduled, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Canceladas', value: cancelled, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-600 mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Agenda de hoy</h2>
            <Link href="/calendar" className="text-xs text-blue-600 hover:underline">Ver calendario →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {todayAppts.length === 0 && (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">No hay citas programadas para hoy</div>
            )}
            {todayAppts.map(appt => {
              const patient = patients.find(p => p.id === appt.patientId);
              const therapist = therapists.find(t => t.id === appt.therapistId);
              return (
                <div key={appt.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="text-sm font-mono text-slate-500 w-12 flex-shrink-0">{formatTime(appt.startTime)}</div>
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: therapist?.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{patient?.name}</div>
                    <div className="text-xs text-slate-400">{therapist?.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appt.whatsappDayOfSent && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">WSP ✓</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(appt.status)}`}>
                      {statusLabel(appt.status)}
                    </span>
                  </div>
                  {appt.status === 'SCHEDULED' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'CONFIRMED')}
                        className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'NO_SHOW')}
                        className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        ✗
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          {/* WhatsApp pending */}
          {noWhatsApp.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-600 text-sm">⚠</span>
                <span className="text-sm font-semibold text-amber-800">Sin recordatorio WhatsApp</span>
              </div>
              <div className="space-y-1">
                {noWhatsApp.map(a => {
                  const p = patients.find(x => x.id === a.patientId);
                  return <div key={a.id} className="text-xs text-amber-700">{formatTime(a.startTime)} — {p?.name}</div>;
                })}
              </div>
            </div>
          )}

          {/* Plans about to expire */}
          {pendingPlans.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Planes por vencer</span>
              </div>
              <div className="divide-y divide-slate-50">
                {pendingPlans.map(pp => {
                  const pat = patients.find(p => p.id === pp.patientId);
                  const pt = planTypes.find(p => p.id === pp.planTypeId);
                  const remaining = pp.totalSessions - pp.usedSessions;
                  return (
                    <Link key={pp.id} href={`/patients/${pp.patientId}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="text-xs font-medium text-slate-700">{pat?.name}</div>
                        <div className="text-xs text-slate-400">{pt?.name}</div>
                      </div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {remaining} ses.
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Per-therapist summary */}
          {role === 'admin' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Por terapeuta hoy</span>
              </div>
              <div className="divide-y divide-slate-50">
                {therapists.filter(t => t.isActive).map(t => {
                  const tAppts = todayAppts.filter(a => a.therapistId === t.id);
                  return (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="text-xs font-medium text-slate-700 flex-1">{t.name.split(' ')[0]}</span>
                      <span className="text-xs text-slate-500">{tAppts.length} citas</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
