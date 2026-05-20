'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/app-context';

const adminNav = [
  { href: '/dashboard', icon: '◉', label: 'Dashboard' },
  { href: '/calendar', icon: '▦', label: 'Calendario' },
  { href: '/patients', icon: '◎', label: 'Pacientes' },
  { href: '/payments', icon: '◈', label: 'Pagos & Planes' },
  { href: '/inventory', icon: '◰', label: 'Inventario' },
  { href: '/reports', icon: '◫', label: 'Reportes' },
  { href: '/settings', icon: '◳', label: 'Configuración' },
];

const therapistNav = [
  { href: '/calendar', icon: '▦', label: 'Mi Calendario' },
  { href: '/patients', icon: '◎', label: 'Mis Pacientes' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role, setRole, activeTherapistId, setActiveTherapistId, therapists } = useApp();
  const nav = role === 'admin' ? adminNav : therapistNav;
  const activeTherapist = therapists.find(t => t.id === activeTherapistId);

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-slate-900 text-slate-300 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">C</div>
          <div>
            <div className="text-white text-sm font-semibold leading-tight">Consultorio</div>
            <div className="text-slate-400 text-xs">Gestión de Citas</div>
          </div>
        </div>
      </div>

      {/* Role switcher */}
      <div className="px-3 py-3 border-b border-slate-700">
        <div className="text-xs text-slate-500 mb-2 px-2">Acceso actual</div>
        <div className="flex gap-1">
          <button
            onClick={() => setRole('admin')}
            className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-colors ${role === 'admin' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            Recepcionista
          </button>
          <button
            onClick={() => setRole('therapist')}
            className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-colors ${role === 'therapist' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            Terapeuta
          </button>
        </div>
        {role === 'therapist' && (
          <select
            value={activeTherapistId}
            onChange={e => setActiveTherapistId(e.target.value)}
            className="mt-2 w-full text-xs bg-slate-800 text-slate-300 rounded-md px-2 py-1.5 border border-slate-700 outline-none"
          >
            {therapists.filter(t => t.isActive).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: role === 'admin' ? '#3B82F6' : activeTherapist?.color ?? '#3B82F6' }}
          >
            {role === 'admin' ? 'R' : activeTherapist?.name.charAt(0) ?? 'T'}
          </div>
          <div className="min-w-0">
            <div className="text-slate-200 text-xs font-medium truncate">
              {role === 'admin' ? 'Recepcionista' : activeTherapist?.name ?? 'Terapeuta'}
            </div>
            <div className="text-slate-500 text-xs truncate">
              {role === 'admin' ? 'recepcion@consultorio.pe' : activeTherapist?.email ?? ''}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
