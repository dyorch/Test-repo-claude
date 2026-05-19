'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';
import { formatDate } from '@/lib/utils';

export default function PatientsPage() {
  const { patients, therapists, patientPlans, planTypes, appointments, role, activeTherapistId } = useApp();
  const [search, setSearch] = useState('');

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.dni.includes(search) || p.phone.includes(search);
    if (role === 'therapist') return matchSearch && p.assignedTherapistId === activeTherapistId;
    return matchSearch;
  });

  function getActivePlan(patientId: string) {
    const pp = patientPlans.find(p => p.patientId === patientId && p.status === 'ACTIVE');
    if (!pp) return null;
    const pt = planTypes.find(p => p.id === pp.planTypeId);
    return { pp, pt };
  }

  function getLastAppt(patientId: string) {
    const appts = appointments
      .filter(a => a.patientId === patientId && a.status === 'COMPLETED')
      .sort((a, b) => b.startTime.localeCompare(a.startTime));
    return appts[0] ?? null;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pacientes</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} pacientes</p>
        </div>
        <Link
          href="/patients/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Nuevo paciente
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o teléfono…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Paciente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Terapeuta</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan activo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Última sesión</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(p => {
              const plan = getActivePlan(p.id);
              const therapist = therapists.find(t => t.id === p.assignedTherapistId);
              const lastAppt = getLastAppt(p.id);
              const remaining = plan ? plan.pp.totalSessions - plan.pp.usedSessions : null;

              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: therapist?.color ?? '#94a3b8' }}
                      >
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400">DNI {p.dni}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{p.phone}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {therapist && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: therapist.color }} />
                        <span className="text-slate-600">{therapist.name.split(' ')[0]}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {plan ? (
                      <div>
                        <div className="text-xs font-medium text-slate-700">{plan.pt?.name}</div>
                        <div className={`text-xs mt-0.5 ${remaining! <= 2 ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
                          {plan.pp.usedSessions}/{plan.pp.totalSessions} sesiones
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Sin plan activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">
                    {lastAppt ? formatDate(lastAppt.startTime) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/patients/${p.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-slate-400 text-sm">
            No se encontraron pacientes
          </div>
        )}
      </div>
    </div>
  );
}
