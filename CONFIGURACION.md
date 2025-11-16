# Configuración del Frontend - AlertaUTEC

## Resumen de Funcionalidades Implementadas

### 1. Sistema de Autenticación
- **Login**: Página de inicio de sesión
- **Register**: Página de registro con campo condicional `área_trabajo` (solo visible para rol "Trabajador")

### 2. Roles de Usuario
El sistema soporta 3 roles:
- **Estudiante**: Puede ver dashboard y reportar/ver sus incidentes
- **Trabajador**: Tiene acceso adicional a "Mis Tareas" para gestionar incidentes asignados a su área
- **Administrador**: Tiene acceso adicional a "Estadística" para ver análisis completo del sistema

### 3. Páginas Principales

#### Dashboard (Todos los roles)
- Muestra todos los incidentes del sistema
- Estadísticas generales: Total, Pendientes, En Proceso, Resueltos
- Filtros por estado
- Actualizaciones en tiempo real vía WebSocket

#### Mis Reportes (Todos los roles)
- Historial de todos los incidentes reportados por el usuario
- Actualizaciones en tiempo real con indicador visual "En vivo"
- Estadísticas personales
- Filtros por estado

#### Mis Tareas (Solo Trabajadores)
- Lista de incidentes asignados al área de trabajo del usuario
- Capacidad de actualizar el estado de los incidentes
- Estadísticas de tareas pendientes, en proceso y completadas

#### Estadística (Solo Administradores)
- Análisis completo del sistema de incidentes
- Gráficos de distribución por área, severidad y estado
- Identificación de puntos críticos en el campus
- Recomendaciones automáticas basadas en datos

### 4. WebSocket para Actualizaciones en Tiempo Real

El sistema incluye integración completa con WebSocket para mantener los datos sincronizados en tiempo real:

**Eventos soportados:**
- `incident:updated` - Actualización de un incidente existente
- `incident:created` - Nuevo incidente creado
- `incident:status-changed` - Cambio de estado de un incidente
- `incident:resolved` - Incidente resuelto

**Características:**
- Reconexión automática en caso de pérdida de conexión
- Salas por área de trabajo para trabajadores
- Cleanup automático al cerrar sesión

## Configuración

### 1. Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL del servidor WebSocket (backend)
VITE_WEBSOCKET_URL=http://localhost:3000
```

**Importante:** Cambia `http://localhost:3000` por la URL de tu servidor backend en producción.

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

### 4. Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `build/`.

## Estructura del Proyecto

```
src/
├── components/
│   ├── AllIncidents.tsx       # Dashboard con todos los incidentes
│   ├── MyReports.tsx          # Mis reportes (con WebSocket)
│   ├── MyTasks.tsx            # Mis tareas (solo trabajadores)
│   ├── AdminAnalytics.tsx     # Estadísticas (solo administradores)
│   ├── Login.tsx              # Página de login
│   ├── Register.tsx           # Página de registro
│   ├── Dashboard.tsx          # Layout principal con navegación
│   └── ui/                    # Componentes de UI reutilizables
├── services/
│   └── websocket.ts           # Servicio de WebSocket
├── App.tsx                    # Componente raíz
└── main.tsx                   # Punto de entrada
```

## Integración con Backend

### Eventos WebSocket Esperados del Backend

El frontend espera que el backend emita los siguientes eventos:

1. **Actualización de incidente:**
```typescript
socket.emit('incident:updated', {
  id: string,
  userId: string,
  userName: string,
  description: string,
  severity: 'Baja' | 'Media' | 'Alta' | 'Crítica',
  status: 'Pendiente' | 'En Proceso' | 'Finalizado',
  // ... otros campos del incidente
});
```

2. **Nuevo incidente:**
```typescript
socket.emit('incident:created', {
  // ... mismo formato que incident:updated
});
```

3. **Cambio de estado:**
```typescript
socket.emit('incident:status-changed', {
  incidentId: string,
  status: 'Pendiente' | 'En Proceso' | 'Finalizado',
  updatedAt: Date
});
```

### Autenticación WebSocket

El cliente envía el `userId` al conectarse:

```typescript
{
  auth: {
    userId: string
  }
}
```

### Salas (Rooms)

Los trabajadores se unen automáticamente a una sala con el nombre de su área de trabajo:

```typescript
// El frontend emite:
socket.emit('join:room', 'Limpieza'); // Por ejemplo

// El backend debe unir el socket a esa sala
socket.join(areaName);
```

## Tipos de Datos

### Incident
```typescript
interface Incident {
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
  status: 'Pendiente' | 'En Proceso' | 'Finalizado';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  imageUrl?: string;
  priority: number;
}
```

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Estudiante' | 'Trabajador' | 'Administrador';
  workArea?: WorkArea;
  avatar?: string;
}
```

### WorkArea
```typescript
type WorkArea =
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
```

## Notas Importantes

1. **WebSocket**: El frontend intentará conectarse automáticamente al WebSocket cuando un usuario inicie sesión. Asegúrate de que el backend esté corriendo y configurado correctamente.

2. **Roles**: El registro actualmente es un mock. En producción, deberás implementar la validación del backend para asignar roles y áreas de trabajo.

3. **Autenticación**: El login actual es un mock que acepta cualquier credencial. Debes implementar autenticación real con el backend.

4. **Indicador "En vivo"**: Aparece en "Mis Reportes" cuando la conexión WebSocket está activa.

5. **Reconexión**: El servicio WebSocket intentará reconectar automáticamente hasta 5 veces si se pierde la conexión.

## Solución de Problemas

### El WebSocket no se conecta
- Verifica que la variable `VITE_WEBSOCKET_URL` en `.env` apunte al backend correcto
- Asegúrate de que el backend esté corriendo y aceptando conexiones WebSocket
- Revisa la consola del navegador para ver errores de conexión

### Los datos no se actualizan en tiempo real
- Verifica que el backend esté emitiendo los eventos correctos
- Asegúrate de que el usuario esté autenticado
- Revisa que las salas (rooms) estén configuradas correctamente en el backend

### Errores de TypeScript
- Ejecuta `npm install` para asegurarte de que todas las dependencias estén instaladas
- Verifica que `@types/react` y `@types/react-dom` estén en `devDependencies`

## Próximos Pasos

Para completar la integración:

1. Implementar el backend con Socket.IO
2. Crear endpoints REST para operaciones CRUD de incidentes
3. Implementar autenticación JWT
4. Configurar base de datos (MongoDB, PostgreSQL, etc.)
5. Implementar el microservicio analítico para estadísticas avanzadas
6. Agregar subida de imágenes para incidentes
7. Implementar notificaciones push
