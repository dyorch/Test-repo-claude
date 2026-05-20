'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';
import {
  CHRONIC_CONDITIONS, PAIN_ZONES, RELATIONSHIP_OPTIONS,
  WorkPosture, PhysicalActivity, DominantHand,
} from '@/lib/types';

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
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '',
    chronicConditions: [] as string[],
    currentMedications: '',
    initialPainLevel: 0,
    workPosture: '' as WorkPosture,
    physicalActivity: '' as PhysicalActivity,
    painZone: '',
    dominantHand: '' as DominantHand,
  });

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleCondition(condition: string) {
    setForm(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions, condition],
    }));
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
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mano dominante</label>
              <select value={form.dominantHand} onChange={e => set('dominantHand', e.target.value as DominantHand)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Sin especificar</option>
                <option value="right">Derecha</option>
                <option value="left">Izquierda</option>
                <option value="ambidextrous">Ambidiestro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Contacto de emergencia</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input value={form.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)}
                placeholder="Juan Pérez"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Celular</label>
              <input value={form.emergencyContactPhone} onChange={e => set('emergencyContactPhone', e.target.value)}
                placeholder="+51987654321"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Parentesco</label>
              <select value={form.emergencyContactRelationship} onChange={e => set('emergencyContactRelationship', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Sin especificar</option>
                {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Zona de dolor principal</label>
              <select value={form.painZone} onChange={e => set('painZone', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Sin especificar</option>
                {PAIN_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nivel de dolor inicial (EVA): <span className="font-bold text-blue-600">{form.initialPainLevel}/10</span>
              </label>
              <input type="range" min="0" max="10" value={form.initialPainLevel}
                onChange={e => set('initialPainLevel', Number(e.target.value))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0 sin dolor</span><span>10 máximo</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Condiciones crónicas</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CHRONIC_CONDITIONS.map(c => (
                <label key={c} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors text-sm ${
                  form.chronicConditions.includes(c) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input type="checkbox" checked={form.chronicConditions.includes(c)}
                    onChange={() => toggleCondition(c)}
                    className="w-4 h-4 text-blue-600 rounded" />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Medicamentos actuales</label>
            <textarea value={form.currentMedications} onChange={e => set('currentMedications', e.target.value)}
              rows={2} placeholder="Anticoagulantes, antiinflamatorios, etc."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Postura laboral</label>
              <select value={form.workPosture} onChange={e => set('workPosture', e.target.value as WorkPosture)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Sin especificar</option>
                <option value="sedentary">Sedentario (oficina, escritorio)</option>
                <option value="active">Activo (de pie / movimiento)</option>
                <option value="mixed">Mixto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Actividad física</label>
              <select value={form.physicalActivity} onChange={e => set('physicalActivity', e.target.value as PhysicalActivity)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Sin especificar</option>
                <option value="none">Ninguna</option>
                <option value="occasional">Ocasional</option>
                <option value="regular">Regular</option>
                <option value="sportsman">Deportista</option>
              </select>
            </div>
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
