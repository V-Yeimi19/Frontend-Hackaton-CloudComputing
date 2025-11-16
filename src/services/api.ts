// Servicio de API REST para integración con el backend

const API_BASE_URL_SEGURIDAD = 'https://t0j3621dni.execute-api.us-east-1.amazonaws.com';
const API_BASE_URL_INCIDENTES = 'https://xzvr9v0w86.execute-api.us-east-1.amazonaws.com';
const API_BASE_URL_VALIDAR_TOKEN = 'https://3lp5hoedy7.execute-api.us-east-1.amazonaws.com';
const API_BASE_URL_ESTADO_INCIDENTE = 'https://qtnopzqirh.execute-api.us-east-1.amazonaws.com';

// Mapeo de roles: Frontend -> Backend
const ROLE_MAPPING: Record<string, string> = {
  'Estudiante': 'usuario',
  'Trabajador': 'usuario',
  'Administrador': 'administrativo',
};

// Mapeo inverso: Backend -> Frontend
const ROLE_MAPPING_INVERSE: Record<string, string> = {
  'usuario': 'Estudiante', // Por defecto, pero se ajusta según contexto
  'administrativo': 'Administrador',
};

// Tipos de respuesta del backend
interface BackendUser {
  email: string;
  rol: string;
  area: string;
  createdAt?: string;
}

interface RegisterResponse {
  message: string;
  token: string;
  user: BackendUser;
}

interface LoginResponse {
  message: string;
  token: string;
  user: BackendUser;
}

interface IncidentResponse {
  message: string;
  incidente: any;
}

interface ErrorResponse {
  message: string;
  detail?: string;
}

// Storage para el token
class TokenStorage {
  private static readonly TOKEN_KEY = 'alerta_utec_token';
  private static readonly USER_KEY = 'alerta_utec_user';

  static saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static saveUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
}

// Servicio de Autenticación
export class AuthService {
  /**
   * Registrar un nuevo usuario
   */
  static async register(
    email: string,
    password: string,
    role: string,
    area: string,
    name?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Mapear rol del frontend al backend
      const backendRole = ROLE_MAPPING[role] || 'usuario';

      // Normalizar el área para el backend
      let backendArea = area;
      if (area === 'estudiantil') {
        backendArea = 'estudiantil';
      } else if (area === 'administrativo') {
        backendArea = 'administrativo';
      }

      const response = await fetch(`${API_BASE_URL_SEGURIDAD}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rol: backendRole,
          area: backendArea,
        }),
      });

      const data: RegisterResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: (data as ErrorResponse).message || 'Error al registrar usuario',
        };
      }

      const registerData = data as RegisterResponse;

      // Guardar token
      TokenStorage.saveToken(registerData.token);

      // Determinar el rol correcto del frontend
      let frontendRole = ROLE_MAPPING_INVERSE[registerData.user.rol];

      // Si el rol del backend es 'usuario', determinar si es Estudiante o Trabajador
      if (registerData.user.rol === 'usuario') {
        // Si el rol original era Trabajador, mantenerlo
        frontendRole = role === 'Trabajador' ? 'Trabajador' : 'Estudiante';
      }

      // Crear objeto de usuario compatible con el frontend
      const user = {
        id: registerData.user.email, // Usar email como ID
        name: name || registerData.user.email.split('@')[0],
        email: registerData.user.email,
        role: frontendRole,
        workArea: registerData.user.area,
      };

      // Guardar usuario
      TokenStorage.saveUser(user);

      return {
        success: true,
        data: {
          token: registerData.token,
          user,
        },
      };
    } catch (error) {
      console.error('Error en register:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL_SEGURIDAD}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: LoginResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: (data as ErrorResponse).message || 'Credenciales inválidas',
        };
      }

      const loginData = data as LoginResponse;

      // Guardar token
      TokenStorage.saveToken(loginData.token);

      // Determinar el rol correcto del frontend
      let frontendRole = ROLE_MAPPING_INVERSE[loginData.user.rol] || 'Estudiante';

      // Crear objeto de usuario compatible con el frontend
      const user = {
        id: loginData.user.email,
        name: loginData.user.email.split('@')[0],
        email: loginData.user.email,
        role: frontendRole,
        workArea: loginData.user.area,
      };

      // Guardar usuario
      TokenStorage.saveUser(user);

      return {
        success: true,
        data: {
          token: loginData.token,
          user,
        },
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }

  /**
   * Cerrar sesión
   */
  static logout(): void {
    TokenStorage.removeToken();
  }

  /**
   * Obtener token actual
   */
  static getToken(): string | null {
    return TokenStorage.getToken();
  }

  /**
   * Obtener usuario actual
   */
  static getCurrentUser(): any | null {
    return TokenStorage.getUser();
  }

  /**
   * Verificar si hay sesión activa
   */
  static isAuthenticated(): boolean {
    return !!TokenStorage.getToken();
  }
}

// Servicio de Incidentes
export class IncidentService {
  /**
   * Crear un nuevo incidente
   */
  static async createIncident(incident: {
    description: string;
    category: string;
    severity: string;
    location: string;
    floor?: string;
    assignedArea: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = TokenStorage.getToken();

      if (!token) {
        return {
          success: false,
          error: 'No hay sesión activa',
        };
      }

      // Mapear severidad del frontend al backend
      const severityMapping: Record<string, string> = {
        'Baja': 'bajo',
        'Media': 'medio',
        'Alta': 'alto',
        'Crítica': 'critico',
      };

      const response = await fetch(`${API_BASE_URL_INCIDENTES}/incidentes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: 'Pendiente',
          nivelDeGravedad: severityMapping[incident.severity] || 'medio',
          descripcion: incident.description,
          ubicacion: incident.location,
          piso: incident.floor || '',
          categoria: incident.category,
        }),
      });

      const data: IncidentResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: (data as ErrorResponse).message || 'Error al crear incidente',
        };
      }

      return {
        success: true,
        data: (data as IncidentResponse).incidente,
      };
    } catch (error) {
      console.error('Error en createIncident:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }

  /**
   * Eliminar un incidente
   */
  static async deleteIncident(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = TokenStorage.getToken();

      if (!token) {
        return {
          success: false,
          error: 'No hay sesión activa',
        };
      }

      const response = await fetch(`${API_BASE_URL_INCIDENTES}/incidentes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data: ErrorResponse = await response.json();
        return {
          success: false,
          error: data.message || 'Error al eliminar incidente',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error en deleteIncident:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }

  /**
   * Actualizar estado de un incidente
   * PATCH /incidentes/{id}/estado
   */
  static async updateIncidentStatus(
    id: string,
    newStatus: 'Pendiente' | 'En Proceso' | 'Finalizado'
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = TokenStorage.getToken();

      if (!token) {
        return {
          success: false,
          error: 'No hay sesión activa',
        };
      }

      const response = await fetch(`${API_BASE_URL_ESTADO_INCIDENTE}/incidentes/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: newStatus,
        }),
      });

      const data: IncidentResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: (data as ErrorResponse).message || 'Error al actualizar estado del incidente',
        };
      }

      return {
        success: true,
        data: (data as IncidentResponse).incidente,
      };
    } catch (error) {
      console.error('Error en updateIncidentStatus:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }

  /**
   * Validar token de autenticación
   * POST /validar-token
   */
  static async validateToken(token: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL_VALIDAR_TOKEN}/validar-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Token inválido',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error en validateToken:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
      };
    }
  }
}

export { TokenStorage };
