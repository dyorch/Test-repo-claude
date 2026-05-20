'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';

export default function NewPatientPage() {
  const router = useRouter();
  const { therapists, addPatient } = useApp();

  const [form, setForm] = useState({
    name: '', dni: '', birthDate: '',
    address: '', occupation: '',
    weight: 0, height: 0,
    phone: '', email: '',
    consultationReason: '',
    previousTreatments: false, previousTreatmentsDetail: '',
    exams: '', allergies: '',
    isPregnant: false,
    referralSource: '',
    assignedTherapistId: '',
  });

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPatient(form);
    router.push('/patients');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/patients" className="text-sm text-slate-400 hover:text-slate-600 mb-4 inline-flex items-center gap-1">
        ← Pacientes
      </Link>
      <h1 className="text-2xl font-bold text-slate-800 mb-1 mt-2">Ficha de admisión</h1>
      <p className="text-sm text-slate-500 mb-6">Nuevo paciente</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos personales */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Datos personales</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre completo *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="María Pérez Sánchez"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">DNI</label>
              <input value={form.dni} onChange={e => set('dni', e.target.value)}
                placeholder="12345678"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de nacimiento</label>
              <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Dirección</label>
              <input value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Av. Javier Prado 1234, San Isidro"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ocupación</label>
              <input value={form.occupation} onChange={e => set('occupation', e.target.value)}
                placeholder="Contadora"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Peso (kg)</label>
                <input type="number" value={form.weight || ''} onChange={e => set('weight', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Talla (cm)</label>
                <input type="number" value={form.height || ''} onChange={e => set('height', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Celular *</label>
              <input required value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+51987654321"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Correo</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="paciente@gmail.com"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Información clínica */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Información clínica</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Motivo de consulta</label>
            <textarea value={form.consultationReason} onChange={e => set('consultationReason', e.target.value)}
              rows={3} placeholder="Dolor, lesión, postura…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">¿Tratamientos previos?</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!form.previousTreatments}
                  onChange={() => { set('previousTreatments', false); set('previousTreatmentsDetail', ''); }}
                  className="text-blue-600" />
                <span className="text-sm">No</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={form.previousTreatments}
                  onChange={() => set('previousTreatments', true)}
                  className="text-blue-600" />
                <span className="text-sm">Sí</span>
              </label>
            </div>
            {form.previousTreatments && (
              <input value={form.previousTreatmentsDetail} onChange={e => set('previousTreatmentsDetail', e.target.value)}
                placeholder="Describa los tratamientos previos…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Exámenes</label>
              <textarea value={form.exams} onChange={e => set('exams', e.target.value)}
                rows={2} placeholder="RMN, ecografía, rayos X…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Alergias</label>
              <textarea value={form.allergies} onChange={e => set('allergies', e.target.value)}
                rows={2} placeholder="Medicamentos, alimentos…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPregnant}
                onChange={e => set('isPregnant', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Gestante</span>
            </label>
          </div>
        </div>

        {/* Origen */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Origen</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">¿Cómo se enteró?</label>
              <input value={form.referralSource} onChange={e => set('referralSource', e.target.value)}
                placeholder="Recomendación, redes sociales, Google…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Terapeuta asignado</label>
              <select value={form.assignedTherapistId} onChange={e => set('assignedTherapistId', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Sin asignar</option>
                {therapists.filter(t => t.isActive).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/patients" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancelar
          </Link>
          <button type="submit" className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Crear paciente
          </button>
        </div>
      </form>
    </div>
  );
}
