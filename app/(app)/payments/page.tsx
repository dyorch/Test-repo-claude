'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';
import { formatPEN, formatDate, formatTime, paymentMethodLabel, DatePreset, getPresetRange, isDateInRange } from '@/lib/utils';
import { PaymentMethod } from '@/lib/types';
import DateRangeFilter from '@/components/date-range-filter';

type SubTab = 'all-payments' | 'active-plans' | 'pending-installments' | 'plan-types';

const METHODS: PaymentMethod[] = ['CASH', 'TRANSFER', 'CARD', 'YAPE', 'PLIN'];
const TODAY = new Date('2026-05-19');

export default function PaymentsPage() {
  const { patientPlans, planTypes, patients, payments, therapists, addPlanType, addPayment, role } = useApp();
  const [subTab, setSubTab] = useState<SubTab>('all-payments');
  const [showAddType, setShowAddType] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCount, setNewTypeCount] = useState(10);
  const [newTypePrice, setNewTypePrice] = useState(650);
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [preset, setPreset] = useState<DatePreset>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | ''>('');

  const effectiveRange = preset === 'custom'
    ? { from: customFrom, to: customTo }
    : getPresetRange(preset, TODAY);

  // New payment form
  const [npPatient, setNpPatient] = useState('');
  const [npAmount, setNpAmount] = useState(0);
  const [npMethod, setNpMethod] = useState<PaymentMethod>('CASH');
  const [npObs, setNpObs] = useState('');
  const [npPhoto, setNpPhoto] = useState<string | null>(null);

  const pendingInstallments = patientPlans.filter(pp => pp.status === 'ACTIVE' && pp.pendingAmount > 0);

  const filteredPayments = payments.filter(p => {
    if (!isDateInRange(p.date, effectiveRange.from, effectiveRange.to)) return false;
    if (filterMethod && p.paymentMethod !== filterMethod) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  function handleAddType(e: React.FormEvent) {
    e.preventDefault();
    addPlanType({ name: newTypeName, sessionCount: newTypeCount, price: newTypePrice, description: newTypeDesc });
    setShowAddType(false);
    setNewTypeName(''); setNewTypeCount(10); setNewTypePrice(650); setNewTypeDesc('');
  }

  function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    addPayment({
      date: new Date().toISOString(),
      patientId: npPatient, amount: npAmount, paymentMethod: npMethod,
      observation: npObs, evidencePhotoUrl: npPhoto,
      relatedTo: 'other', relatedId: null,
    });
    setShowAddPayment(false);
    setNpPatient(''); setNpAmount(0); setNpMethod('CASH'); setNpObs(''); setNpPhoto(null);
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNpPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  const subTabs: { id: SubTab; label: string; count?: number }[] = [
    { id: 'all-payments', label: 'Pagos', count: payments.length },
    { id: 'active-plans', label: 'Planes', count: patientPlans.filter(p => p.status === 'ACTIVE').length },
    { id: 'pending-installments', label: 'Cuotas pendientes', count: pendingInstallments.length },
    { id: 'plan-types', label: 'Tipos de plan', count: planTypes.length },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pagos & Planes</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gestión financiera y planes de sesiones</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-6 overflow-x-auto">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${subTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
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

      {/* All Payments — main list with evidence */}
      {subTab === 'all-payments' && (
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <DateRangeFilter
              preset={preset}
              fromDate={customFrom}
              toDate={customTo}
              onPresetChange={setPreset}
              onFromChange={setCustomFrom}
              onToChange={setCustomTo}
            />
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value as PaymentMethod | '')}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todos los métodos</option>
              {METHODS.map(m => <option key={m} value={m}>{paymentMethodLabel(m)}</option>)}
            </select>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">
                Total: {formatPEN(filteredPayments.reduce((s, p) => s + p.amount, 0))}
              </span>
              <button
                onClick={() => setShowAddPayment(true)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + Registrar pago
              </button>
            </div>
          </div>

          {showAddPayment && (
            <form onSubmit={handleAddPayment} className="bg-white rounded-xl border border-blue-200 p-5 mb-4 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm">Nuevo pago</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cliente</label>
                  <select required value={npPatient} onChange={e => setNpPatient(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Seleccionar…</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Monto (S/.)</label>
                  <input required type="number" value={npAmount || ''} onChange={e => setNpAmount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Método de pago</label>
                  <select value={npMethod} onChange={e => setNpMethod(e.target.value as PaymentMethod)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {METHODS.map(m => <option key={m} value={m}>{paymentMethodLabel(m)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Foto de evidencia</label>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload}
                    className="w-full text-xs text-slate-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observación</label>
                <input value={npObs} onChange={e => setNpObs(e.target.value)}
                  placeholder="Concepto del pago…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {npPhoto && (
                <div className="flex items-center gap-2">
                  <img src={npPhoto} alt="evidencia" className="w-16 h-16 rounded object-cover border border-slate-200" />
                  <button type="button" onClick={() => setNpPhoto(null)} className="text-xs text-red-600 hover:underline">Quitar</button>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddPayment(false)} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Registrar</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Método</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Observación</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Evidencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.map(p => {
                  const pat = patients.find(x => x.id === p.patientId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-slate-700">{formatDate(p.date)}</div>
                        <div className="text-xs text-slate-400">{formatTime(p.date)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/patients/${p.patientId}`} className="font-medium text-blue-600 hover:underline">
                          {pat?.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatPEN(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {paymentMethodLabel(p.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 hidden md:table-cell">{p.observation || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {p.evidencePhotoUrl ? (
                          <a href={p.evidencePhotoUrl} target="_blank" className="inline-block">
                            <img src={p.evidencePhotoUrl} alt="evidencia" className="w-10 h-10 rounded object-cover border border-slate-200 hover:scale-110 transition-transform" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <div className="px-5 py-12 text-center text-slate-400 text-sm">Sin pagos en este filtro</div>
            )}
          </div>
        </div>
      )}

      {/* Active Plans */}
      {subTab === 'active-plans' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Progreso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Pagos</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patientPlans.filter(p => p.status === 'ACTIVE').map(pp => {
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
                      <div className="text-sm font-medium text-slate-700">{formatPEN(pp.totalPaid)} pagado</div>
                      {pp.pendingAmount > 0 ? (
                        <div className="text-xs text-orange-600 font-semibold">{formatPEN(pp.pendingAmount)} pendiente</div>
                      ) : (
                        <div className="text-xs text-emerald-600">Pagado completo</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Activo</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Installments */}
      {subTab === 'pending-installments' && (
        <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
          <div className="bg-orange-50 px-5 py-3 border-b border-orange-200">
            <div className="text-sm font-semibold text-orange-800">
              {formatPEN(pendingInstallments.reduce((s, p) => s + p.pendingAmount, 0))} en cuotas pendientes
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Paciente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Pagado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Pendiente</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingInstallments.map(pp => {
                const pat = patients.find(p => p.id === pp.patientId);
                const pt = planTypes.find(p => p.id === pp.planTypeId);
                return (
                  <tr key={pp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/patients/${pp.patientId}`} className="font-medium text-blue-600 hover:underline">
                        {pat?.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{pt?.name}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatPEN(pp.totalPaid)}</td>
                    <td className="px-4 py-3 text-right text-orange-600 font-bold">{formatPEN(pp.pendingAmount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{formatPEN(pp.totalPaid + pp.pendingAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pendingInstallments.length === 0 && (
            <div className="px-5 py-12 text-center text-slate-400 text-sm">Sin cuotas pendientes ✓</div>
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
