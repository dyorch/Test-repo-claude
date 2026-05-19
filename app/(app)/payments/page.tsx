'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';
import { formatPEN, formatDate, paymentStatusColor, paymentStatusLabel, statusColor, statusLabel } from '@/lib/utils';

type SubTab = 'active-plans' | 'pending-payments' | 'plan-types';

export default function PaymentsPage() {
  const { patientPlans, planTypes, patients, appointments, therapists, addPlanType, updateAppointment, role } = useApp();
  const [subTab, setSubTab] = useState<SubTab>('active-plans');
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCount, setNewTypeCount] = useState(10);
  const [newTypePrice, setNewTypePrice] = useState(650);
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [filterPlans, setFilterPlans] = useState<'all' | 'active' | 'completed'>('active');

  const filteredPlans = patientPlans.filter(pp => {
    if (filterPlans === 'active') return pp.status === 'ACTIVE';
    if (filterPlans === 'completed') return pp.status === 'COMPLETED';
    return true;
  });

  const pendingPayments = appointments.filter(a => a.paymentStatus === 'PENDING' && a.status !== 'CANCELLED' && a.status !== 'NO_SHOW');

  function markPaid(apptId: string) {
    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;
    updateAppointment({ ...appt, paymentStatus: 'PAID', paymentMethod: 'CASH' });
  }

  function handleAddType(e: React.FormEvent) {
    e.preventDefault();
    addPlanType({ name: newTypeName, sessionCount: newTypeCount, price: newTypePrice, description: newTypeDesc });
    setShowAddType(false);
    setNewTypeName(''); setNewTypeCount(10); setNewTypePrice(650); setNewTypeDesc('');
  }

  const subTabs: { id: SubTab; label: string; count?: number }[] = [
    { id: 'active-plans', label: 'Planes activos', count: patientPlans.filter(p => p.status === 'ACTIVE').length },
    { id: 'pending-payments', label: 'Pagos pendientes', count: pendingPayments.length },
    { id: 'plan-types', label: 'Tipos de plan', count: planTypes.length },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pagos & Planes</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gestión financiera y planes de sesiones</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-6">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${subTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${subTab === t.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Plans */}
      {subTab === 'active-plans' && (
        <div>
          <div className="flex gap-2 mb-4">
            {(['active', 'completed', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterPlans(f)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${filterPlans === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}
              >
                {f === 'active' ? 'Activos' : f === 'completed' ? 'Completados' : 'Todos'}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Progreso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Pagado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPlans.map(pp => {
                  const pat = patients.find(p => p.id === pp.patientId);
                  const pt = planTypes.find(p => p.id === pp.planTypeId);
                  const remaining = pp.totalSessions - pp.usedSessions;
                  const progress = (pp.usedSessions / pp.totalSessions) * 100;
                  return (
                    <tr key={pp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/patients/${pp.patientId}`} className="font-medium text-blue-600 hover:underline">
                          {pat?.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{pt?.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{pp.usedSessions}/{pp.totalSessions}</span>
                          {remaining <= 2 && remaining > 0 && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">{remaining} restantes</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-sm font-medium text-slate-700">{formatPEN(pp.totalPaid)}</div>
                        <div className="text-xs text-slate-400">{formatPEN(pt?.price ?? 0)} plan</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : pp.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                          {pp.status === 'ACTIVE' ? 'Activo' : pp.status === 'COMPLETED' ? 'Completado' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPlans.length === 0 && (
              <div className="px-5 py-12 text-center text-slate-400 text-sm">No hay planes en esta categoría</div>
            )}
          </div>
        </div>
      )}

      {/* Pending Payments */}
      {subTab === 'pending-payments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Terapeuta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado cita</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingPayments.map(appt => {
                const pat = patients.find(p => p.id === appt.patientId);
                const t = therapists.find(x => x.id === appt.therapistId);
                return (
                  <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-slate-700">{formatDate(appt.startTime)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/patients/${appt.patientId}`} className="font-medium text-blue-600 hover:underline">
                        {pat?.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t?.color }} />
                        <span className="text-slate-600">{t?.name.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(appt.status)}`}>
                        {statusLabel(appt.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatPEN(appt.paymentAmount)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => markPaid(appt.id)}
                        className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                      >
                        Marcar pagado
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pendingPayments.length === 0 && (
            <div className="px-5 py-12 text-center text-slate-400 text-sm">Sin pagos pendientes ✓</div>
          )}
        </div>
      )}

      {/* Plan Types */}
      {subTab === 'plan-types' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {planTypes.map(pt => (
              <div key={pt.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="font-semibold text-slate-800 mb-1">{pt.name}</div>
                <div className="text-2xl font-bold text-blue-600 mb-2">{formatPEN(pt.price)}</div>
                <div className="text-sm text-slate-500 mb-3">{pt.sessionCount} sesión{pt.sessionCount !== 1 ? 'es' : ''}</div>
                <p className="text-xs text-slate-400">{pt.description}</p>
              </div>
            ))}
          </div>

          {role === 'admin' && (
            showAddType ? (
              <form onSubmit={handleAddType} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="font-semibold text-slate-800 text-sm">Nuevo tipo de plan</h3>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
                  <input required value={newTypeName} onChange={e => setNewTypeName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej. Pack 20 sesiones" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">N° de sesiones</label>
                    <input required type="number" value={newTypeCount} onChange={e => setNewTypeCount(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Precio (S/.)</label>
                    <input required type="number" value={newTypePrice} onChange={e => setNewTypePrice(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
                  <input value={newTypeDesc} onChange={e => setNewTypeDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción breve…" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowAddType(false)} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Crear plan</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddType(true)}
                className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 text-sm rounded-xl hover:border-blue-300 hover:text-blue-500 transition-colors"
              >
                + Nuevo tipo de plan
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
