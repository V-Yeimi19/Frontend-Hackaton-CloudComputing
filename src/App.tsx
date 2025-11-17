import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { websocketService } from './services/websocket';
import { AuthService, IncidentService } from './services/api';
import { toast } from 'sonner';
import type { Notification } from './components/NotificationsPanel';

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
  severity: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  location: string;
  floor?: string;
  assignedArea: WorkArea;
  status: 'Pendiente' | 'Atendiendo' | 'Finalizado';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  imageUrl?: string;
  priority: number; // Auto-calculated based on severity and time
}

// Mock data with more realistic incidents
const mockIncidents: Incident[] = [
  {
    id: '1',
    userId: '101',
    userName: 'María García Pérez',
    userEmail: 'maria.garcia@utec.edu.pe',
    description: 'El baño del piso 7 presenta falta de papel higiénico y los lavamanos están obstruidos',
    category: 'Limpieza',
    severity: 'Media',
    location: 'Edificio A - Piso 7',
    floor: '7',
    assignedArea: 'Limpieza',
    status: 'Pendiente',
    createdAt: new Date('2025-11-16T08:30:00'),
    updatedAt: new Date('2025-11-16T08:30:00'),
    priority: 2,
  },
  {
    id: '2',
    userId: '102',
    userName: 'Carlos Mendoza Silva',
    userEmail: 'carlos.mendoza@utec.edu.pe',
    description: 'Fuga de agua considerable en el laboratorio de química. El agua está llegando al pasillo',
    category: 'Servicios Generales',
    severity: 'Crítica',
    location: 'Edificio B - Piso 3, Lab. Química',
    floor: '3',
    assignedArea: 'Mantenimiento e Infraestructura',
    status: 'Atendiendo',
    createdAt: new Date('2025-11-16T07:15:00'),
    updatedAt: new Date('2025-11-16T07:45:00'),
    priority: 4,
  },
  {
    id: '3',
    userId: '103',
    userName: 'Ana Torres Ramos',
    userEmail: 'ana.torres@utec.edu.pe',
    description: 'La silla 15 del aula 401 tiene una pata rota y es peligrosa para sentarse',
    category: 'Servicios Generales',
    severity: 'Media',
    location: 'Edificio A - Piso 4, Aula 401',
    floor: '4',
    assignedArea: 'Servicios Generales',
    status: 'Pendiente',
    createdAt: new Date('2025-11-16T09:00:00'),
    updatedAt: new Date('2025-11-16T09:00:00'),
    priority: 2,
  },
  {
    id: '4',
    userId: '104',
    userName: 'Luis Fernández Ccama',
    userEmail: 'luis.fernandez@utec.edu.pe',
    description: 'El internet en la biblioteca está extremadamente lento y se desconecta constantemente',
    category: 'Tecnologías de la información',
    severity: 'Alta',
    location: 'Biblioteca - Piso 2',
    floor: '2',
    assignedArea: 'Tecnologías de la Información',
    status: 'Pendiente',
    createdAt: new Date('2025-11-16T10:20:00'),
    updatedAt: new Date('2025-11-16T10:20:00'),
    priority: 3,
  },
  {
    id: '5',
    userId: '101',
    userName: 'María García Pérez',
    userEmail: 'maria.garcia@utec.edu.pe',
    description: 'Encontré una laptop olvidada en el aula 305 después de clase',
    category: 'Seguridad',
    severity: 'Media',
    location: 'Edificio A - Piso 3, Aula 305',
    floor: '3',
    assignedArea: 'Seguridad',
    status: 'Finalizado',
    createdAt: new Date('2025-11-15T14:30:00'),
    updatedAt: new Date('2025-11-15T16:00:00'),
    resolvedAt: new Date('2025-11-15T16:00:00'),
    resolvedBy: 'Pedro Sánchez',
    priority: 2,
  },
  {
    id: '6',
    userId: '105',
    userName: 'Roberto Díaz Flores',
    userEmail: 'roberto.diaz@utec.edu.pe',
    description: 'El aire acondicionado del laboratorio de electrónica no funciona y hace mucho calor',
    category: 'Servicios Generales',
    severity: 'Alta',
    location: 'Edificio C - Piso 2, Lab. Electrónica',
    floor: '2',
    assignedArea: 'Mantenimiento e Infraestructura',
    status: 'Atendiendo',
    createdAt: new Date('2025-11-16T11:00:00'),
    updatedAt: new Date('2025-11-16T11:30:00'),
    priority: 3,
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Configurar WebSocket cuando el usuario inicia sesión
  useEffect(() => {
    if (currentUser) {
      // Conectar al WebSocket
      websocketService.connect(currentUser.id);

      // Escuchar actualizaciones globales de incidentes
      websocketService.onIncidentUpdate((updatedIncident) => {
        setIncidents(prev =>
          prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc)
        );
      });

      websocketService.onIncidentCreated((newIncident) => {
        setIncidents(prev => [newIncident, ...prev]);
      });

      websocketService.onIncidentStatusChanged((data) => {
        setIncidents(prev =>
          prev.map(inc => {
            if (inc.id === data.incidentId) {
              // Si el incidente pertenece al usuario actual, crear notificación
              if (currentUser && inc.userId === currentUser.id) {
                const notification: Notification = {
                  id: `notif-${Date.now()}-${Math.random()}`,
                  userId: currentUser.id,
                  type: 'status_changed',
                  title: 'Estado del reporte actualizado',
                  message: `Tu reporte ha cambiado de estado`,
                  incidentId: inc.id,
                  incidentCategory: inc.category,
                  oldStatus: inc.status,
                  newStatus: data.status,
                  createdAt: new Date(),
                  read: false,
                };
                setNotifications(prev => [notification, ...prev]);
              }

              return {
                ...inc,
                status: data.status as 'Pendiente' | 'Atendiendo' | 'Finalizado',
                updatedAt: new Date(data.updatedAt),
              };
            }
            return inc;
          })
        );
      });

      // Si el usuario es trabajador, unirse a la sala de su área
      if (currentUser.role === 'Trabajador' && currentUser.workArea) {
        websocketService.joinRoom(currentUser.workArea);
      }

      // Cleanup al cerrar sesión
      return () => {
        if (currentUser.role === 'Trabajador' && currentUser.workArea) {
          websocketService.leaveRoom(currentUser.workArea);
        }
        websocketService.disconnect();
      };
    }
  }, [currentUser]);

  const loadIncidentsFromBackend = async () => {
    try {
      const result = await IncidentService.getAllIncidents();

      if (result.success && result.data) {
        // Convertir los incidentes del backend al formato del frontend
        const backendIncidents = result.data.map((inc: any) => ({
          id: inc.id || inc.incidenteId,
          userId: inc.creadoPor || inc.userId || 'unknown',
          userName: inc.nombreUsuario || inc.userName || 'Usuario',
          userEmail: inc.creadoPor || inc.userEmail || 'unknown@utec.edu.pe',
          description: inc.descripcion || inc.description,
          category: inc.categoria || inc.category,
          severity: (inc.nivelDeGravedad || inc.severity || 'Media') as 'Baja' | 'Media' | 'Alta' | 'Crítica',
          location: inc.ubicacion || inc.location,
          floor: inc.piso || inc.floor,
          assignedArea: (inc.areaAsignada || inc.assignedArea) as WorkArea,
          status: (inc.estado === 'En Proceso' ? 'Atendiendo' : inc.estado || inc.status || 'Pendiente') as 'Pendiente' | 'Atendiendo' | 'Finalizado',
          createdAt: new Date(inc.fechaCreacion || inc.createdAt || Date.now()),
          updatedAt: new Date(inc.fechaActualizacion || inc.updatedAt || Date.now()),
          resolvedAt: inc.fechaResolucion || inc.resolvedAt ? new Date(inc.fechaResolucion || inc.resolvedAt) : undefined,
          resolvedBy: inc.resuelto_por || inc.resolvedBy,
          priority: inc.prioridad || inc.priority || 2,
        }));

        setIncidents(backendIncidents);
        console.log('✅ Incidentes cargados desde el backend:', backendIncidents.length);
      } else {
        console.warn('⚠️ No se pudieron cargar incidentes desde el backend:', result.error);
        // Mantener los incidentes actuales (de localStorage o mock)
      }
    } catch (error) {
      console.error('❌ Error al cargar incidentes desde el backend:', error);
      // Mantener los incidentes actuales (de localStorage o mock)
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await AuthService.login(email, password);

      if (result.success && result.data) {
        setCurrentUser(result.data.user);
        setCurrentView('dashboard');
        toast.success('¡Bienvenido! Sesión iniciada correctamente.');

        // Cargar incidentes desde el backend después de iniciar sesión
        await loadIncidentsFromBackend();
      } else {
        toast.error(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error de conexión. Por favor intenta de nuevo.');
    }
  };

  const handleRegister = async (name: string, email: string, password: string, role: UserRole, workArea?: WorkArea) => {
    try {
      const result = await AuthService.register(
        email,
        password,
        role,
        workArea || '',
        name
      );

      if (result.success && result.data) {
        setCurrentUser(result.data.user);
        setCurrentView('dashboard');
        toast.success('¡Cuenta creada exitosamente!');

        // Cargar incidentes desde el backend después de registrarse
        await loadIncidentsFromBackend();
      } else {
        toast.error(result.error || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error en register:', error);
      toast.error('Error de conexión. Por favor intenta de nuevo.');
    }
  };

  const handleReportIncident = async (incident: Omit<Incident, 'id' | 'userId' | 'userName' | 'userEmail' | 'status' | 'createdAt' | 'updatedAt' | 'priority'>) => {
    if (!currentUser) return;

    try {
      const result = await IncidentService.createIncident({
        description: incident.description,
        category: incident.category,
        severity: incident.severity,
        location: incident.location,
        floor: incident.floor,
        assignedArea: incident.assignedArea,
      });

      if (result.success && result.data) {
        // Calculate priority based on severity
        const priorityMap = { 'Baja': 1, 'Media': 2, 'Alta': 3, 'Crítica': 4 };

        const newIncident: Incident = {
          ...incident,
          id: result.data.id || Date.now().toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          status: 'Pendiente',
          createdAt: new Date(),
          updatedAt: new Date(),
          priority: priorityMap[incident.severity],
        };

        setIncidents([newIncident, ...incidents]);

        // Crear notificación de reporte creado
        const notification: Notification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          userId: currentUser.id,
          type: 'report_created',
          title: 'Reporte creado exitosamente',
          message: `Tu reporte de ${incident.category} ha sido registrado`,
          incidentId: newIncident.id,
          incidentCategory: incident.category,
          createdAt: new Date(),
          read: false,
        };
        setNotifications([notification, ...notifications]);

        toast.success('Incidente reportado exitosamente');
      } else {
        toast.error(result.error || 'Error al reportar incidente');
      }
    } catch (error) {
      console.error('Error al reportar incidente:', error);
      toast.error('Error de conexión. Por favor intenta de nuevo.');
    }
  };

  const handleUpdateStatus = async (incidentId: string, newStatus: 'Pendiente' | 'Atendiendo' | 'Finalizado') => {
    try {
      const result = await IncidentService.updateIncidentStatus(incidentId, newStatus);

      if (result.success) {
        setIncidents(incidents.map(inc => {
          if (inc.id === incidentId) {
            const oldStatus = inc.status;
            const updated: Incident = {
              ...inc,
              status: newStatus,
              updatedAt: new Date(),
            };

            if (newStatus === 'Finalizado' && currentUser) {
              updated.resolvedAt = new Date();
              updated.resolvedBy = currentUser.name;
            }

            // Crear notificación si el usuario actual NO es el dueño del reporte
            // (esto significa que otro usuario está actualizando el estado de su reporte)
            if (currentUser && inc.userId !== currentUser.id) {
              const notification: Notification = {
                id: `notif-${Date.now()}-${Math.random()}`,
                userId: inc.userId,
                type: 'status_changed',
                title: 'Estado del reporte actualizado',
                message: `Tu reporte de ${inc.category} ha cambiado de estado`,
                incidentId: inc.id,
                incidentCategory: inc.category,
                oldStatus: oldStatus,
                newStatus: newStatus,
                createdAt: new Date(),
                read: false,
              };
              setNotifications(prev => [notification, ...prev]);
            }

            return updated;
          }
          return inc;
        }));
        toast.success('Estado del incidente actualizado correctamente');
      } else {
        toast.error(result.error || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error de conexión. Por favor intenta de nuevo.');
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    // Solo permitir a administradores eliminar incidentes
    if (!currentUser || currentUser.role !== 'Administrador') {
      toast.error('Solo los administradores pueden eliminar incidentes');
      return;
    }

    try {
      const result = await IncidentService.deleteIncident(incidentId);

      if (result.success) {
        setIncidents(incidents.filter(inc => inc.id !== incidentId));

        // Eliminar notificaciones relacionadas con el incidente
        setNotifications(notifications.filter(notif => notif.incidentId !== incidentId));

        toast.success('Incidente eliminado correctamente');
      } else {
        toast.error(result.error || 'Error al eliminar el incidente');
      }
    } catch (error) {
      console.error('Error al eliminar incidente:', error);
      toast.error('Error de conexión. Por favor intenta de nuevo.');
    }
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(notifications.map(notif =>
      notif.userId === currentUser.id ? { ...notif, read: true } : notif
    ));
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setCurrentView('login');
    toast.info('Sesión cerrada correctamente');
  };

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'dashboard' && currentUser) {
    return (
      <Dashboard
        user={currentUser}
        incidents={incidents}
        notifications={notifications}
        onReportIncident={handleReportIncident}
        onUpdateStatus={handleUpdateStatus}
        onDeleteIncident={handleDeleteIncident}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
