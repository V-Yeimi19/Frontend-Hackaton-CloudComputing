/**
 * Script de prueba para verificar los endpoints del administrador
 * Este archivo se puede ejecutar para probar manualmente los endpoints
 */

import { AdminService } from './services/api';

export async function testAdminEndpoints() {
  console.log('🧪 Iniciando pruebas de endpoints del administrador...\n');

  // Test 1: Resumen de incidentes
  console.log('📊 Test 1: Obtener resumen de incidentes');
  console.log('Endpoint: GET /incidentes/resumen');
  console.log('URL: https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/resumen\n');

  const summaryResult = await AdminService.getIncidentsSummary();

  if (summaryResult.success) {
    console.log('✅ Resumen obtenido exitosamente:');
    console.log(JSON.stringify(summaryResult.data, null, 2));
    console.log('\nEstructura esperada:');
    console.log('- totalIncidentes: number');
    console.log('- pendientes: number');
    console.log('- atendiendo: number');
    console.log('- finalizados: number');
    console.log('- porArea?: Record<string, number>');
    console.log('- porCategoria?: Record<string, number>');
  } else {
    console.error('❌ Error al obtener resumen:', summaryResult.error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Listar incidentes activos
  console.log('📋 Test 2: Listar incidentes activos');
  console.log('Endpoint: GET /incidentes/activos');
  console.log('URL: https://sw8gon2h0d.execute-api.us-east-1.amazonaws.com/incidentes/activos\n');

  const activeResult = await AdminService.listActiveIncidents();

  if (activeResult.success) {
    console.log('✅ Incidentes activos obtenidos exitosamente:');
    console.log(`Total de incidentes activos: ${activeResult.data?.length || 0}`);

    if (activeResult.data && activeResult.data.length > 0) {
      console.log('\nPrimer incidente (muestra):');
      console.log(JSON.stringify(activeResult.data[0], null, 2));
      console.log('\nEstructura esperada de cada incidente:');
      console.log('- id: string');
      console.log('- descripcion: string');
      console.log('- categoria: string');
      console.log('- nivelDeGravedad: string');
      console.log('- ubicacion: string');
      console.log('- piso?: string');
      console.log('- estado: string (Pendiente o Atendiendo)');
      console.log('- areaAsignada?: string');
      console.log('- creadoPor: string');
      console.log('- fechaCreacion: string');
      console.log('- fechaActualizacion?: string');
    } else {
      console.log('ℹ️ No hay incidentes activos en este momento');
    }
  } else {
    console.error('❌ Error al obtener incidentes activos:', activeResult.error);
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('✅ Pruebas completadas\n');

  return {
    summaryTest: summaryResult,
    activeIncidentsTest: activeResult,
  };
}

// Función auxiliar para verificar la estructura de datos
export function validateSummaryStructure(data: any): boolean {
  const requiredFields = ['totalIncidentes', 'pendientes', 'atendiendo', 'finalizados'];
  const optionalFields = ['porArea', 'porCategoria'];

  console.log('🔍 Validando estructura del resumen...');

  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(`❌ Campo requerido faltante: ${field}`);
      return false;
    }
    if (typeof data[field] !== 'number') {
      console.error(`❌ Campo ${field} debe ser un número, recibido: ${typeof data[field]}`);
      return false;
    }
  }

  for (const field of optionalFields) {
    if (field in data && typeof data[field] !== 'object') {
      console.error(`❌ Campo opcional ${field} debe ser un objeto`);
      return false;
    }
  }

  console.log('✅ Estructura válida');
  return true;
}

export function validateActiveIncidentStructure(incident: any): boolean {
  const requiredFields = [
    'id',
    'descripcion',
    'categoria',
    'nivelDeGravedad',
    'ubicacion',
    'estado',
    'creadoPor',
    'fechaCreacion'
  ];

  console.log('🔍 Validando estructura del incidente...');

  for (const field of requiredFields) {
    if (!(field in incident)) {
      console.error(`❌ Campo requerido faltante: ${field}`);
      return false;
    }
  }

  // Validar que el estado sea Pendiente o Atendiendo
  if (!['Pendiente', 'Atendiendo', 'En Proceso'].includes(incident.estado)) {
    console.error(`❌ Estado inválido: ${incident.estado}. Debe ser Pendiente o Atendiendo`);
    return false;
  }

  console.log('✅ Estructura válida');
  return true;
}
