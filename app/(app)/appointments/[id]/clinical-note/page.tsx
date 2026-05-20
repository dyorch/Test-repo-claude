'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';
import { formatDate, formatTime } from '@/lib/utils';
import { TreatmentApplied, TractionType, POSITIONS_WORKED } from '@/lib/types';

const TREATMENT_OPTIONS: { value: TreatmentApplied; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
  { value: 'otros', label: 'Otros' },
];

const TRACTION_TYPE_OPTIONS: { value: TractionType; label: string }[] = [
  { value: 'cervical', label: 'Cervical' },
  { value: 'lumbar', label: 'Lumbar' },
  { value: 'otros', label: 'Otros' },
];

export default function ClinicalNotePage() {
  const params = useParams();
  const router = useRouter();
  const apptId = params.id as string;
  const { appointments, patients, therapists, clinicalNotes, addClinicalNote, updateClinicalNote, role, activeTherapistId } = useApp();

  const appt = appointments.find(a => a.id === apptId);
  const existing = clinicalNotes.find(n => n.appointmentId === apptId);

  const [form, setForm] = useState({
    reason: existing?.reason ?? '',
    positionsWorked: existing?.positionsWorked ?? [] as string[],
    machinesUsed: existing?.machinesUsed ?? '',
    acupuncture: (existing?.acupuncture ?? '') as TreatmentApplied,
    acupunctureDetail: existing?.acupunctureDetail ?? '',
    traction: (existing?.traction ?? '') as TreatmentApplied,
    tractionDetail: existing?.tractionDetail ?? '',
    tractionType: (existing?.tractionType ?? '') as TractionType,
    tractionTypeDetail: existing?.tractionTypeDetail ?? '',
    manual: (existing?.manual ?? '') as TreatmentApplied,
    manualDetail: existing?.manualDetail ?? '',
    chiropractic: (existing?.chiropractic ?? '') as TreatmentApplied,
    chiropracticDetail: existing?.chiropracticDetail ?? '',
    observations: existing?.observations ?? '',
  });

  if (!appt) return <div className="p-6 text-slate-500">Cita no encontrada.</div>;

  const patient = patients.find(p => p.id === appt.patientId);
  const therapist = therapists.find(t => t.id === appt.therapistId);
  const canEdit = role === 'admin' || (role === 'therapist' && appt.therapistId === activeTherapistId);

  function togglePosition(pos: string) {
    setForm(prev => ({
      ...prev,
      positionsWorked: prev.positionsWorked.includes(pos)
        ? prev.positionsWorked.filter(p => p !== pos)
        : [...prev.positionsWorked, pos],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (existing) {
      updateClinicalNote({ ...existing, ...form });
    } else {
      addClinicalNote({
        appointmentId: apptId,
        therapistId: appt!.therapistId,
        ...form,
      });
    }
    router.push(`/patients/${appt!.patientId}?tab=notes`);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/calendar" className="text-sm text-slate-400 hover:text-slate-600 mb-4 inline-flex items-center gap-1">
        ← Calendario
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: therapist?.color }}>
          {patient?.name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-slate-800">{patient?.name}</div>
          <div className="text-xs text-slate-400">
            {appt ? `${formatDate(appt.startTime)} · ${formatTime(appt.startTime)}` : ''} · {therapist?.name}
          </div>
        </div>
        {existing && (
          <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Ficha existente</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <h1 className="text-xl font-bold text-slate-800">Ficha de seguimiento</h1>

        {/* Motivo */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Motivo de la sesión</label>
            <textarea required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
              rows={2} disabled={!canEdit}
              placeholder="Razón por la que vino hoy…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-50" />
          </div>

          {/* Qué se trabajó */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">¿Qué se trabajó? (posiciones)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {POSITIONS_WORKED.map(pos => (
                <label key={pos} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${form.positionsWorked.includes(pos) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={form.positionsWorked.includes(pos)}
                    onChange={() => togglePosition(pos)} disabled={!canEdit}
                    className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm capitalize">{pos}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Máquinas utilizadas</label>
            <input value={form.machinesUsed} onChange={e => setForm({ ...form, machinesUsed: e.target.value })}
              disabled={!canEdit} placeholder="Tens, ultrasonido, crioterapia…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50" />
          </div>
        </div>

        {/* Técnicas aplicadas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Técnicas aplicadas</h3>

          {/* Acupuntura */}
          <TreatmentRow
            label="Acupuntura"
            value={form.acupuncture}
            detail={form.acupunctureDetail}
            disabled={!canEdit}
            onChange={(v, d) => setForm({ ...form, acupuncture: v, acupunctureDetail: d ?? form.acupunctureDetail })}
          />

          {/* Tracción */}
          <TreatmentRow
            label="Tracción"
            value={form.traction}
            detail={form.tractionDetail}
            disabled={!canEdit}
            onChange={(v, d) => setForm({ ...form, traction: v, tractionDetail: d ?? form.tractionDetail })}
          />
          {form.traction === 'si' && (
            <div className="ml-6 pl-3 border-l-2 border-blue-200 space-y-2">
              <label className="block text-xs font-medium text-slate-600">Tipo de tracción</label>
              <div className="flex gap-3">
                {TRACTION_TYPE_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" checked={form.tractionType === opt.value}
                      onChange={() => setForm({ ...form, tractionType: opt.value })}
                      disabled={!canEdit} className="text-blue-600" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
              {form.tractionType === 'otros' && (
                <input value={form.tractionTypeDetail}
                  onChange={e => setForm({ ...form, tractionTypeDetail: e.target.value })}
                  disabled={!canEdit} placeholder="Especifique…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50" />
              )}
            </div>
          )}

          {/* Manual */}
          <TreatmentRow
            label="Manual"
            value={form.manual}
            detail={form.manualDetail}
            disabled={!canEdit}
            onChange={(v, d) => setForm({ ...form, manual: v, manualDetail: d ?? form.manualDetail })}
          />

          {/* Quiropráctica */}
          <TreatmentRow
            label="Quiropráctica"
            value={form.chiropractic}
            detail={form.chiropracticDetail}
            disabled={!canEdit}
            onChange={(v, d) => setForm({ ...form, chiropractic: v, chiropracticDetail: d ?? form.chiropracticDetail })}
          />
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
          <textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })}
            rows={4} disabled={!canEdit}
            placeholder="Evolución, respuesta del paciente, indicaciones…"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-50" />
        </div>

        {canEdit && (
          <div className="flex gap-3 justify-end">
            <Link href="/calendar" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancelar
            </Link>
            <button type="submit" className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {existing ? 'Actualizar ficha' : 'Guardar ficha'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function TreatmentRow({ label, value, detail, disabled, onChange }: {
  label: string;
  value: TreatmentApplied;
  detail: string;
  disabled: boolean;
  onChange: (v: TreatmentApplied, d?: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-slate-700 w-28 flex-shrink-0">{label}</span>
        <div className="flex gap-3">
          {TREATMENT_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                disabled={disabled} className="text-blue-600" />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      {value === 'otros' && (
        <input value={detail}
          onChange={e => onChange(value, e.target.value)}
          disabled={disabled} placeholder="Especifique…"
          className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50" />
      )}
    </div>
  );
}
