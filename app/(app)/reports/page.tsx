'use client';
import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { formatCLP } from '@/lib/utils';
import Link from 'next/link';

type ReportTab = 'income' | 'pending';

export default function ReportsPage() {
  const { appointments, therapists, patients, patientPlans, planTypes } = useApp();
  const [tab, setTab] = useState<ReportTab>('income');
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  function filterByPeriod(startTime: string) {
    const d = new Date(startTime);
    const now = new Date('2026-05-19');
    if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo && d <= now;
    }
    if (period === 'month') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    return true;
  }

  const paidAppts = appointments.filter(a =>
    a.paymentStatus === 'PAID' && filterByPeriod(a.startTime)
  );

  const therapistStats = therapists.filter(t => t.isActive).map(t => {
    const tAppts = paidAppts.filter(a => a.therapistId === t.id);
    const total = tAppts.reduce((sum, a) => sum + a.paymentAmount, 0);
    const avg = tAppts.length > 0 ? total / tAppts.length : 0;
    return { therapist: t, sessions: tAppts.length, total, avg };
  }).sort((a, b) => b.total - a.total);

  const grandTotal = therapistStats.reduce((sum, s) => sum + s.total, 0);
  const maxTotal = Math.max(...therapistStats.map(s => s.total), 1);

  const pendingSessionsPatients = patientPlans
    .filter(pp => pp.status === 'ACTIVE' && pp.usedSessions < pp.totalSessions)
    .map(pp => {
      const pat = patients.find(p => p.id === pp.patientId);
      const pt = planTypes.find(p => p.id === pp.planTypeId);
      const remaining = pp.totalSessions - pp.usedSessions;
      const valueLeft = remaining * (pt?.price ?? 0) / (pt?.sessionCount ?? 1);
      return { pp, pat, pt, remaining, valueLeft };
    })
    .sort((a, b) => b.remaining - a.remaining);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
        <p className="text-slate-500 text-sm mt-0.5">Análisis y estadísticas del consultorio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-6">
        {[
          { id: 'income' as const, label: 'Ingresos por terapeuta' },
          { id: 'pending' as const, label: 'Sesiones pendientes' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Income Tab */}
      {tab === 'income' && (
        <div className="space-y-6">
          {/* Period filter */}
          <div className="flex gap-2">
            {([['week', 'Esta semana'], ['month', 'Este mes'], ['all', 'Todo el período']] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setPeriod(v)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${period === v ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Summary card */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-700">{formatCLP(grandTotal)}</div>
              <div className="text-xs text-blue-600 font-medium mt-1">Ingresos totales</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-700">{paidAppts.length}</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">Sesiones cobradas</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-slate-700">
                {formatCLP(paidAppts.length > 0 ? grandTotal / paidAppts.length : 0)}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">Promedio por sesión</div>
            </div>
          </div>

          {/* Bar chart + table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-5">Desglose por terapeuta</h3>
            <div className="space-y-4">
              {therapistStats.map(s => (
                <div key={s.therapist.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.therapist.color }} />
                      <span className="text-sm font-medium text-slate-700">{s.therapist.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">{s.sessions} ses.</span>
                      <span className="font-semibold text-slate-800 w-28 text-right">{formatCLP(s.total)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ width: `${(s.total / maxTotal) * 100}%`, backgroundColor: s.therapist.color }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Promedio: {formatCLP(s.avg)} / sesión</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Sessions Tab */}
      {tab === 'pending' && (
        <div>
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="text-sm font-semibold text-amber-800 mb-1">
              {pendingSessionsPatients.reduce((s, p) => s + p.remaining, 0)} sesiones pendientes de uso
            </div>
            <div className="text-xs text-amber-700">
              Valor total: {formatCLP(pendingSessionsPatients.reduce((s, p) => s + p.valueLeft, 0))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Progreso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Pendientes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingSessionsPatients.map(({ pp, pat, pt, remaining }) => {
                  const progress = (pp.usedSessions / pp.totalSessions) * 100;
                  return (
                    <tr key={pp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/patients/${pp.patientId}`} className="font-medium text-blue-600 hover:underline">
                          {pat?.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{pt?.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{pp.usedSessions}/{pp.totalSessions}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${remaining <= 2 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {remaining} ses.
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pendingSessionsPatients.length === 0 && (
              <div className="px-5 py-12 text-center text-slate-400 text-sm">Sin sesiones pendientes de uso</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
