import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { websocketService } from './services/websocket';
import { AuthService, IncidentService } from './services/api';
import { toast } from 'sonner';
import type { Incident, User, UserRole, WorkArea, IncidentStatus } from './types/incident';
import mockIncidents from './data/mockIncidents';

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

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
        // The websocket service now emits UI-friendly status strings, but ensure typing here
        setIncidents(prev =>
          prev.map(inc => {
            if (inc.id === data.incidentId) {
              return {
                ...inc,
                status: data.status as IncidentStatus,
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

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await AuthService.login(email, password);

      if (result.success && result.data) {
        setCurrentUser(result.data.user);
        setCurrentView('dashboard');
        toast.success('¡Bienvenido! Sesión iniciada correctamente.');
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
        toast.success('Incidente reportado exitosamente');
      } else {
        toast.error(result.error || 'Error al reportar incidente');
      }
    } catch (error) {
      console.error('Error al reportar incidente:', error);
      toast.error('Error de conexión. Por favor intenta de nuevo.');
    }
  };

  const handleUpdateStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    try {
      const result = await IncidentService.updateIncidentStatus(incidentId, newStatus);

      if (result.success) {
        setIncidents(incidents.map(inc => {
          if (inc.id === incidentId) {
            const updated: Incident = {
              ...inc,
              status: newStatus,
              updatedAt: new Date(),
            };

            if (newStatus === 'Terminado' && currentUser) {
              updated.resolvedAt = new Date();
              updated.resolvedBy = currentUser.name;
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
        onReportIncident={handleReportIncident}
        onUpdateStatus={handleUpdateStatus}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}
