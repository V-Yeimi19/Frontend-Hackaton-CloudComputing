export type IncidentStatus = 'Pendiente' | 'En atencion' | 'Terminado';

export type Severity = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export type UserRole = 'Estudiante' | 'Trabajador' | 'Administrador';

export type WorkArea =
  | 'Bienestar Estudiantil'
  | 'Counter Alumnos'
  | 'Limpieza'
  | 'Seguridad'
  | 'Servicios Financieros'
  | 'Defensoría Universitaria'
  | 'Mantenimiento e Infraestructura'
  | 'Tecnologías de la Información'
  | 'Servicios Generales'
  | 'Biblioteca'
  | 'Laboratorios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workArea?: WorkArea;
  avatar?: string;
}

export interface Incident {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  description: string;
  category: string;
  severity: Severity;
  location: string;
  floor?: string;
  assignedArea: WorkArea;
  status: IncidentStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  imageUrl?: string;
  priority: number;
}

// Helpers to map backend status values to UI values and viceversa
export const mapBackendStatusToUI = (backend: string): IncidentStatus => {
  if (!backend) return 'Pendiente';
  const normalized = backend.toLowerCase();
  if (normalized === 'en proceso' || normalized === 'en_proceso') return 'En atencion';
  if (normalized === 'finalizado') return 'Terminado';
  if (normalized === 'pendiente') return 'Pendiente';
  return 'Pendiente';
};

export const mapUIStatusToBackend = (ui: IncidentStatus): string => {
  const mapping: Record<IncidentStatus, string> = {
    'Pendiente': 'Pendiente',
    'En atencion': 'En Proceso',
    'Terminado': 'Finalizado',
  };
  return mapping[ui];
};
