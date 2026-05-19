import {
  Therapist, Room, PlanType, Patient, PatientPlan,
  Appointment, ClinicalNote, WhatsAppConfig
} from './types';

export const therapists: Therapist[] = [
  { id: 't1', name: 'Ana López', email: 'ana@consultorio.cl', color: '#3B82F6', bgColor: 'bg-blue-500', isActive: true },
  { id: 't2', name: 'Pedro García', email: 'pedro@consultorio.cl', color: '#10B981', bgColor: 'bg-emerald-500', isActive: true },
  { id: 't3', name: 'Laura Martínez', email: 'laura@consultorio.cl', color: '#F59E0B', bgColor: 'bg-amber-500', isActive: true },
];

export const rooms: Room[] = [
  { id: 'r1', name: 'Habitación 1', isActive: true },
  { id: 'r2', name: 'Habitación 2', isActive: true },
  { id: 'r3', name: 'Habitación 3', isActive: true },
];

export const planTypes: PlanType[] = [
  { id: 'p1', name: 'Pack 10 sesiones', sessionCount: 10, price: 150000, description: 'Paquete de 10 sesiones con precio preferencial' },
  { id: 'p2', name: 'Pack 5 sesiones', sessionCount: 5, price: 80000, description: 'Paquete de 5 sesiones' },
  { id: 'p3', name: 'Sesión individual', sessionCount: 1, price: 18000, description: 'Sesión de pago individual' },
];

export const patients: Patient[] = [
  {
    id: 'pa1', name: 'María González', rut: '12.345.678-9', phone: '+56912345678',
    email: 'maria.gonzalez@gmail.com', birthDate: '1989-03-15',
    emergencyContactName: 'Roberto González', emergencyContactPhone: '+56998765432',
    consultationReason: 'Ansiedad generalizada y estrés laboral',
    medicalBackground: 'Sin antecedentes relevantes', referredBy: 'Dr. Soto',
    assignedTherapistId: 't1', createdAt: '2025-08-10',
  },
  {
    id: 'pa2', name: 'Carlos Rodríguez', rut: '11.234.567-8', phone: '+56911234567',
    email: 'carlos.rodriguez@outlook.com', birthDate: '1985-07-22',
    emergencyContactName: 'Luisa Rodríguez', emergencyContactPhone: '+56987654321',
    consultationReason: 'Depresión leve, dificultades en relaciones interpersonales',
    medicalBackground: 'Hipotiroidismo controlado', referredBy: 'Derivación Isapre',
    assignedTherapistId: 't2', createdAt: '2025-10-05',
  },
  {
    id: 'pa3', name: 'Sofía Fernández', rut: '13.456.789-0', phone: '+56913456789',
    email: 'sofia.f@gmail.com', birthDate: '1995-11-08',
    emergencyContactName: 'Carmen Fernández', emergencyContactPhone: '+56976543210',
    consultationReason: 'Manejo de duelo y transición laboral',
    medicalBackground: 'Sin antecedentes', referredBy: 'Recomendación personal',
    assignedTherapistId: 't3', createdAt: '2025-11-20',
  },
  {
    id: 'pa4', name: 'Diego Morales', rut: '14.567.890-1', phone: '+56914567890',
    email: 'diego.morales@gmail.com', birthDate: '1992-05-30',
    emergencyContactName: 'Patricia Morales', emergencyContactPhone: '+56965432109',
    consultationReason: 'Fobia social y crisis de pánico',
    medicalBackground: 'En tratamiento psiquiátrico con Dr. Arenas', referredBy: 'Dr. Arenas',
    assignedTherapistId: 't1', createdAt: '2025-09-03',
  },
  {
    id: 'pa5', name: 'Valentina Torres', rut: '15.678.901-2', phone: '+56915678901',
    email: 'vale.torres@gmail.com', birthDate: '1998-02-14',
    emergencyContactName: 'Hugo Torres', emergencyContactPhone: '+56954321098',
    consultationReason: 'Autoestima, dificultades en la adolescencia tardía',
    medicalBackground: 'Sin antecedentes', referredBy: 'Dr. Soto',
    assignedTherapistId: 't2', createdAt: '2025-07-15',
  },
  {
    id: 'pa6', name: 'Martín Herrera', rut: '16.789.012-3', phone: '+56916789012',
    email: 'martin.h@gmail.com', birthDate: '1980-09-25',
    emergencyContactName: 'Andrea Herrera', emergencyContactPhone: '+56943210987',
    consultationReason: 'Conflictos de pareja, comunicación',
    medicalBackground: 'Sin antecedentes', referredBy: 'Recomendación personal',
    assignedTherapistId: 't3', createdAt: '2026-01-08',
  },
  {
    id: 'pa7', name: 'Camila Ruiz', rut: '17.890.123-4', phone: '+56917890123',
    email: 'camila.ruiz@yahoo.com', birthDate: '1993-12-01',
    emergencyContactName: 'Elena Ruiz', emergencyContactPhone: '+56932109876',
    consultationReason: 'Trastorno de ansiedad, hipocondría',
    medicalBackground: 'Asma leve', referredBy: 'Dr. Soto',
    assignedTherapistId: 't1', createdAt: '2025-06-20',
  },
  {
    id: 'pa8', name: 'Felipe Castro', rut: '18.901.234-5', phone: '+56918901234',
    email: 'fcastro@gmail.com', birthDate: '1987-04-18',
    emergencyContactName: 'Isabel Castro', emergencyContactPhone: '+56921098765',
    consultationReason: 'Estrés por cambio de trabajo, insomnio',
    medicalBackground: 'Sin antecedentes', referredBy: 'Recomendación personal',
    assignedTherapistId: 't2', createdAt: '2026-02-14',
  },
  {
    id: 'pa9', name: 'Isadora Vargas', rut: '19.012.345-6', phone: '+56919012345',
    email: 'isadora.v@gmail.com', birthDate: '1991-08-07',
    emergencyContactName: 'Rodrigo Vargas', emergencyContactPhone: '+56910987654',
    consultationReason: 'Trauma de infancia, PTSD leve',
    medicalBackground: 'En tratamiento con psiquiatra', referredBy: 'Dr. Arenas',
    assignedTherapistId: 't3', createdAt: '2025-12-01',
  },
  {
    id: 'pa10', name: 'Benjamín Silva', rut: '20.123.456-7', phone: '+56920123456',
    email: 'bensilva@gmail.com', birthDate: '1996-06-11',
    emergencyContactName: 'Sandra Silva', emergencyContactPhone: '+56909876543',
    consultationReason: 'Déficit atencional en adultos, organización',
    medicalBackground: 'TDAH diagnosticado', referredBy: 'Derivación neurólogo',
    assignedTherapistId: 't1', createdAt: '2026-03-05',
  },
];

