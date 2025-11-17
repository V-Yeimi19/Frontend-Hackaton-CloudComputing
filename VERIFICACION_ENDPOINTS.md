# 🧪 Verificación de Endpoints del Administrador

Este documento explica cómo verificar el funcionamiento de los endpoints del panel administrativo de AlertaUTEC.

## 📋 Endpoints Implementados

### 1. Resumen de Incidentes
- **URL**: `https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/resumen`
- **Método**: `GET`
- **Autenticación**: Bearer Token (JWT)
- **Descripción**: Obtiene un resumen estadístico de todos los incidentes

#### Respuesta Esperada
```json
{
  "resumen": {
    "totalIncidentes": 45,
    "pendientes": 12,
    "atendiendo": 8,
    "finalizados": 25,
    "porArea": {
      "Limpieza": 10,
      "Seguridad": 15,
      "Tecnologías de la Información": 8
    },
    "porCategoria": {
      "Infraestructura": 20,
      "Tecnología": 12,
      "Limpieza y Mantenimiento": 13
    }
  }
}
```

#### Estructura de Datos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `totalIncidentes` | `number` | Total de incidentes registrados |
| `pendientes` | `number` | Incidentes con estado "Pendiente" |
| `atendiendo` | `number` | Incidentes con estado "Atendiendo" o "En Proceso" |
| `finalizados` | `number` | Incidentes con estado "Finalizado" |
| `porArea` | `Record<string, number>` | Distribución de incidentes por área (opcional) |
| `porCategoria` | `Record<string, number>` | Distribución de incidentes por categoría (opcional) |

---

### 2. Listar Incidentes Activos
- **URL**: `https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/activos`
- **Método**: `GET`
- **Autenticación**: Bearer Token (JWT)
- **Descripción**: Lista todos los incidentes con estado "Pendiente" o "Atendiendo"

#### Respuesta Esperada
```json
{
  "incidentes": [
    {
      "id": "INC-2025-001",
      "descripcion": "Fuga de agua en baño del 4to piso",
      "categoria": "Infraestructura",
      "nivelDeGravedad": "Alta",
      "ubicacion": "Edificio A, Baño 4to piso",
      "piso": "4",
      "estado": "Pendiente",
      "areaAsignada": "Mantenimiento e Infraestructura",
      "creadoPor": "estudiante@utec.edu.pe",
      "fechaCreacion": "2025-01-15T10:30:00Z",
      "fechaActualizacion": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### Estructura de Datos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | Identificador único del incidente |
| `descripcion` | `string` | Descripción detallada del incidente |
| `categoria` | `string` | Categoría del incidente |
| `nivelDeGravedad` | `string` | Nivel de gravedad: Baja, Media, Alta, Crítica |
| `ubicacion` | `string` | Ubicación física del incidente |
| `piso` | `string` | Piso o nivel (opcional) |
| `estado` | `string` | Estado actual: **Pendiente** o **Atendiendo** |
| `areaAsignada` | `string` | Área responsable de atender el incidente (opcional) |
| `creadoPor` | `string` | Email del usuario que creó el incidente |
| `fechaCreacion` | `string` | Fecha de creación (ISO 8601) |
| `fechaActualizacion` | `string` | Fecha de última actualización (ISO 8601, opcional) |

---

## 🎯 Cómo Verificar los Endpoints

### Opción 1: Usando el Verificador Visual (Recomendado)

1. **Inicia sesión como Administrador**
   - Usa una cuenta con rol "Administrador"
   - Asegúrate de que el área sea "administrativo"

2. **Accede al Verificador de Endpoints**
   - En el menú lateral, haz clic en **"🧪 Test Endpoints"**
   - Se abrirá el panel de verificación de endpoints

3. **Ejecuta las Pruebas**
   - **Opción A**: Haz clic en "Probar Todos los Endpoints" para ejecutar ambas pruebas
   - **Opción B**: Haz clic en los botones individuales de cada tarjeta para probar uno a la vez

4. **Revisa los Resultados**
   - ✅ **Verde**: El endpoint respondió correctamente
   - ❌ **Rojo**: Hubo un error
   - Expande "Ver JSON completo" para ver la respuesta completa del servidor

5. **Consulta los Logs**
   - Abre la consola del navegador (F12)
   - Revisa los logs detallados de cada request/response

### Opción 2: Usando el Panel de Estadísticas

1. **Inicia sesión como Administrador**

2. **Ve a Estadísticas**
   - Haz clic en **"📊 Estadística"** en el menú lateral

3. **Observa los Datos**
   - Si ves el badge verde **"✓ Datos sincronizados con el servidor"**, el endpoint de resumen está funcionando
   - Las métricas mostradas provienen directamente del backend

4. **Verifica en la Consola**
   - Abre la consola del navegador (F12)
   - Busca mensajes de éxito o error relacionados con `getIncidentsSummary`

### Opción 3: Usando cURL (Para Desarrolladores)

#### Resumen de Incidentes
```bash
curl -X GET \
  'https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/resumen' \
  -H 'Authorization: Bearer TU_TOKEN_JWT' \
  -H 'Content-Type: application/json'
