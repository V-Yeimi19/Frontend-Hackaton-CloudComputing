import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, CheckCircle2, MapPin, Image as ImageIcon } from 'lucide-react';
import type { Incident, WorkArea } from '../App';

interface ReportIncidentProps {
  onSubmit: (incident: Omit<Incident, 'id' | 'userId' | 'userName' | 'userEmail' | 'status' | 'createdAt' | 'updatedAt' | 'priority'>) => void;
}

export default function ReportIncident({ onSubmit }: ReportIncidentProps) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState<'Baja' | 'Media' | 'Alta' | 'Crítica'>('Media');
  const [location, setLocation] = useState('');
  const [floor, setFloor] = useState('');
  const [assignedArea, setAssignedArea] = useState<WorkArea>('Limpieza');
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    'Limpieza y Mantenimiento',
    'Infraestructura',
    'Mobiliario',
    'Tecnología',
    'Seguridad',
    'Servicios Generales',
    'Biblioteca',
    'Laboratorios',
    'Áreas Comunes',
    'Otro',
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      description,
      category,
      severity,
      location,
      floor: floor || undefined,
      assignedArea,
    });

    // Reset form and show success message
    setDescription('');
    setCategory('');
    setSeverity('Media');
    setLocation('');
    setFloor('');
    setAssignedArea('Limpieza');
    setShowSuccess(true);

    // Hide success message after 4 seconds
    setTimeout(() => setShowSuccess(false), 4000);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-green-900 mb-1">¡Reporte enviado exitosamente!</h3>
              <p className="text-green-700 mb-3">
                Hemos recibido tu reporte y el área correspondiente ha sido notificada. 
                Puedes hacer seguimiento del estado en la sección "Mis Reportes".
              </p>
              <div className="flex items-center gap-2 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Tu voz es importante para mejorar UTEC</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Nuevo Reporte de Incidente</h2>
        <p className="text-gray-600">
          Tu reporte nos ayuda a mantener el campus seguro y en óptimas condiciones. 
          Cada incidente es importante y será atendido por el equipo correspondiente.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción del Incidente <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe con el mayor detalle posible el incidente que has observado. Incluye información relevante como el tiempo que lleva ocurriendo, personas afectadas, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="resize-none"
            />
            <p className="text-gray-500">
              {description.length} caracteres
            </p>
          </div>

          {/* Location and Floor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">
                Ubicación <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Ej: Edificio A, Aula 401"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Piso / Nivel (opcional)</Label>
              <Input
                id="floor"
                type="text"
                placeholder="Ej: Piso 4"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
          </div>

          {/* Category and Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">
                Nivel de Gravedad <span className="text-red-500">*</span>
              </Label>
              <Select value={severity} onValueChange={(val) => setSeverity(val as 'Baja' | 'Media' | 'Alta' | 'Crítica')}>
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baja">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span>Baja - Puede esperar</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Media">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span>Media - Requiere atención</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Alta">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>Alta - Urgente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Crítica">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Crítica - Emergencia</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assigned Area - IMPORTANTE */}
          <div className="space-y-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <Label htmlFor="assignedArea" className="text-base font-semibold">
              Área Responsable <span className="text-red-500">*</span>
            </Label>
            <Select value={assignedArea} onValueChange={(val) => setAssignedArea(val as WorkArea)} required>
              <SelectTrigger id="assignedArea" className="bg-white">
                <SelectValue placeholder="Selecciona el área responsable" />
              </SelectTrigger>
              <SelectContent>
                {workAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-gray-700 font-medium">
              ⚠️ Selecciona el área que debe atender este incidente. El trabajador asignado a esta área recibirá la notificación.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 flex gap-4">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-900 mb-1">Información importante</h4>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Tu reporte será visible para el área asignada inmediatamente</li>
                <li>Recibirás actualizaciones sobre el estado de tu reporte</li>
                <li>Todos los reportes son confidenciales y anónimos si lo prefieres</li>
                <li>Puedes hacer seguimiento en "Mis Reportes"</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
          >
            Enviar Reporte
          </Button>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gray-100 rounded-lg p-6">
        <h3 className="text-gray-900 mb-3">¿Necesitas ayuda inmediata?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <p className="mb-1">🚨 Emergencias: <span className="text-red-600">(511) 230-5025</span></p>
            <p>📞 Seguridad: <span>(511) 230-5000</span></p>
          </div>
          <div>
            <p>📧 Email: <span>bienestarestudiantil@utec.edu.pe</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
