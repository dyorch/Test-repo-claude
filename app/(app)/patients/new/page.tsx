'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';

export default function NewPatientPage() {
  const router = useRouter();
  const { therapists, addPatient } = useApp();

  const [form, setForm] = useState({
    name: '', dni: '', phone: '', email: '', birthDate: '',
    emergencyContactName: '', emergencyContactPhone: '',
    consultationReason: '', medicalBackground: '', referredBy: '',
    assignedTherapistId: '',
  });

  function set(key: string, value: string) {
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
      <h1 className="text-2xl font-bold text-slate-800 mb-6 mt-2">Nuevo paciente</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Datos personales</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['name', 'Nombre completo', 'text', 'María González'],
              ['dni', 'DNI', 'text', '12345678'],
              ['phone', 'Teléfono WhatsApp', 'text', '+51987654321'],
              ['email', 'Email', 'email', 'paciente@gmail.com'],
              ['birthDate', 'Fecha de nacimiento', 'date', ''],
            ].map(([key, label, type, placeholder]) => (
              <div key={key} className={key === 'name' ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input
                  required={['name', 'phone'].includes(key as string)}
                  type={type as string}
                  placeholder={placeholder as string}
                  value={(form as any)[key]}
                  onChange={e => set(key as string, e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Terapeuta asignado</label>
              <select
                value={form.assignedTherapistId}
                onChange={e => set('assignedTherapistId', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Sin asignar</option>
                {therapists.filter(t => t.isActive).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Emergency */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Contacto de emergencia</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input value={form.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
              <input value={form.emergencyContactPhone} onChange={e => set('emergencyContactPhone', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Clinical */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Información clínica inicial</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Motivo de consulta</label>
            <textarea value={form.consultationReason} onChange={e => set('consultationReason', e.target.value)}
              rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Antecedentes médicos</label>
            <textarea value={form.medicalBackground} onChange={e => set('medicalBackground', e.target.value)}
              rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Derivado por</label>
            <input value={form.referredBy} onChange={e => set('referredBy', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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
