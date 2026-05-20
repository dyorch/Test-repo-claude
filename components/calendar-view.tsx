'use client';
import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Appointment } from '@/lib/types';
import { getWeekDays, isSameDay, statusSolidBg } from '@/lib/utils';
import AppointmentModal from './appointment-modal';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const LUNCH = 13;
const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay(); // 0=Sun
  const startOffset = startDow === 0 ? 6 : startDow - 1; // Mon=0
  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

interface Props {
  filterTherapistId?: string;
}

export default function CalendarView({ filterTherapistId }: Props) {
  const { appointments, patients, therapists, rooms, role, activeTherapistId } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date('2026-05-19'));
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [selectedTherapist, setSelectedTherapist] = useState(filterTherapistId ?? 'all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [newApptDate, setNewApptDate] = useState<string | undefined>();
  const [newApptHour, setNewApptHour] = useState<number | undefined>();

  const effectiveTherapist = role === 'therapist' ? activeTherapistId : selectedTherapist;

  const weekDays = view === 'week' ? getWeekDays(currentDate) : [currentDate];
  const today = new Date('2026-05-19');
  const monthDays = view === 'month' ? getMonthGrid(currentDate) : [];

  function getAppointmentsFor(date: Date, hour: number): Appointment[] {
    return appointments.filter(a => {
      const d = new Date(a.startTime);
      if (!isSameDay(d, date) || d.getHours() !== hour) return false;
      if (effectiveTherapist !== 'all') return a.therapistId === effectiveTherapist;
      return true;
    });
  }

  function getAppointmentsForDay(date: Date): Appointment[] {
    return appointments
      .filter(a => {
        if (!isSameDay(new Date(a.startTime), date)) return false;
        if (effectiveTherapist !== 'all') return a.therapistId === effectiveTherapist;
        return true;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  function handleSlotClick(date: Date, hour: number) {
    if (hour === LUNCH) return;
    setSelectedAppt(null);
    setNewApptDate(date.toISOString().split('T')[0]);
    setNewApptHour(hour);
    setModalOpen(true);
  }

  function handleApptClick(e: React.MouseEvent, appt: Appointment) {
    e.stopPropagation();
    setSelectedAppt(appt);
    setNewApptDate(undefined);
    setNewApptHour(undefined);
    setModalOpen(true);
  }

  function navigate(dir: number) {
    const d = new Date(currentDate);
    if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else if (view === 'month') { d.setMonth(d.getMonth() + dir); d.setDate(1); }
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  }

  function switchToDay(day: Date) {
    setCurrentDate(day);
    setView('day');
  }

  const cols = view === 'week' ? weekDays.length : 1;

  const headerTitle = view === 'month'
    ? currentDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
    : view === 'week'
    ? `Semana del ${weekDays[0].toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })} al ${weekDays[4].toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}`
    : currentDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-white flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600">‹</button>
          <button
            onClick={() => setCurrentDate(new Date('2026-05-19'))}
            className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Hoy
          </button>
          <button onClick={() => navigate(1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600">›</button>
        </div>

        <span className="font-semibold text-slate-800 text-sm capitalize">{headerTitle}</span>

        <div className="flex gap-1 ml-auto">
          {(['month', 'week', 'day'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${view === v ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
            </button>
          ))}
        </div>

        {role === 'admin' && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedTherapist('all')}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${selectedTherapist === 'all' ? 'bg-slate-700 text-white border-slate-700' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}
            >
              Todos
            </button>
            {therapists.filter(t => t.isActive).map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTherapist(t.id)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${selectedTherapist === t.id ? 'text-white border-transparent' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}
                style={selectedTherapist === t.id ? { backgroundColor: t.color, borderColor: t.color } : {}}
              >
                {t.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status legend */}
      <div className="flex items-center gap-3 px-6 py-2 border-b border-slate-100 bg-slate-50 flex-wrap text-xs">
        <span className="text-slate-500 font-medium">Estados:</span>
        {[
          { label: 'Sin confirmar', color: '#F59E0B' },
          { label: 'Confirmada 24h', color: '#0EA5E9' },
          { label: 'Confirmada hoy', color: '#10B981' },
          { label: 'Completada', color: '#8B5CF6' },
          { label: 'No asistió', color: '#64748B' },
          { label: 'Cancelada', color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-slate-600">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── MONTH VIEW ── */}
      {view === 'month' && (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-white sticky top-0 z-10">
            {DAYS_ES.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-slate-500 border-r border-slate-100 last:border-r-0">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, today);
              const dayAppts = getAppointmentsForDay(day);
              return (
                <div
                  key={idx}
                  className={`border-b border-r border-slate-100 p-1.5 min-h-[96px] cursor-pointer hover:bg-blue-50/30 transition-colors ${!isCurrentMonth ? 'bg-slate-50/60' : 'bg-white'}`}
                  onClick={() => switchToDay(day)}
                >
                  <div className={`w-6 h-6 text-xs font-semibold flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                    {day.getDate()}
                  </div>
                  {dayAppts.slice(0, 3).map(appt => {
                    const therapist = therapists.find(t => t.id === appt.therapistId);
                    const patient = patients.find(p => p.id === appt.patientId);
                    return (
                      <div
                        key={appt.id}
                        className="text-[10px] px-1.5 py-0.5 rounded mb-0.5 text-white truncate leading-4"
                        style={{
                          backgroundColor: statusSolidBg(appt.status),
                          borderLeft: `3px solid ${therapist?.color ?? '#94A3B8'}`,
                        }}
                        onClick={e => handleApptClick(e, appt)}
                        title={`${pad(new Date(appt.startTime).getHours())}:00 ${patient?.name}`}
                      >
                        {pad(new Date(appt.startTime).getHours())}:00 {patient?.name.split(' ')[0]}
                      </div>
                    );
                  })}
                  {dayAppts.length > 3 && (
                    <div className="text-[10px] text-slate-400 px-0.5 font-medium">+{dayAppts.length - 3} más</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WEEK / DAY VIEW ── */}
      {view !== 'month' && (
        <div className="flex-1 overflow-auto">
          <div className="cal-grid" style={{ '--cal-cols': cols } as React.CSSProperties}>
            {/* Header row */}
            <div className="sticky top-0 bg-white border-b border-r border-slate-200 z-10" />
            {weekDays.map(d => {
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={d.toISOString()}
                  className="sticky top-0 bg-white border-b border-r border-slate-200 z-10 px-2 py-2 text-center"
                >
                  <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                    {d.toLocaleDateString('es-PE', { weekday: 'short' }).toUpperCase()}
                  </div>
                  <div className={`text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center mx-auto rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-800'}`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}

            {/* Time rows */}
            {HOURS.map(hour => (
              <>
                <div key={`label-${hour}`} className="border-b border-r border-slate-100 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-slate-400">{pad(hour)}:00</span>
                </div>

                {weekDays.map(day => {
                  const isLunch = hour === LUNCH;
                  const dayAppts = isLunch ? [] : getAppointmentsFor(day, hour);
                  const isToday = isSameDay(day, today);

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={`cal-slot border-r border-slate-100 ${isLunch ? 'cal-lunch' : isToday ? 'bg-blue-50/30' : ''} ${!isLunch ? 'cursor-pointer hover:bg-slate-50' : 'cursor-not-allowed'}`}
                      onClick={() => handleSlotClick(day, hour)}
                    >
                      {isLunch && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-slate-500 font-medium">Almuerzo</span>
                        </div>
                      )}
                      {dayAppts.map((appt, apptIdx) => {
                        const patient = patients.find(p => p.id === appt.patientId);
                        const therapist = therapists.find(t => t.id === appt.therapistId);
                        const room = rooms.find(r => r.id === appt.roomId);
                        const roomShort = room?.name.replace('Habitación', 'H.') ?? '';
                        const count = dayAppts.length;
                        const slotW = `calc((100% - 6px) / ${count})`;
                        const slotL = `calc(3px + ${apptIdx} * ((100% - 6px) / ${count}))`;
                        return (
                          <div
                            key={appt.id}
                            className="appt-block-solid"
                            style={{
                              backgroundColor: statusSolidBg(appt.status),
                              borderLeftColor: therapist?.color ?? '#94A3B8',
                              left: slotL,
                              width: slotW,
                            }}
                            onClick={e => handleApptClick(e, appt)}
                          >
                            <div className="font-semibold truncate text-xs text-white leading-tight">
                              {patient?.name.split(' ')[0]}
                            </div>
                            <div className="text-[10px] text-white/80 truncate leading-tight">
                              {effectiveTherapist === 'all'
                                ? `${therapist?.name.split(' ')[0]} · ${roomShort}`
                                : roomShort
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <AppointmentModal
          appointment={selectedAppt}
          defaultDate={newApptDate}
          defaultHour={newApptHour}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
