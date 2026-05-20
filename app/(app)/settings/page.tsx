'use client';
import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Therapist } from '@/lib/types';

type SettingsTab = 'therapists' | 'rooms' | 'whatsapp' | 'templates' | 'general';

const THERAPIST_COLORS = [
  { label: 'Azul', value: '#3B82F6', bg: 'bg-blue-500' },
  { label: 'Verde', value: '#10B981', bg: 'bg-emerald-500' },
  { label: 'Naranja', value: '#F59E0B', bg: 'bg-amber-500' },
  { label: 'Violeta', value: '#8B5CF6', bg: 'bg-violet-500' },
  { label: 'Rosa', value: '#EC4899', bg: 'bg-pink-500' },
  { label: 'Rojo', value: '#EF4444', bg: 'bg-red-500' },
];

const DAYS_OF_WEEK = [
  { num: 1, label: 'Lun' },
  { num: 2, label: 'Mar' },
  { num: 3, label: 'Mié' },
  { num: 4, label: 'Jue' },
  { num: 5, label: 'Vie' },
  { num: 6, label: 'Sáb' },
  { num: 0, label: 'Dom' },
];

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

export default function SettingsPage() {
  const { therapists, rooms, whatsAppConfig, toggleTherapist, toggleRoom, updateTherapist, updateWhatsAppConfig, role } = useApp();
  const [tab, setTab] = useState<SettingsTab>('therapists');
  const [wsConfig, setWsConfig] = useState(whatsAppConfig);
  const [editingTherapist, setEditingTherapist] = useState<string | null>(null);

  if (role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <div className="text-slate-400 text-lg mb-2">⚙</div>
        <p className="text-slate-500 text-sm">Solo el recepcionista puede acceder a la configuración.</p>
      </div>
    );
  }

  function saveWhatsApp() {
    updateWhatsAppConfig(wsConfig);
    alert('Configuración de WhatsApp guardada (demo)');
  }

  const settingsTabs: { id: SettingsTab; label: string }[] = [
    { id: 'therapists', label: 'Terapeutas y horarios' },
    { id: 'rooms', label: 'Consultorios' },
    { id: 'whatsapp', label: 'WhatsApp API' },
    { id: 'templates', label: 'Plantillas' },
    { id: 'general', label: 'General' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500 text-sm mt-0.5">Administración del sistema</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {settingsTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${tab === t.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Therapists with hours */}
          {tab === 'therapists' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-slate-800">Terapeutas y horarios</h2>
              <p className="text-sm text-slate-500">Cada terapeuta tiene su propio horario configurable.</p>
              {therapists.map(t => (
                <TherapistCard
                  key={t.id}
                  therapist={t}
                  isEditing={editingTherapist === t.id}
                  onEdit={() => setEditingTherapist(t.id)}
                  onCancel={() => setEditingTherapist(null)}
                  onSave={(updated) => { updateTherapist(updated); setEditingTherapist(null); }}
                  onToggle={() => toggleTherapist(t.id)}
                />
              ))}
            </div>
          )}

          {/* Rooms */}
          {tab === 'rooms' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-slate-800">Consultorios</h2>
              <p className="text-sm text-slate-500">Activa o desactiva consultorios. Un consultorio desactivado no aparecerá disponible al agendar nuevas citas.</p>
              {rooms.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ${r.isActive ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    {r.name.split(' ')[1]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.isActive ? 'Disponible para citas' : 'Cerrada — no disponible para nuevas citas'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {r.isActive ? 'Abierta' : 'Cerrada'}
                    </span>
                    <button
                      onClick={() => toggleRoom(r.id)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${r.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${r.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WhatsApp */}
          {tab === 'whatsapp' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-800">Configuración WhatsApp API</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Modo demo:</strong> Los cambios se guardan localmente. En producción, aquí se conecta la API de Meta WhatsApp Business o Twilio.
              </div>
              {[
                { key: 'accountSid', label: 'Account SID', type: 'text' },
                { key: 'authToken', label: 'Auth Token', type: 'password' },
                { key: 'fromNumber', label: 'Número de origen', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
                  <input
                    type={field.type}
                    value={(wsConfig as any)[field.key]}
                    onChange={e => setWsConfig({ ...wsConfig, [field.key]: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={saveWhatsApp} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Guardar configuración
                </button>
                <button
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  onClick={() => alert('Mensaje de prueba enviado al número +51987654321 (demo)')}
                >
                  Enviar mensaje de prueba
                </button>
              </div>
            </div>
          )}

          {/* Templates */}
          {tab === 'templates' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800">Plantillas de mensajes</h2>
              <p className="text-sm text-slate-500">Usa las variables <code className="bg-slate-100 px-1 rounded">{'{nombre}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{terapeuta}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{hora}'}</code> en tus mensajes.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recordatorio 24 horas antes</label>
                  <textarea value={wsConfig.template24h} onChange={e => setWsConfig({ ...wsConfig, template24h: e.target.value })}
                    rows={4}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <div className="mt-2 p-3 bg-sky-50 rounded-lg border border-sky-200">
                    <div className="text-xs font-medium text-sky-700 mb-1">Vista previa:</div>
                    <p className="text-sm text-sky-800">
                      {wsConfig.template24h.replace('{nombre}', 'María González').replace('{terapeuta}', 'Ana López').replace('{hora}', '10:00')}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recordatorio el día de la cita</label>
                  <textarea value={wsConfig.templateDayOf} onChange={e => setWsConfig({ ...wsConfig, templateDayOf: e.target.value })}
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs font-medium text-green-700 mb-1">Vista previa:</div>
                    <p className="text-sm text-green-800">
                      {wsConfig.templateDayOf.replace('{nombre}', 'María González').replace('{terapeuta}', 'Ana López').replace('{hora}', '10:00')}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={saveWhatsApp} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Guardar plantillas
              </button>
            </div>
          )}

          {/* General */}
          {tab === 'general' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800">Configuración general</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre del consultorio</label>
                  <input defaultValue="Consultorio de Fisioterapia" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Dirección</label>
                  <input defaultValue="Av. Javier Prado Este 1234, San Isidro, Lima" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Zona horaria</label>
                  <select defaultValue="America/Lima" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="America/Lima">América/Lima (GMT-5)</option>
                    <option value="America/Bogota">América/Bogotá (GMT-5)</option>
                    <option value="America/Santiago">América/Santiago (GMT-4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Moneda</label>
                  <div className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 select-none">
                    Sol peruano (S/. — PEN)
                  </div>
                  <p className="text-xs text-slate-400 mt-1">La moneda es fija para este consultorio.</p>
                </div>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Guardar cambios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TherapistCardProps {
  therapist: Therapist;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (t: Therapist) => void;
  onToggle: () => void;
}

function TherapistCard({ therapist, isEditing, onEdit, onCancel, onSave, onToggle }: TherapistCardProps) {
  const [form, setForm] = useState<Therapist>(therapist);

  function toggleDay(day: number) {
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort(),
    }));
  }

  if (!isEditing) {
    const workingDaysLabels = DAYS_OF_WEEK
      .filter(d => therapist.workingDays.includes(d.num))
      .map(d => d.label).join(' ');

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: therapist.color }}>
            {therapist.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="font-medium text-slate-800">{therapist.name}</div>
            <div className="text-xs text-slate-400">{therapist.email}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${therapist.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {therapist.isActive ? 'Activo' : 'Inactivo'}
            </span>
            <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">Editar</button>
            <button
              onClick={onToggle}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${therapist.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${therapist.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-slate-400">Horario</div>
            <div className="text-slate-700 font-medium">{String(therapist.startHour).padStart(2,'0')}:00 — {String(therapist.endHour).padStart(2,'0')}:00</div>
          </div>
          <div>
            <div className="text-slate-400">Almuerzo</div>
            <div className="text-slate-700 font-medium">{String(therapist.lunchStart).padStart(2,'0')}:00 — {String(therapist.lunchEnd).padStart(2,'0')}:00</div>
          </div>
          <div>
            <div className="text-slate-400">Días</div>
            <div className="text-slate-700 font-medium">{workingDaysLabels}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Color en calendario</label>
        <div className="flex gap-2">
          {THERAPIST_COLORS.map(c => (
            <button key={c.value} type="button" onClick={() => setForm({ ...form, color: c.value, bgColor: c.bg })}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
              style={{ backgroundColor: c.value }} title={c.label} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hora inicio</label>
          <select value={form.startHour} onChange={e => setForm({ ...form, startHour: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Hora fin</label>
          <select value={form.endHour} onChange={e => setForm({ ...form, endHour: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Almuerzo desde</label>
          <select value={form.lunchStart} onChange={e => setForm({ ...form, lunchStart: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Almuerzo hasta</label>
          <select value={form.lunchEnd} onChange={e => setForm({ ...form, lunchEnd: Number(e.target.value) })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Días que trabaja</label>
        <div className="flex gap-2">
          {DAYS_OF_WEEK.map(d => (
            <button key={d.num} type="button" onClick={() => toggleDay(d.num)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${form.workingDays.includes(d.num) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
        <button onClick={() => onSave(form)} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
      </div>
    </div>
  );
}
