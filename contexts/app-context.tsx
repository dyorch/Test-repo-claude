'use client';
import React, { createContext, useContext, useState } from 'react';
import {
  Therapist, Room, PlanType, Patient, PatientPlan,
  Appointment, ClinicalNote, WhatsAppConfig, AppointmentStatus
} from '@/lib/types';
import {
  therapists as initTherapists,
  rooms as initRooms,
  planTypes as initPlanTypes,
  patients as initPatients,
  patientPlans as initPatientPlans,
  appointments as initAppointments,
  clinicalNotes as initClinicalNotes,
  whatsAppConfig as initWhatsApp,
} from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

export type UserRole = 'admin' | 'therapist';

interface AppContextValue {
  role: UserRole;
  activeTherapistId: string;
  setRole: (r: UserRole) => void;
  setActiveTherapistId: (id: string) => void;
  therapists: Therapist[];
  rooms: Room[];
  planTypes: PlanType[];
  patients: Patient[];
  patientPlans: PatientPlan[];
  appointments: Appointment[];
  clinicalNotes: ClinicalNote[];
  whatsAppConfig: WhatsAppConfig;
  toggleTherapist: (id: string) => void;
  toggleRoom: (id: string) => void;
  updateTherapist: (t: Therapist) => void;
  addAppointment: (a: Omit<Appointment, 'id'>) => void;
  updateAppointment: (a: Appointment) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  addPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => void;
  updatePatient: (p: Patient) => void;
  addClinicalNote: (n: Omit<ClinicalNote, 'id' | 'createdAt'>) => void;
  updateClinicalNote: (n: ClinicalNote) => void;
  addPatientPlan: (pp: Omit<PatientPlan, 'id'>) => void;
  addPlanType: (pt: Omit<PlanType, 'id'>) => void;
  updateWhatsAppConfig: (cfg: WhatsAppConfig) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('admin');
  const [activeTherapistId, setActiveTherapistId] = useState('t1');
  const [therapists, setTherapists] = useState(initTherapists);
  const [rooms, setRooms] = useState(initRooms);
  const [planTypes, setPlanTypes] = useState(initPlanTypes);
  const [patients, setPatients] = useState(initPatients);
  const [patientPlans, setPatientPlans] = useState(initPatientPlans);
  const [appointments, setAppointments] = useState(initAppointments);
  const [clinicalNotes, setClinicalNotes] = useState(initClinicalNotes);
  const [whatsAppConfig, setWhatsAppConfig] = useState(initWhatsApp);

  function toggleTherapist(id: string) {
    setTherapists(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  }

  function toggleRoom(id: string) {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  }

  function updateTherapist(t: Therapist) {
    setTherapists(prev => prev.map(x => x.id === t.id ? t : x));
  }

  function addAppointment(a: Omit<Appointment, 'id'>) {
    setAppointments(prev => [...prev, { ...a, id: generateId() }]);
  }

  function updateAppointment(a: Appointment) {
    setAppointments(prev => prev.map(x => x.id === a.id ? a : x));
  }

  function updateAppointmentStatus(id: string, status: AppointmentStatus) {
    setAppointments(prev => prev.map(x => x.id === id ? { ...x, status } : x));
  }

  function addPatient(p: Omit<Patient, 'id' | 'createdAt'>) {
    setPatients(prev => [...prev, { ...p, id: generateId(), createdAt: new Date().toISOString().split('T')[0] }]);
  }

  function updatePatient(p: Patient) {
    setPatients(prev => prev.map(x => x.id === p.id ? p : x));
  }

  function addClinicalNote(n: Omit<ClinicalNote, 'id' | 'createdAt'>) {
    const note: ClinicalNote = { ...n, id: generateId(), createdAt: new Date().toISOString() };
    setClinicalNotes(prev => [...prev, note]);
    setAppointments(prev => prev.map(x => x.id === n.appointmentId ? { ...x, status: 'COMPLETED' } : x));
  }

  function updateClinicalNote(n: ClinicalNote) {
    setClinicalNotes(prev => prev.map(x => x.id === n.id ? n : x));
  }

  function addPatientPlan(pp: Omit<PatientPlan, 'id'>) {
    setPatientPlans(prev => [...prev, { ...pp, id: generateId() }]);
  }

  function addPlanType(pt: Omit<PlanType, 'id'>) {
    setPlanTypes(prev => [...prev, { ...pt, id: generateId() }]);
  }

  function updateWhatsAppConfig(cfg: WhatsAppConfig) {
    setWhatsAppConfig(cfg);
  }

  return (
    <AppContext.Provider value={{
      role, activeTherapistId, setRole, setActiveTherapistId,
      therapists, rooms, planTypes, patients, patientPlans,
      appointments, clinicalNotes, whatsAppConfig,
      toggleTherapist, toggleRoom, updateTherapist,
      addAppointment, updateAppointment, updateAppointmentStatus,
      addPatient, updatePatient,
      addClinicalNote, updateClinicalNote,
      addPatientPlan, addPlanType,
      updateWhatsAppConfig,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