export const patientPlans: PatientPlan[] = [
  { id: 'pp1', patientId: 'pa1', planTypeId: 'p1', totalSessions: 10, usedSessions: 6, totalPaid: 150000, startDate: '2025-08-10', status: 'ACTIVE' },
  { id: 'pp2', patientId: 'pa2', planTypeId: 'p2', totalSessions: 5, usedSessions: 4, totalPaid: 80000, startDate: '2025-10-05', status: 'ACTIVE' },
  { id: 'pp3', patientId: 'pa4', planTypeId: 'p1', totalSessions: 10, usedSessions: 2, totalPaid: 150000, startDate: '2025-09-03', status: 'ACTIVE' },
  { id: 'pp4', patientId: 'pa5', planTypeId: 'p2', totalSessions: 5, usedSessions: 5, totalPaid: 80000, startDate: '2025-07-15', status: 'COMPLETED' },
  { id: 'pp5', patientId: 'pa7', planTypeId: 'p1', totalSessions: 10, usedSessions: 8, totalPaid: 150000, startDate: '2025-06-20', status: 'ACTIVE' },
  { id: 'pp6', patientId: 'pa8', planTypeId: 'p2', totalSessions: 5, usedSessions: 1, totalPaid: 80000, startDate: '2026-02-14', status: 'ACTIVE' },
  { id: 'pp7', patientId: 'pa9', planTypeId: 'p1', totalSessions: 10, usedSessions: 4, totalPaid: 150000, startDate: '2025-12-01', status: 'ACTIVE' },
];

