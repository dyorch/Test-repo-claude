'use client';
import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { formatCLP } from '@/lib/utils';

type SettingsTab = 'therapists' | 'rooms' | 'whatsapp' | 'templates' | 'hours' | 'general';

const THERAPIST_COLORS = [
  { label: 'Azul', value: '#3B82F6', bg: 'bg-blue-500' },
  { label: 'Verde', value: '#10B981', bg: 'bg-emerald-500' },
  { label: 'Naranja', value: '#F59E0B', bg: 'bg-amber-500' },
  { label: 'Violeta', value: '#8B5CF6', bg: 'bg-violet-500' },
  { label: 'Rosa', value: '#EC4899', bg: 'bg-pink-500' },
  { label: 'Rojo', value: '#EF4444', bg: 'bg-red-500' },
];

export default function SettingsPage() {
  const { therapists, rooms, whatsAppConfig, toggleTherapist, toggleRoom, updateTherapist, updateWhatsAppConfig, role } = useApp();
  const [tab, setTab] = useState<SettingsTab>('therapists');
  const [wsConfig, setWsConfig] = useState(whatsAppConfig);
  const [editingTherapist, setEditingTherapist] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editColor, setEditColor] = useState('');

  if (role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <div className="text-slate-400 text-lg mb-2">⚙</div>
        <p className="text-slate-500 text-sm">Solo el recepcionista puede acceder a la configuración.</p>
      </div>
    );
  }

  function startEdit(therapistId: string) {
    const t = therapists.find(x => x.id === therapistId);
    if (!t) return;
    setEditingTherapist(therapistId);
    setEditName(t.name);
    setEditEmail(t.email);
    setEditColor(t.color);
  }

  function saveEdit() {
    const t = therapists.find(x => x.id === editingTherapist);
    if (!t) return;
    const colorInfo = THERAPIST_COLORS.find(c => c.value === editColor);
    updateTherapist({ ...t, name: editName, email: editEmail, color: editColor, bgColor: colorInfo?.bg ?? t.bgColor });
    setEditingTherapist(null);
  }

  function saveWhatsApp() {
    updateWhatsAppConfig(wsConfig);
    alert('Configuración de WhatsApp guardada (demo)');
  }

  const settingsTabs: { id: SettingsTab; label: string }[] = [
    { id: 'therapists', label: 'Terapeutas' },
    { id: 'rooms', label: 'Habitaciones' },
    { id: 'whatsapp', label: 'WhatsApp API' },
    { id: 'templates', label: 'Plantillas' },
    { id: 'hours', label: 'Horarios' },
    { id: 'general', label: 'General' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Configuración</h1>
        <p className="text-slate-500 text-sm mt-0.5">Administración del sistema</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-44 flex-shrink-0">
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

          {/* Therapists */}
          {tab === 'therapists' && (
            <div className="space-y-3">
              <h2 className="font-semibold text-slate-800">Terapeutas</h2>
              {therapists.map(t => (
                <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  {editingTherapist === t.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
                          <input value={editName} onChange={e => setEditName(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                          <input value={editEmail} onChange={e => setEditEmail(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">Color en calendario</label>
                        <div className="flex gap-2">
                          {THERAPIST_COLORS.map(c => (
                            <button
                              key={c.value}
                              onClick={() => setEditColor(c.value)}
                              className={`w-7 h-7 rounded-full transition-transform ${editColor === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                              style={{ backgroundColor: c.value }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingTherapist(null)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                        <button onClick={saveEdit} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: t.color }}>
                        {t.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.email}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {t.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                        <button onClick={() => startEdit(t.id)} className="text-xs text-blue-600 hover:underline">Editar</button>
                        <button
                          onClick={() => toggleTherapist(t.id)}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${t.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${t.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Rooms */}
          {tab === 'rooms' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Habitaciones</h2>
              </div>
              <p className="text-sm text-slate-500">Activa o desactiva habitaciones. Una habitación desactivada no aparecerá disponible al agendar nuevas citas.</p>
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

          {/* WhatsApp API */}
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
                  onClick={() => alert('Mensaje de prueba enviado al número +56912345678 (demo)')}
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
                  <textarea
                    value={wsConfig.template24h}
                    onChange={e => setWsConfig({ ...wsConfig, template24h: e.target.value })}
                    rows={4}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs font-medium text-green-700 mb-1">Vista previa:</div>
                    <p className="text-sm text-green-800">
                      {wsConfig.template24h
                        .replace('{nombre}', 'María González')
                        .replace('{terapeuta}', 'Ana López')
                        .replace('{hora}', '10:00')}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recordatorio el día de la cita</label>
                  <textarea
                    value={wsConfig.templateDayOf}
                    onChange={e => setWsConfig({ ...wsConfig, templateDayOf: e.target.value })}
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs font-medium text-green-700 mb-1">Vista previa:</div>
                    <p className="text-sm text-green-800">
                      {wsConfig.templateDayOf
                        .replace('{nombre}', 'María González')
                        .replace('{terapeuta}', 'Ana López')
                        .replace('{hora}', '10:00')}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={saveWhatsApp} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Guardar plantillas
              </button>
            </div>
          )}

          {/* Hours */}
          {tab === 'hours' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800">Horarios de atención</h2>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {[
                  ['Lunes', true], ['Martes', true], ['Miércoles', true],
                  ['Jueves', true], ['Viernes', true], ['Sábado', false], ['Domingo', false]
                ].map(([day, active]) => (
                  <div key={day as string} className="flex items-center gap-4 px-5 py-3.5">
                    <div className={`w-24 text-sm font-medium ${active ? 'text-slate-800' : 'text-slate-400'}`}>{day as string}</div>
                    {active ? (
                      <>
                        <div className="flex items-center gap-2">
                          <select defaultValue="9" className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            {[8,9,10].map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
                          </select>
                          <span className="text-slate-400 text-sm">—</span>
                          <select defaultValue="18" className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            {[17,18,19,20].map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-slate-500">Almuerzo:</span>
                          <select defaultValue="13" className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            {[12,13,14].map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
                          </select>
                          <span className="text-xs text-slate-500">a</span>
                          <select defaultValue="14" className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            {[13,14,15].map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
                          </select>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Cerrado</span>
                    )}
                    <div className="ml-auto">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {active ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Los horarios configurados aquí se reflejarán en el calendario. La última cita posible es de 17:00 a 18:00.</p>
            </div>
          )}

          {/* General */}
          {tab === 'general' && (
            <div className="space-y-5">
              <h2 className="font-semibold text-slate-800">Configuración general</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre del consultorio</label>
                  <input defaultValue="Consultorio Privado" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Dirección</label>
                  <input defaultValue="Av. Providencia 1234, Santiago" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Zona horaria</label>
                  <select defaultValue="America/Santiago" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="America/Santiago">América/Santiago (GMT-4)</option>
                    <option value="America/Argentina/Buenos_Aires">América/Buenos Aires (GMT-3)</option>
                    <option value="America/Lima">América/Lima (GMT-5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Moneda</label>
                  <select defaultValue="CLP" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="CLP">Peso chileno (CLP)</option>
                    <option value="ARS">Peso argentino (ARS)</option>
                    <option value="PEN">Sol peruano (PEN)</option>
                    <option value="USD">Dólar (USD)</option>
                  </select>
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
