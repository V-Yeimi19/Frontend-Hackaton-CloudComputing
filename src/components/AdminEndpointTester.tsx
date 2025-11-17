import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AdminService } from '../services/api';
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

export default function AdminEndpointTester() {
  const [summaryResult, setSummaryResult] = useState<TestResult | null>(null);
  const [activeIncidentsResult, setActiveIncidentsResult] = useState<TestResult | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingActive, setLoadingActive] = useState(false);

  const testSummaryEndpoint = async () => {
    setLoadingSummary(true);
    console.log('🧪 Testing: GET /incidentes/resumen');
    console.log('URL: https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/resumen');

    const result = await AdminService.getIncidentsSummary();

    const testResult: TestResult = {
      ...result,
      timestamp: new Date(),
    };

    setSummaryResult(testResult);
    setLoadingSummary(false);

    if (result.success) {
      toast.success('Resumen de incidentes obtenido exitosamente');
      console.log('✅ Summary result:', result.data);
    } else {
      toast.error(`Error: ${result.error}`);
      console.error('❌ Summary error:', result.error);
    }
  };

  const testActiveIncidentsEndpoint = async () => {
    setLoadingActive(true);
    console.log('🧪 Testing: GET /incidentes/activos');
    console.log('URL: https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/activos');

    const result = await AdminService.listActiveIncidents();

    const testResult: TestResult = {
      ...result,
      timestamp: new Date(),
    };

    setActiveIncidentsResult(testResult);
    setLoadingActive(false);

    if (result.success) {
      toast.success(`${result.data?.length || 0} incidentes activos obtenidos`);
      console.log('✅ Active incidents result:', result.data);
    } else {
      toast.error(`Error: ${result.error}`);
      console.error('❌ Active incidents error:', result.error);
    }
  };

  const testAllEndpoints = async () => {
    await testSummaryEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between requests
    await testActiveIncidentsEndpoint();
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <h2 className="text-purple-900 mb-2">🧪 Verificador de Endpoints del Administrador</h2>
        <p className="text-purple-700 mb-4">
          Prueba y verifica el funcionamiento de los endpoints del panel administrativo
        </p>
        <div className="flex gap-3">
          <Button
            onClick={testAllEndpoints}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            disabled={loadingSummary || loadingActive}
          >
            {(loadingSummary || loadingActive) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Probar Todos los Endpoints
          </Button>
        </div>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Endpoint Test */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resumen de Incidentes</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={testSummaryEndpoint}
                disabled={loadingSummary}
              >
                {loadingSummary ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              GET /incidentes/resumen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Endpoint Info */}
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-600 mb-1">Endpoint URL:</p>
                <code className="text-xs break-all text-purple-700">
                  https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/resumen
                </code>
              </div>

              {/* Result */}
              {summaryResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  summaryResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {summaryResult.success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-green-900 font-semibold">Exitoso</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-900 font-semibold">Error</span>
                      </>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {formatTimestamp(summaryResult.timestamp)}
                    </span>
                  </div>

                  {summaryResult.success && summaryResult.data ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-600">Total</p>
                          <p className="text-lg font-bold text-blue-600">
                            {summaryResult.data.totalIncidentes ?? 'N/A'}
                          </p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-600">Pendientes</p>
                          <p className="text-lg font-bold text-gray-600">
                            {summaryResult.data.pendientes ?? 'N/A'}
                          </p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-600">Atendiendo</p>
                          <p className="text-lg font-bold text-blue-600">
                            {summaryResult.data.atendiendo ?? 'N/A'}
                          </p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-600">Finalizados</p>
                          <p className="text-lg font-bold text-green-600">
                            {summaryResult.data.finalizados ?? 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Raw JSON */}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-green-700 hover:text-green-900">
                          Ver JSON completo
                        </summary>
                        <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(summaryResult.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <p className="text-red-700 text-sm">{summaryResult.error}</p>
                  )}
                </div>
              )}

              {!summaryResult && (
                <div className="text-center py-6 text-gray-400">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>Haz clic en el botón para probar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Incidents Endpoint Test */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Incidentes Activos</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={testActiveIncidentsEndpoint}
                disabled={loadingActive}
              >
                {loadingActive ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              GET /incidentes/activos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Endpoint Info */}
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-600 mb-1">Endpoint URL:</p>
                <code className="text-xs break-all text-purple-700">
                  https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/activos
                </code>
              </div>

              {/* Result */}
              {activeIncidentsResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  activeIncidentsResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {activeIncidentsResult.success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-green-900 font-semibold">Exitoso</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-900 font-semibold">Error</span>
                      </>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {formatTimestamp(activeIncidentsResult.timestamp)}
                    </span>
                  </div>

                  {activeIncidentsResult.success && activeIncidentsResult.data ? (
                    <div className="space-y-2">
                      <div className="bg-white p-3 rounded">
                        <p className="text-gray-600 text-sm">Total de incidentes activos</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {activeIncidentsResult.data.length}
                        </p>
                      </div>

                      {activeIncidentsResult.data.length > 0 && (
                        <div className="bg-white p-3 rounded space-y-2">
                          <p className="text-sm font-semibold text-gray-700">
                            Primer incidente (muestra):
                          </p>
                          <div className="space-y-1 text-xs">
                            <p><span className="font-semibold">ID:</span> {activeIncidentsResult.data[0].id}</p>
                            <p><span className="font-semibold">Descripción:</span> {activeIncidentsResult.data[0].descripcion?.substring(0, 50)}...</p>
                            <p><span className="font-semibold">Estado:</span>
                              <Badge className="ml-2" variant="outline">
                                {activeIncidentsResult.data[0].estado}
                              </Badge>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Raw JSON */}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-green-700 hover:text-green-900">
                          Ver JSON completo ({activeIncidentsResult.data.length} items)
                        </summary>
                        <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(activeIncidentsResult.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <p className="text-red-700 text-sm">{activeIncidentsResult.error}</p>
                  )}
                </div>
              )}

              {!activeIncidentsResult && (
                <div className="text-center py-6 text-gray-400">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>Haz clic en el botón para probar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📝 Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 text-sm space-y-2">
          <p>1. Haz clic en "Probar Todos los Endpoints" para verificar ambos endpoints</p>
          <p>2. O haz clic en los botones individuales de cada card para probar uno a la vez</p>
          <p>3. Revisa los resultados en las tarjetas verdes (exitoso) o rojas (error)</p>
          <p>4. Abre la consola del navegador (F12) para ver logs detallados</p>
          <p>5. Expande "Ver JSON completo" para ver la respuesta completa del servidor</p>
        </CardContent>
      </Card>
    </div>
  );
}
