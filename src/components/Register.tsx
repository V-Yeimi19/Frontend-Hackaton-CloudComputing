import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { UserRole, WorkArea } from '../App';

interface RegisterProps {
  onRegister: (name: string, email: string, password: string, role: UserRole, workArea?: WorkArea) => void;
  onSwitchToLogin: () => void;
}

export default function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Estudiante');
  const [workArea, setWorkArea] = useState<WorkArea>('Limpieza');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@utec.edu.pe')) {
      setEmailError('El correo debe ser del dominio @utec.edu.pe');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail && !newEmail.toLowerCase().endsWith('@utec.edu.pe')) {
      setEmailError('El correo debe ser del dominio @utec.edu.pe');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar el dominio del correo
    if (!validateEmail(email)) {
      return;
    }

    // Determinar el área según el rol
    let area: WorkArea | undefined;
    if (role === 'Estudiante') {
      area = 'estudiantil' as WorkArea; // Para estudiantes se envía "estudiantil"
    } else if (role === 'Administrador') {
      area = 'administrativo' as WorkArea; // Para administradores se envía "administrativo"
    } else if (role === 'Trabajador') {
      area = workArea;
    }

    onRegister(name, email, password, role, area);
  };

  const workAreas: WorkArea[] = [
    'Bienestar Estudiantil',
    'Counter Alumnos',
    'Limpieza',
    'Seguridad',
    'Servicios Financieros',
    'Defensoría Universitaria',
    'Mantenimiento e Infraestructura',
    'Tecnologías de la Información',
    'Servicios Generales',
    'Biblioteca',
    'Laboratorios',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mx-auto mb-4">
              <img
                src="/assets/UTEC_logo.png"
                alt="UTEC Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
            <h1 className="text-blue-900 mb-2">Crear Cuenta</h1>
            <p className="text-gray-600">Únete a la comunidad AlertaUTEC</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez Rojas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@utec.edu.pe"
                value={email}
                onChange={handleEmailChange}
                pattern=".*@utec\.edu\.pe$"
                title="El correo debe ser del dominio @utec.edu.pe"
                required
                className={emailError ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {emailError && (
                <p className="text-red-600 text-sm flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{emailError}</span>
                </p>
              )}
              <p className="text-gray-500 text-sm">Usa tu correo institucional de UTEC</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Tipo de Usuario</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="Estudiante" id="estudiante" />
                  <Label htmlFor="estudiante" className="flex-1 cursor-pointer">
                    <div>
                      <div className="text-gray-900">Estudiante</div>
                      <div className="text-gray-500">Reporta incidentes en el campus</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="Trabajador" id="trabajador" />
                  <Label htmlFor="trabajador" className="flex-1 cursor-pointer">
                    <div>
                      <div className="text-gray-900">Trabajador</div>
                      <div className="text-gray-500">Personal que atiende incidentes</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="Administrador" id="administrador" />
                  <Label htmlFor="administrador" className="flex-1 cursor-pointer">
                    <div>
                      <div className="text-gray-900">Administrador</div>
                      <div className="text-gray-500">Acceso a panel de análisis</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {role === 'Trabajador' && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Label htmlFor="workArea">Área de Trabajo</Label>
                <Select value={workArea} onValueChange={(value) => setWorkArea(value as WorkArea)}>
                  <SelectTrigger id="workArea">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Crear Cuenta
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-gray-500">o</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