// Week of 2026-05-18 (Mon) to 2026-05-22 (Fri)
export const appointments: Appointment[] = [
  // Monday 2026-05-18
  { id: 'a1', patientId: 'pa1', therapistId: 't1', roomId: 'r1', startTime: '2026-05-18T09:00', endTime: '2026-05-18T10:00', status: 'COMPLETED', patientPlanId: 'pp1', paymentStatus: 'PAID', paymentAmount: 15000, paymentMethod: 'TRANSFER', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a2', patientId: 'pa4', therapistId: 't2', roomId: 'r2', startTime: '2026-05-18T09:00', endTime: '2026-05-18T10:00', status: 'COMPLETED', patientPlanId: 'pp3', paymentStatus: 'PAID', paymentAmount: 15000, paymentMethod: 'CASH', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a3', patientId: 'pa7', therapistId: 't1', roomId: 'r1', startTime: '2026-05-18T10:00', endTime: '2026-05-18T11:00', status: 'COMPLETED', patientPlanId: 'pp5', paymentStatus: 'PAID', paymentAmount: 15000, paymentMethod: 'TRANSFER', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a4', patientId: 'pa8', therapistId: 't2', roomId: 'r2', startTime: '2026-05-18T10:00', endTime: '2026-05-18T11:00', status: 'COMPLETED', patientPlanId: 'pp6', paymentStatus: 'PAID', paymentAmount: 16000, paymentMethod: 'CASH', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a5', patientId: 'pa9', therapistId: 't3', roomId: 'r3', startTime: '2026-05-18T11:00', endTime: '2026-05-18T12:00', status: 'COMPLETED', patientPlanId: 'pp7', paymentStatus: 'PAID', paymentAmount: 15000, paymentMethod: 'TRANSFER', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a6', patientId: 'pa3', therapistId: 't3', roomId: 'r3', startTime: '2026-05-18T14:00', endTime: '2026-05-18T15:00', status: 'COMPLETED', patientPlanId: null, paymentStatus: 'PAID', paymentAmount: 18000, paymentMethod: 'CARD', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a7', patientId: 'pa10', therapistId: 't1', roomId: 'r1', startTime: '2026-05-18T15:00', endTime: '2026-05-18T16:00', status: 'COMPLETED', patientPlanId: null, paymentStatus: 'PAID', paymentAmount: 18000, paymentMethod: 'CASH', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a8', patientId: 'pa6', therapistId: 't2', roomId: 'r2', startTime: '2026-05-18T16:00', endTime: '2026-05-18T17:00', status: 'COMPLETED', patientPlanId: null, paymentStatus: 'PAID', paymentAmount: 18000, paymentMethod: 'TRANSFER', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },

  // Tuesday 2026-05-19 (today)
  { id: 'a9', patientId: 'pa2', therapistId: 't1', roomId: 'r1', startTime: '2026-05-19T09:00', endTime: '2026-05-19T10:00', status: 'CONFIRMED', patientPlanId: 'pp2', paymentStatus: 'PAID', paymentAmount: 16000, paymentMethod: 'TRANSFER', notes: 'Traer ejercicios de la sesión anterior', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a10', patientId: 'pa1', therapistId: 't2', roomId: 'r2', startTime: '2026-05-19T10:00', endTime: '2026-05-19T11:00', status: 'CONFIRMED', patientPlanId: 'pp1', paymentStatus: 'PAID', paymentAmount: 15000, paymentMethod: 'TRANSFER', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a11', patientId: 'pa5', therapistId: 't3', roomId: 'r3', startTime: '2026-05-19T11:00', endTime: '2026-05-19T12:00', status: 'SCHEDULED', patientPlanId: 'pp4', paymentStatus: 'WAIVED', paymentAmount: 0, paymentMethod: null, notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a12', patientId: 'pa4', therapistId: 't1', roomId: 'r1', startTime: '2026-05-19T14:00', endTime: '2026-05-19T15:00', status: 'SCHEDULED', patientPlanId: 'pp3', paymentStatus: 'PENDING', paymentAmount: 15000, paymentMethod: null, notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a13', patientId: 'pa7', therapistId: 't2', roomId: 'r2', startTime: '2026-05-19T15:00', endTime: '2026-05-19T16:00', status: 'CANCELLED', patientPlanId: 'pp5', paymentStatus: 'WAIVED', paymentAmount: 0, paymentMethod: null, notes: 'Paciente canceló por emergencia familiar', whatsappReminderSent: true, whatsappDayOfSent: false },
  { id: 'a14', patientId: 'pa9', therapistId: 't3', roomId: 'r3', startTime: '2026-05-19T16:00', endTime: '2026-05-19T17:00', status: 'CONFIRMED', patientPlanId: 'pp7', paymentStatus: 'PAID', paymentAmount: 15000, paymentMethod: 'CARD', notes: '', whatsappReminderSent: true, whatsappDayOfSent: true },
  { id: 'a15', patientId: 'pa8', therapistId: 't1', roomId: 'r1', startTime: '2026-05-19T17:00', endTime: '2026-05-19T18:00', status: 'SCHEDULED', patientPlanId: 'pp6', paymentStatus: 'PENDING', paymentAmount: 16000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },

  // Wednesday 2026-05-20
  { id: 'a16', patientId: 'pa3', therapistId: 't3', roomId: 'r3', startTime: '2026-05-20T09:00', endTime: '2026-05-20T10:00', status: 'SCHEDULED', patientPlanId: null, paymentStatus: 'PENDING', paymentAmount: 18000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a17', patientId: 'pa10', therapistId: 't1', roomId: 'r1', startTime: '2026-05-20T10:00', endTime: '2026-05-20T11:00', status: 'SCHEDULED', patientPlanId: null, paymentStatus: 'PENDING', paymentAmount: 18000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a18', patientId: 'pa6', therapistId: 't2', roomId: 'r2', startTime: '2026-05-20T11:00', endTime: '2026-05-20T12:00', status: 'CONFIRMED', patientPlanId: null, paymentStatus: 'PENDING', paymentAmount: 18000, paymentMethod: null, notes: '', whatsappReminderSent: true, whatsappDayOfSent: false },
  { id: 'a19', patientId: 'pa1', therapistId: 't1', roomId: 'r1', startTime: '2026-05-20T14:00', endTime: '2026-05-20T15:00', status: 'SCHEDULED', patientPlanId: 'pp1', paymentStatus: 'PENDING', paymentAmount: 15000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a20', patientId: 'pa2', therapistId: 't2', roomId: 'r2', startTime: '2026-05-20T15:00', endTime: '2026-05-20T16:00', status: 'SCHEDULED', patientPlanId: 'pp2', paymentStatus: 'PENDING', paymentAmount: 16000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a21', patientId: 'pa5', therapistId: 't3', roomId: 'r3', startTime: '2026-05-20T16:00', endTime: '2026-05-20T17:00', status: 'SCHEDULED', patientPlanId: null, paymentStatus: 'PENDING', paymentAmount: 18000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a22', patientId: 'pa4', therapistId: 't1', roomId: 'r1', startTime: '2026-05-20T17:00', endTime: '2026-05-20T18:00', status: 'SCHEDULED', patientPlanId: 'pp3', paymentStatus: 'PENDING', paymentAmount: 15000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },

  // Thursday 2026-05-21
  { id: 'a23', patientId: 'pa8', therapistId: 't2', roomId: 'r2', startTime: '2026-05-21T09:00', endTime: '2026-05-21T10:00', status: 'SCHEDULED', patientPlanId: 'pp6', paymentStatus: 'PENDING', paymentAmount: 16000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a24', patientId: 'pa9', therapistId: 't3', roomId: 'r3', startTime: '2026-05-21T10:00', endTime: '2026-05-21T11:00', status: 'SCHEDULED', patientPlanId: 'pp7', paymentStatus: 'PENDING', paymentAmount: 15000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a25', patientId: 'pa7', therapistId: 't1', roomId: 'r1', startTime: '2026-05-21T11:00', endTime: '2026-05-21T12:00', status: 'SCHEDULED', patientPlanId: 'pp5', paymentStatus: 'PENDING', paymentAmount: 15000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a26', patientId: 'pa3', therapistId: 't3', roomId: 'r3', startTime: '2026-05-21T14:00', endTime: '2026-05-21T15:00', status: 'SCHEDULED', patientPlanId: null, paymentStatus: 'PENDING', paymentAmount: 18000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a27', patientId: 'pa10', therapistId: 't2', roomId: 'r2', startTime: '2026-05-21T15:00', endTime: '2026-05-21T16:00', status: 'SCHEDULED', patientPlanId: null, paymentStatus: 'PENDING', paymentAmount: 18000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a28', patientId: 'pa6', therapistId: 't1', roomId: 'r1', startTime: '2026-05-21T16:00', endTime: '2026-05-21T17:00', status: 'SCHEDULED', patientPlanId: null, paymentStatus: 'PENDING', paymentAmount: 18000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },

  // Friday 2026-05-22
  { id: 'a29', patientId: 'pa1', therapistId: 't1', roomId: 'r1', startTime: '2026-05-22T09:00', endTime: '2026-05-22T10:00', status: 'SCHEDULED', patientPlanId: 'pp1', paymentStatus: 'PENDING', paymentAmount: 15000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a30', patientId: 'pa2', therapistId: 't3', roomId: 'r3', startTime: '2026-05-22T10:00', endTime: '2026-05-22T11:00', status: 'SCHEDULED', patientPlanId: 'pp2', paymentStatus: 'PENDING', paymentAmount: 16000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a31', patientId: 'pa4', therapistId: 't2', roomId: 'r2', startTime: '2026-05-22T11:00', endTime: '2026-05-22T12:00', status: 'SCHEDULED', patientPlanId: 'pp3', paymentStatus: 'PENDING', paymentAmount: 15000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a32', patientId: 'pa5', therapistId: 't1', roomId: 'r1', startTime: '2026-05-22T14:00', endTime: '2026-05-22T15:00', status: 'SCHEDULED', patientPlanId: null, paymentStatus: 'PENDING', paymentAmount: 18000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a33', patientId: 'pa8', therapistId: 't3', roomId: 'r3', startTime: '2026-05-22T15:00', endTime: '2026-05-22T16:00', status: 'SCHEDULED', patientPlanId: 'pp6', paymentStatus: 'PENDING', paymentAmount: 16000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
  { id: 'a34', patientId: 'pa9', therapistId: 't2', roomId: 'r2', startTime: '2026-05-22T17:00', endTime: '2026-05-22T18:00', status: 'SCHEDULED', patientPlanId: 'pp7', paymentStatus: 'PENDING', paymentAmount: 15000, paymentMethod: null, notes: '', whatsappReminderSent: false, whatsappDayOfSent: false },
];

export const clinicalNotes: ClinicalNote[] = [
  { id: 'cn1', appointmentId: 'a1', therapistId: 't1', sessionContent: 'Se trabajaron técnicas de respiración y relajación muscular progresiva. Paciente mostró buena disposición y logró reducir la tensión durante la sesión.', observations: 'Mayor apertura emocional que en sesiones anteriores. Reporta mejora en calidad del sueño.', nextSessionPlan: 'Introducir registro de pensamientos automáticos. Tarea: diario de emociones diario.', createdAt: '2026-05-18T10:30' },
  { id: 'cn2', appointmentId: 'a2', therapistId: 't2', sessionContent: 'Exploración de patrones de evitación en situaciones sociales. Role-playing de situaciones cotidianas.', observations: 'Resistencia inicial pero buena colaboración al avanzar la sesión. Identifica 3 situaciones de evitación clave.', nextSessionPlan: 'Exposición gradual: empezar con llamadas telefónicas cortas esta semana.', createdAt: '2026-05-18T10:30' },
  { id: 'cn3', appointmentId: 'a3', therapistId: 't1', sessionContent: 'Revisión de registro de síntomas somáticos. Psicoeducación sobre el ciclo ansiedad-síntoma-interpretación.', observations: 'Paciente logra identificar el ciclo. Menor catastrofización en el lenguaje.', nextSessionPlan: 'Técnica de defusión cognitiva con pensamientos hipocondríacos.', createdAt: '2026-05-18T11:30' },
  { id: 'cn4', appointmentId: 'a5', therapistId: 't3', sessionContent: 'Procesamiento de memoria traumática específica usando técnica narrativa. Reencuadre del evento.', observations: 'Sesión intensa emocionalmente. Paciente necesitó tiempo de cierre. Sale estable.', nextSessionPlan: 'Continuar con siguiente fragmento de narrativa. Revisar recursos de autocuidado.', createdAt: '2026-05-18T12:30' },
  { id: 'cn5', appointmentId: 'a6', therapistId: 't3', sessionContent: 'Exploración del proceso de duelo. Identificación de las etapas y en cuál se encuentra.', observations: 'Llanto al recordar momentos compartidos. Muestra recursos emocionales importantes.', nextSessionPlan: 'Técnica de carta a la persona perdida. Ritual de despedida simbólico.', createdAt: '2026-05-18T15:30' },
  { id: 'cn6', appointmentId: 'a7', therapistId: 't1', sessionContent: 'Psicoeducación sobre TDAH en adultos. Estrategias de organización y manejo del tiempo.', observations: 'Muy motivado. Trae agenda nueva que compró para la tarea. Buen nivel de insight.', nextSessionPlan: 'Revisión del sistema de organización implementado. Añadir técnica Pomodoro.', createdAt: '2026-05-18T16:30' },
];

export const whatsAppConfig: WhatsAppConfig = {
  accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  authToken: '••••••••••••••••••••••••••••••••',
  fromNumber: '+56912345000',
  template24h: 'Hola {nombre} 👋 Te recordamos que mañana tienes sesión con {terapeuta} a las {hora}. Para confirmar responde *1*, para cancelar responde *2*.',
  templateDayOf: 'Hola {nombre}! Hoy tienes sesión con {terapeuta} a las {hora}. ¡Te esperamos! 🌟',
};
