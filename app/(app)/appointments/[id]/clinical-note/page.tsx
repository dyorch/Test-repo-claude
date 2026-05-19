'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/app-context';
import { formatDate, formatTime } from '@/lib/utils';

export default function ClinicalNotePage() {
  const params = useParams();
  const router = useRouter();
  const apptId = params.id as string;
  const { appointments, patients, therapists, clinicalNotes, addClinicalNote, updateClinicalNote, role, activeTherapistId } = useApp();

  const appt = appointments.find(a => a.id === apptId);
  const existing = clinicalNotes.find(n => n.appointmentId === apptId);

  const [content, setContent] = useState(existing?.sessionContent ?? '');
  const [observations, setObservations] = useState(existing?.observations ?? '');
  const [nextPlan, setNextPlan] = useState(existing?.nextSessionPlan ?? '');

  if (!appt) return <div className="p-6 text-slate-500">Cita no encontrada.</div>;

  const patient = patients.find(p => p.id === appt.patientId);
  const therapist = therapists.find(t => t.id === appt.therapistId);
  const canEdit = role === 'admin' || (role === 'therapist' && appt.therapistId === activeTherapistId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (existing) {
      updateClinicalNote({ ...existing, sessionContent: content, observations, nextSessionPlan: nextPlan });
    } else {
      addClinicalNote({
        appointmentId: apptId,
        therapistId: appt!.therapistId,
        sessionContent: content,
        observations,
        nextSessionPlan: nextPlan,
      });
    }
    router.push(`/patients/${appt!.patientId}?tab=notes`);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
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
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm">Ficha clínica</h2>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">¿Qué se trabajó en sesión? <span className="text-red-500">*</span></label>
            <textarea
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              disabled={!canEdit}
              placeholder="Describe las técnicas usadas, temas abordados, respuesta del paciente…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={3}
              disabled={!canEdit}
              placeholder="Estado emocional, conductas observadas, notas importantes…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Plan para próxima sesión</label>
            <textarea
              value={nextPlan}
              onChange={e => setNextPlan(e.target.value)}
              rows={3}
              disabled={!canEdit}
              placeholder="Qué se abordará en la siguiente sesión, tareas asignadas…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
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
