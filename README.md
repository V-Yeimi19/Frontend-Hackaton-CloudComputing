# AlertaUTEC - Sistema de Gestión de Incidentes

![UTEC Logo](public/assets/UTEC_logo.png)

Sistema web para la gestión de incidentes en el campus de UTEC. Permite a estudiantes reportar problemas y al personal administrativo gestionar y resolver incidentes de manera eficiente con actualizaciones en tiempo real.

## 📋 Tabla de Contenidos

- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Roles de Usuario](#roles-de-usuario)
- [Funcionalidades](#funcionalidades)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Integración con Backend](#integración-con-backend)
- [Sistema de Notificaciones](#sistema-de-notificaciones)
- [Tipos de Datos](#tipos-de-datos)
- [Solución de Problemas](#solución-de-problemas)
- [Licencias y Atribuciones](#licencias-y-atribuciones)

## 🚀 Características Principales

- ✅ **Sistema de autenticación** con 3 roles diferenciados
- ✅ **Creación y gestión de reportes** con categorización automática
- ✅ **Actualizaciones en tiempo real** vía WebSocket
- ✅ **Sistema de notificaciones** integrado
- ✅ **Dashboard analítico** para administradores con gráficos interactivos
- ✅ **Validación de correo institucional** (@utec.edu.pe)
- ✅ **Responsive design** adaptable a móviles y tablets
- ✅ **Gestión de estados** (Pendiente → Atendiendo → Finalizado)

## 🛠 Tecnologías Utilizadas

- **React 18** con TypeScript
- **Vite** como build tool
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes de UI
- **Socket.IO Client** para WebSocket
- **Recharts** para gráficos y estadísticas
- **Lucide React** para iconos
- **Sonner** para notificaciones toast

## 👥 Roles de Usuario

### 1. Estudiante
- Reportar incidentes en el campus
- Ver todos los incidentes del sistema
- Seguimiento de sus reportes personales
- Recibir notificaciones de cambios de estado

### 2. Trabajador
- Todas las funciones de Estudiante
- Ver incidentes asignados a su área de trabajo
- Actualizar el estado de incidentes
- Gestionar tareas pendientes

### 3. Administrador
- Todas las funciones de Estudiante y Trabajador
- Acceso al panel de estadísticas completo
- Visualización de análisis por área, severidad y estado
- Identificación de puntos críticos en el campus

## 📱 Funcionalidades

### Dashboard (Todos los roles)
- Visualización de todos los incidentes del sistema
- Estadísticas generales: Total, Pendientes, Atendiendo, Resueltos
- Filtros por estado (Todos, Pendientes, Atendiendo, Resueltos)
- Actualizaciones en tiempo real vía WebSocket
- Indicadores visuales de severidad (Baja, Media, Alta, Crítica)

### Crear Reporte (Todos los roles)
- Formulario intuitivo con validación
- Campos: Descripción, Ubicación, Piso, Categoría, Nivel de Gravedad
- Asignación automática de área responsable según categoría
- Información de contacto para emergencias
- Notificación inmediata al crear el reporte

### Mis Reportes (Todos los roles)
- Historial completo de incidentes reportados
- Indicador "En vivo" cuando WebSocket está activo
- Estadísticas personales (Total, Pendientes, Atendiendo, Resueltos)
- Filtros por estado
- Timeline de estados de cada incidente

### Mis Tareas (Solo Trabajadores)
- Lista de incidentes asignados a su área
- Selector de estado para actualización rápida
- Botones de acción (Comenzar Atención, Marcar como Finalizado)
- Ordenamiento por prioridad o fecha
- Estadísticas de área (Pendientes, En Atención, Completadas)

### Estadísticas (Solo Administradores)
- Panel analítico completo con gráficos interactivos
- Distribución de incidentes por área
- Análisis por severidad y estado
- Top 10 ubicaciones con más incidentes
- Recomendaciones automáticas basadas en datos
- Métricas de rendimiento del sistema

### Sistema de Notificaciones
- Panel lateral deslizable
- Notificaciones de creación de reportes
- Alertas de cambio de estado
- Contador de notificaciones no leídas
- Indicadores visuales y animaciones
- Histórico completo de actividad

## 📦 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/Frontend-Hackaton-CloudComputing.git
cd Frontend-Hackaton-CloudComputing
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
# URL del servidor WebSocket (backend)
VITE_WEBSOCKET_URL=http://localhost:3000

# API Base URL
VITE_API_URL=http://localhost:3000/api
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

5. **Build para producción**
```bash
npm run build
```

Los archivos compilados estarán en la carpeta `build/`

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_WEBSOCKET_URL` | URL del servidor WebSocket | `http://localhost:3000` |
| `VITE_API_URL` | URL base de la API REST | `http://localhost:3000/api` |

### Categorías de Incidentes

Las categorías disponibles y su mapeo automático a áreas responsables:

- **Limpieza** → Limpieza
- **Bienestar Estudiantil** → Bienestar Estudiantil
- **Seguridad** → Seguridad
- **Tecnologías de la información** → Tecnologías de la Información
- **Servicios Generales** → Servicios Generales
- **Biblioteca** → Biblioteca
- **Laboratorios** → Laboratorios

### Estados de Incidentes

1. **Pendiente**: Incidente reportado, esperando asignación
2. **Atendiendo**: Personal está trabajando en la resolución
3. **Finalizado**: Incidente resuelto y cerrado

## 📂 Estructura del Proyecto

```
Frontend-Hackaton-CloudComputing/
├── public/
│   └── assets/
│       └── UTEC_logo.png
├── src/
│   ├── components/
│   │   ├── AllIncidents.tsx          # Dashboard principal
│   │   ├── MyReports.tsx             # Reportes del usuario
│   │   ├── MyTasks.tsx               # Tareas del trabajador
│   │   ├── AreaIncidents.tsx         # Incidentes por área
│   │   ├── AdminAnalytics.tsx        # Panel de estadísticas
│   │   ├── ReportIncident.tsx        # Formulario de reporte
│   │   ├── NotificationsPanel.tsx    # Panel de notificaciones
│   │   ├── Login.tsx                 # Página de login
│   │   ├── Register.tsx              # Página de registro
│   │   ├── Dashboard.tsx             # Layout principal
│   │   └── ui/                       # Componentes reutilizables
│   ├── services/
│   │   ├── api.ts                    # Servicios de API REST
│   │   └── websocket.ts              # Servicio de WebSocket
│   ├── App.tsx                       # Componente raíz
│   ├── main.tsx                      # Punto de entrada
│   └── index.css                     # Estilos globales
├── .env                              # Variables de entorno
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔌 Integración con Backend

### API REST Endpoints Esperados

#### Autenticación
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { success: boolean, data: { user: User, token: string } }

POST /api/auth/register
Body: { email: string, password: string, role: string, area: string, name: string }
Response: { success: boolean, data: { user: User, token: string } }
```

#### Incidentes
```typescript
GET /api/incidents
Response: { success: boolean, data: Incident[] }

POST /api/incidents
Body: { description, category, severity, location, floor, assignedArea }
Response: { success: boolean, data: { id: string } }

PATCH /api/incidents/:id/status
Body: { status: string }
Response: { success: boolean }
```

### WebSocket - Eventos Soportados

#### Eventos que el frontend escucha:

**1. Actualización de incidente**
```typescript
socket.on('incident:updated', (incident: Incident) => {
  // Actualizar incidente en el estado
});
```

**2. Nuevo incidente creado**
```typescript
socket.on('incident:created', (incident: Incident) => {
  // Agregar nuevo incidente al estado
});
```

**3. Cambio de estado**
```typescript
socket.on('incident:status-changed', (data: {
  incidentId: string,
  status: string,
  updatedAt: Date
}) => {
  // Actualizar estado del incidente
});
```

#### Eventos que el frontend emite:

**1. Unirse a sala de área**
```typescript
socket.emit('join:room', areaName: string);
```

**2. Salir de sala de área**
```typescript
socket.emit('leave:room', areaName: string);
```

### Autenticación WebSocket

El cliente envía el `userId` al conectarse:
```typescript
const socket = io(WEBSOCKET_URL, {
  auth: {
    userId: string
  }
});
```

## 🔔 Sistema de Notificaciones

### Tipos de Notificaciones

#### 1. Reporte Creado
- **Trigger**: Usuario crea un nuevo reporte
- **Destinatario**: Usuario que creó el reporte
- **Contenido**: Confirmación de creación con categoría

#### 2. Cambio de Estado
- **Trigger**: Cambio de estado de un incidente
- **Destinatario**: Usuario dueño del reporte
- **Contenido**: Transición de estados (ej: Pendiente → Atendiendo)

### Interfaz de Notificación

```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'report_created' | 'status_changed';
  title: string;
  message: string;
  incidentId?: string;
  incidentCategory?: string;
  oldStatus?: string;
  newStatus?: string;
  createdAt: Date;
  read: boolean;
}
```

## 📊 Tipos de Datos

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
  status: 'Pendiente' | 'Atendiendo' | 'Finalizado';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  imageUrl?: string;
  priority: number; // 1-4, calculado automáticamente
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

## 🔧 Solución de Problemas

### El WebSocket no se conecta

**Síntomas**: No hay actualizaciones en tiempo real, indicador "En vivo" no aparece

**Soluciones**:
1. Verifica que `VITE_WEBSOCKET_URL` en `.env` apunte al backend correcto
2. Asegúrate de que el backend esté corriendo
3. Revisa la consola del navegador para errores de conexión
4. Verifica que el backend acepte conexiones WebSocket en el puerto configurado

### Los datos no se actualizan en tiempo real

**Síntomas**: Cambios no se reflejan automáticamente

**Soluciones**:
1. Verifica que el backend esté emitiendo los eventos correctos
2. Asegúrate de que el usuario esté autenticado
3. Revisa que las salas (rooms) estén configuradas en el backend
4. Comprueba que el evento emitido coincida con el esperado

### Error "Cannot find module"

**Soluciones**:
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Si persiste, limpiar caché de npm
npm cache clean --force
npm install
```

### Errores de validación de correo

**Síntomas**: No acepta correos @utec.edu.pe

**Soluciones**:
1. Verifica que el correo termine exactamente con `@utec.edu.pe`
2. El sistema no distingue mayúsculas/minúsculas
3. No debe haber espacios antes o después del correo

### Build falla en producción

**Soluciones**:
```bash
# Verificar errores de TypeScript
npm run type-check

# Build con logs detallados
npm run build -- --debug
```

## 📞 Contactos de Emergencia

Los siguientes contactos están disponibles en el formulario de reporte:

- 🚨 **Emergencias**: (511) 230-5025
- 📞 **Seguridad**: (511) 230-5000
- 📧 **Email**: bienestarestudiantil@utec.edu.pe

## 🎯 Próximos Pasos

Para completar el proyecto:

1. ✅ Implementar backend con Socket.IO
2. ✅ Crear endpoints REST para CRUD de incidentes
3. ✅ Implementar autenticación JWT
4. ⏳ Configurar base de datos (MongoDB/PostgreSQL)
5. ⏳ Implementar microservicio analítico
6. ⏳ Agregar subida de imágenes
7. ⏳ Implementar notificaciones push
8. ⏳ Agregar testing (Jest + React Testing Library)
9. ⏳ Configurar CI/CD

## 📄 Licencias y Atribuciones

### Componentes de UI
Este proyecto utiliza componentes de [shadcn/ui](https://ui.shadcn.com/) bajo [Licencia MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

### Imágenes
Las imágenes utilizadas provienen de [Unsplash](https://unsplash.com) bajo su [licencia](https://unsplash.com/license).

### Logo UTEC
El logo de UTEC es propiedad de la Universidad de Ingeniería y Tecnología.

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado como parte del curso de Cloud Computing - Ciclo 2025-2, UTEC.

### Contribuidores
- Frontend Development Team
- Backend Integration Team
- UI/UX Design Team

---

**AlertaUTEC** - Sistema de Gestión de Incidentes
Desarrollado con ❤️ para la comunidad UTEC