```

#### Incidentes Activos
```bash
curl -X GET \
  'https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/activos' \
  -H 'Authorization: Bearer TU_TOKEN_JWT' \
  -H 'Content-Type: application/json'
```

**Nota**: Reemplaza `TU_TOKEN_JWT` con un token válido obtenido al iniciar sesión.

---

## 🔍 Solución de Problemas

### Error: "No hay sesión activa"
**Causa**: No estás autenticado o el token ha expirado.

**Solución**:
1. Cierra sesión
2. Vuelve a iniciar sesión
3. Intenta nuevamente

### Error: "Error de conexión con el servidor"
**Causa**: Problemas de red o el backend no está disponible.

**Solución**:
1. Verifica tu conexión a internet
2. Confirma que los endpoints estén desplegados en AWS
3. Revisa los logs de CloudWatch en AWS

### Error 403: Forbidden
**Causa**: El usuario no tiene permisos de administrador.

**Solución**:
1. Verifica que el rol del usuario sea "Administrador"
2. Confirma que el área sea "administrativo"
3. Revisa la configuración del backend

### Error 404: Not Found
**Causa**: La ruta del endpoint es incorrecta.

**Solución**:
1. Verifica que las URLs en `src/services/api.ts` sean correctas
2. Confirma que las Lambdas estén desplegadas en AWS
3. Revisa la configuración del API Gateway

### Los datos no se actualizan
**Causa**: El componente AdminAnalytics no se está remontando.

**Solución**:
1. Navega a otra vista y regresa
2. Refresca la página (F5)
3. Cierra y vuelve a abrir sesión

---

## 📊 Integración con AdminAnalytics

El componente `AdminAnalytics` integra automáticamente el endpoint de resumen:

```typescript
// Ubicación: src/components/AdminAnalytics.tsx

useEffect(() => {
  const fetchSummary = async () => {
    const result = await AdminService.getIncidentsSummary();
    if (result.success && result.data) {
      setBackendSummary(result.data);
    }
  };
  fetchSummary();
}, []);
```

### Fallback a Datos Locales

Si el backend no está disponible, el componente usa datos locales calculados del frontend:

```typescript
const totalIncidents = totalIncidentsFromBackend ?? incidents.length;
const resolvedIncidents = resolvedFromBackend ?? incidents.filter(i => i.status === 'Finalizado').length;
```

Esto garantiza que la UI siempre muestre datos, priorizando los del backend cuando estén disponibles.

---

## 🛠️ Archivos Relacionados

| Archivo | Descripción |
|---------|-------------|
| `src/services/api.ts` | Configuración de endpoints y AdminService |
| `src/components/AdminAnalytics.tsx` | Panel de estadísticas que usa getIncidentsSummary |
| `src/components/AdminEndpointTester.tsx` | Verificador visual de endpoints |
| `src/components/Dashboard.tsx` | Dashboard principal con integración |
| `src/test-admin-endpoints.ts` | Script de prueba programático (no visual) |

---

## ✅ Checklist de Verificación

Usa este checklist para verificar que todo funciona correctamente:

- [ ] Build del proyecto exitoso (`npm run build`)
- [ ] Inicio de sesión como Administrador funciona
- [ ] Navegación a "Test Endpoints" visible en el menú
- [ ] Endpoint de Resumen retorna datos correctos
- [ ] Endpoint de Incidentes Activos retorna datos correctos
- [ ] Panel de Estadísticas muestra badge de sincronización
- [ ] Datos del backend se reflejan en las métricas
- [ ] Logs en consola muestran requests exitosos
- [ ] Fallback a datos locales funciona si backend falla

---

## 📝 Notas Adicionales

1. **Autenticación**: Ambos endpoints requieren un token JWT válido en el header `Authorization: Bearer {token}`

2. **CORS**: Verifica que los endpoints de AWS API Gateway tengan configurado CORS correctamente

3. **Rate Limiting**: Ten en cuenta posibles límites de rate en AWS API Gateway

4. **Caché**: Los datos se obtienen cada vez que se monta el componente. No hay caché implementado actualmente.

5. **Errores**: Todos los errores se muestran como toasts y se loguean en la consola del navegador

---

## 🚀 Próximos Pasos

Si los endpoints funcionan correctamente, puedes:

1. Implementar refresh automático de datos
2. Agregar caché para reducir requests
3. Implementar WebSocket para updates en tiempo real
4. Agregar más endpoints según las necesidades del proyecto

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
