'use client';
import { DatePreset } from '@/lib/utils';

interface Props {
  preset: DatePreset;
  fromDate: string;
  toDate: string;
  onPresetChange: (p: DatePreset) => void;
  onFromChange: (d: string) => void;
  onToChange: (d: string) => void;
}

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'custom', label: 'Rango' },
];

export default function DateRangeFilter({
  preset, fromDate, toDate,
  onPresetChange, onFromChange, onToChange,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1">
        {PRESETS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPresetChange(p.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              preset === p.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Desde</span>
          <input
            type="date"
            value={fromDate}
            onChange={e => onFromChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-500">Hasta</span>
          <input
            type="date"
            value={toDate}
            onChange={e => onToChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
