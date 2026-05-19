import CalendarView from '@/components/calendar-view';

export default function CalendarPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-0">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Calendario</h1>
      </div>
      <div className="flex-1 overflow-hidden mt-4">
        <CalendarView />
      </div>
    </div>
  );
}
