'use client';
import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Appointment } from '@/lib/types';
import { getWeekDays, isSameDay, statusDot } from '@/lib/utils';
import AppointmentModal from './appointment-modal';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const LUNCH = 13;

function pad(n: number) { return String(n).padStart(2, '0'); }

interface Props {
  filterTherapistId?: string;
}

export default function CalendarView({ filterTherapistId }: Props) {
  const { appointments, patients, therapists, rooms, role, activeTherapistId } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date('2026-05-19'));
  const [view, setView] = useState<'week' | 'day'>('week');
  const [selectedTherapist, setSelectedTherapist] = useState(filterTherapistId ?? 'all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [newApptDate, setNewApptDate] = useState<string | undefined>();
  const [newApptHour, setNewApptHour] = useState<number | undefined>();

  const effectiveTherapist = role === 'therapist' ? activeTherapistId : selectedTherapist;

  const weekDays = view === 'week' ? getWeekDays(currentDate) : [currentDate];
  const today = new Date('2026-05-19');

  function getAppointmentsFor(date: Date, hour: number): Appointment[] {
    return appointments.filter(a => {
      const d = new Date(a.startTime);
      const match = isSameDay(d, date) && d.getHours() === hour;
      if (!match) return false;
      if (effectiveTherapist !== 'all') return a.therapistId === effectiveTherapist;
      return true;
    });
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
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  }

  const cols = view === 'week' ? weekDays.length : 1;

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

        <span className="font-semibold text-slate-800 text-sm">
          {view === 'week'
            ? `Semana del ${weekDays[0].toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })} al ${weekDays[4].toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : currentDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
          }
        </span>

        <div className="flex gap-1 ml-auto">
          {['week', 'day'].map(v => (
            <button
              key={v}
              onClick={() => setView(v as 'week' | 'day')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${view === v ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {v === 'week' ? 'Semana' : 'Día'}
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

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="cal-grid" style={{ '--cal-cols': cols } as React.CSSProperties}>
          {/* Header row */}
          <div className="sticky top-0 bg-white border-b border-r border-slate-200 z-10" />
          {weekDays.map(d => {
            const isToday = isSameDay(d, today);
            return (
              <div
                key={d.toISOString()}
                className={`sticky top-0 bg-white border-b border-r border-slate-200 z-10 px-2 py-2 text-center`}
              >
                <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                  {d.toLocaleDateString('es-CL', { weekday: 'short' }).toUpperCase()}
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
              {/* Time label */}
              <div key={`label-${hour}`} className="border-b border-r border-slate-100 flex items-start justify-end pr-2 pt-1">
                <span className="text-xs text-slate-400">{pad(hour)}:00</span>
              </div>

              {/* Day columns */}
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
                        <span className="text-xs text-slate-400 font-medium">Almuerzo</span>
                      </div>
                    )}
                    {dayAppts.map((appt, apptIdx) => {
                      const patient = patients.find(p => p.id === appt.patientId);
                      const therapist = therapists.find(t => t.id === appt.therapistId);
                      const count = dayAppts.length;
                      const bgColors: Record<string, string> = {
                        SCHEDULED: '#FFFBEB', CONFIRMED: '#ECFDF5', CANCELLED: '#FEF2F2',
                        NO_SHOW: '#F5F3FF', COMPLETED: '#F8FAFC',
                      };
                      const textColors: Record<string, string> = {
                        SCHEDULED: '#92400E', CONFIRMED: '#065F46', CANCELLED: '#991B1B',
                        NO_SHOW: '#5B21B6', COMPLETED: '#475569',
                      };
                      const slotW = `calc((100% - 6px) / ${count})`;
                      const slotL = `calc(3px + ${apptIdx} * ((100% - 6px) / ${count}))`;
                      return (
                        <div
                          key={appt.id}
                          className="appt-block"
                          style={{
                            backgroundColor: bgColors[appt.status],
                            borderLeftColor: therapist?.color ?? '#94A3B8',
                            color: textColors[appt.status],
                            left: slotL,
                            width: slotW,
                            right: 'auto',
                          }}
                          onClick={e => handleApptClick(e, appt)}
                        >
                          <div className="font-medium truncate text-xs">{patient?.name.split(' ')[0]}</div>
                          {effectiveTherapist === 'all' && (
                            <div className="text-xs opacity-70 truncate">{therapist?.name.split(' ')[0]}</div>
                          )}
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
