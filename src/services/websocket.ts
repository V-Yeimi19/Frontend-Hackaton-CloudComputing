import type { Incident } from '../types/incident';

// Configuración del servidor WebSocket (API Gateway WebSocket)
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || ' wss://1ptdg9yt1c.execute-api.us-east-1.amazonaws.com/production ';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private userId: string = '';

  // Conectar al servidor WebSocket
  connect(userId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket ya está conectado');
      return;
    }

    this.userId = userId;

    try {
      this.ws = new WebSocket(WEBSOCKET_URL);

      this.ws.onopen = () => {
        console.log('WebSocket conectado');
        this.reconnectAttempts = 0;

        // Enviar mensaje de identificación si es necesario
        this.send({
          action: 'identify',
          userId: this.userId,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket mensaje recibido:', data);

          // Procesar mensaje de DynamoDB Stream
          this.handleStreamMessage(data);
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket cerrado:', event.code, event.reason);
        this.ws = null;

        // Intentar reconectar
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('Error WebSocket:', error);
      };
    } catch (error) {
      console.error('Error al crear WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  // Programar reconexión
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Reconectando en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }

  // Enviar mensaje al servidor
  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  // Procesar mensajes del DynamoDB Stream
  private handleStreamMessage(data: any): void {
    const { eventName, newImage, oldImage } = data;

    if (!eventName) return;

    // INSERT - Nuevo incidente creado
    if (eventName === 'INSERT' && newImage) {
      this.emit('incident:created', this.mapDynamoDBToIncident(newImage));
    }

    // MODIFY - Incidente actualizado
    if (eventName === 'MODIFY' && newImage) {
      const incident = this.mapDynamoDBToIncident(newImage);
      this.emit('incident:updated', incident);

      // Si cambió el estado, emitir evento específico
      if (oldImage && oldImage.estado !== newImage.estado) {
        this.emit('incident:status-changed', {
          incidentId: newImage.id,
          status: newImage.estado,
          updatedAt: new Date(),
        });
      }

      // Si se resolvió, emitir evento específico
      if (newImage.estado === 'Finalizado') {
        this.emit('incident:resolved', incident);
      }
    }

    // REMOVE - Incidente eliminado
    if (eventName === 'REMOVE' && oldImage) {
      this.emit('incident:deleted', { id: oldImage.id });
    }
  }

  // Mapear item de DynamoDB a Incident del frontend
  private mapDynamoDBToIncident(item: any): Incident {
    // Mapear severidad del backend al frontend
    const severityMapping: Record<string, 'Baja' | 'Media' | 'Alta' | 'Crítica'> = {
      'bajo': 'Baja',
      'medio': 'Media',
      'alto': 'Alta',
      'critico': 'Crítica',
    };

    // Mapear prioridad desde severidad
    const priorityMapping: Record<string, number> = {
      'Baja': 1,
      'Media': 2,
      'Alta': 3,
      'Crítica': 4,
    };

    const severity = severityMapping[item.nivelDeGravedad] || 'Media';

    const mapEstado = (estado: string) => {
      if (!estado) return 'Pendiente';
      const normalized = String(estado).toLowerCase();
      if (normalized === 'en proceso' || normalized === 'en_proceso') return 'En atencion';
      if (normalized === 'finalizado') return 'Terminado';
      if (normalized === 'pendiente') return 'Pendiente';
      return 'Pendiente';
    };

    return {
      id: item.id,
      userId: item.createdByEmail || '',
      userName: item.createdByEmail?.split('@')[0] || 'Usuario',
      userEmail: item.createdByEmail || '',
      description: item.descripcion || '',
      category: item.categoria || '',
      severity,
      location: item.ubicacion || '',
      floor: item.piso || '',
      assignedArea: item.areaResponsable || 'Servicios Generales',
      status: mapEstado(item.estado) as any,
      createdAt: new Date(item.createdAt || Date.now()),
      updatedAt: new Date(item.updatedAt || item.createdAt || Date.now()),
      priority: priorityMapping[severity],
    } as Incident;
  }

  // Emitir evento a los listeners
  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error en listener de ${event}:`, error);
        }
      });
    }
  }

  // Desconectar del servidor WebSocket
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.listeners.clear();
  }

  // Agregar listener para un evento
  private addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  // Remover listener para un evento
  private removeEventListener(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  // Escuchar actualizaciones de incidentes
  onIncidentUpdate(callback: (incident: Incident) => void): void {
    this.addEventListener('incident:updated', callback);
  }

  // Escuchar nuevos incidentes
  onIncidentCreated(callback: (incident: Incident) => void): void {
    this.addEventListener('incident:created', callback);
  }

  // Escuchar incidentes resueltos
  onIncidentResolved(callback: (incident: Incident) => void): void {
    this.addEventListener('incident:resolved', callback);
  }

  // Escuchar cambios de estado de incidentes
  onIncidentStatusChanged(callback: (data: { incidentId: string; status: string; updatedAt: Date }) => void): void {
    this.addEventListener('incident:status-changed', callback);
  }

  // Escuchar incidentes eliminados
  onIncidentDeleted(callback: (data: { id: string }) => void): void {
    this.addEventListener('incident:deleted', callback);
  }

  // Unirse a una sala específica (API Gateway WebSocket puede no soportar salas)
  joinRoom(room: string): void {
    this.send({
      action: 'joinRoom',
      room,
    });
  }

  // Salir de una sala
  leaveRoom(room: string): void {
    this.send({
      action: 'leaveRoom',
      room,
    });
  }

  // Remover un listener específico
  off(event: string, callback?: any): void {
    this.removeEventListener(event, callback);
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Obtener el WebSocket actual
  getSocket(): WebSocket | null {
    return this.ws;
  }
}

// Exportar instancia única (singleton)
export const websocketService = new WebSocketService();
