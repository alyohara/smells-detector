/**
 * S02: Detector de Consistencia Espacial
 * Implementado según especificaciones del Capítulo 5, Sección 5.5.1
 */

/**
 * Detecta inconsistencias dimensionales entre elementos de un mismo grupo funcional
 * @param {Object} context - Contexto de ejecución
 * @returns {Promise<Array>} Findings encontrados
 */
async function run(context) {
  const { settings, utils, scope = 'page' } = context;
  let problemas = [];
  
  // Obtener inputs para analizar
  const inputs = utils.obtenerInputs(scope);
  
  // Agrupar inputs por proximidad espacial
  const formularios = utils.identificarFormulariosPorProximidad(inputs);
  
  for (const form of formularios) {
    const problemaConsistencia = analizarConsistenciaDeGrupo(form, utils);
    
    if (problemaConsistencia) {
      // Filtrar si todos los ids están ignorados
      const allIgnored = (problemaConsistencia.relatedIds || []).every(id => 
        utils.isIgnoredById(id, 'CONSISTENCY')
      );
      
      if (!allIgnored) {
        problemas.push(problemaConsistencia);
      }
    }
  }
  
  return utils.withFrameInfo(problemas);
}

/**
 * Analiza consistencia dimensional dentro de un grupo de elementos
 * @param {Array} grupo - Grupo de inputs relacionados
 * @param {Object} utils - Utilidades disponibles
 * @returns {Object|null} Problema de consistencia o null
 */
function analizarConsistenciaDeGrupo(grupo, utils) {
  if (!grupo || grupo.length < 2) return null;
  
  // Calcular estadísticas de anchos
  const anchos = grupo.map(input => Math.round(input.width));
  const media = anchos.reduce((sum, w) => sum + w, 0) / anchos.length;
  const varianza = anchos.reduce((sum, w) => sum + Math.pow(w - media, 2), 0) / anchos.length;
  const desviacionEstandar = Math.sqrt(varianza);
  
  // Umbral de tolerancia para inconsistencia (configurable)
  const umbralTolerancia = 15; // pixels
  
  if (desviacionEstandar <= umbralTolerancia) {
    return null; // Grupo consistente
  }
  
  // Identificar outliers (elementos que se desvían significativamente)
  const outliers = [];
  const elementosProblematicos = [];
  
  for (let i = 0; i < grupo.length; i++) {
    const input = grupo[i];
    const ancho = anchos[i];
    const desviacion = Math.abs(ancho - media);
    
    if (desviacion > umbralTolerancia) {
      outliers.push({
        id: input.id,
        name: input.name,
        width: ancho,
        deviation: Math.round(desviacion)
      });
      elementosProblematicos.push(input.id);
    }
  }
  
  if (outliers.length === 0) return null;
  
  // Calcular severidad basada en la desviación
  const severidad = calculateConsistencySeverity(desviacionEstandar, umbralTolerancia);
  
  // Determinar ancho recomendado (moda o mediana)
  const anchoRecomendado = calcularAnchoRecomendado(anchos);
  
  return {
    id: grupo[0].id, // ID representativo del grupo
    name: `Inconsistencia en grupo de ${grupo.length} elementos`,
    issue: `Elementos con anchos inconsistentes. Desviación estándar: ${Math.round(desviacionEstandar)}px`,
    type: 'CONSISTENCY',
    severity: severidad,
    suggestion: `Unificar anchos. Sugerido: ${anchoRecomendado}px`,
    
    // IDs relacionados para acciones grupales
    relatedIds: elementosProblematicos,
    
    // Metadatos detallados
    metadata: {
      groupSize: grupo.length,
      averageWidth: Math.round(media),
      standardDeviation: Math.round(desviacionEstandar),
      recommendedWidth: anchoRecomendado,
      outliers: outliers,
      allWidths: anchos,
      tolerance: umbralTolerancia
    }
  };
}

/**
 * Calcula la severidad basada en la desviación estándar
 * @param {number} desviacion - Desviación estándar del grupo
 * @param {number} umbral - Umbral de tolerancia
 * @returns {string} Nivel de severidad
 */
function calculateConsistencySeverity(desviacion, umbral) {
  const ratio = desviacion / umbral;
  
  if (ratio > 3) return 'high';    // Muy inconsistente
  if (ratio > 2) return 'medium';  // Moderadamente inconsistente
  return 'low';                    // Ligeramente inconsistente
}

/**
 * Calcula ancho recomendado para el grupo
 * @param {Array} anchos - Array de anchos actuales
 * @returns {number} Ancho recomendado
 */
function calcularAnchoRecomendado(anchos) {
  // Usar la moda (valor más frecuente) o mediana como recomendación
  const frecuencias = {};
  anchos.forEach(ancho => {
    frecuencias[ancho] = (frecuencias[ancho] || 0) + 1;
  });
  
  // Encontrar la moda
  let moda = anchos[0];
  let maxFrecuencia = 0;
  
  for (const ancho in frecuencias) {
    if (frecuencias[ancho] > maxFrecuencia) {
      maxFrecuencia = frecuencias[ancho];
      moda = parseInt(ancho);
    }
  }
  
  // Si no hay moda clara, usar mediana
  if (maxFrecuencia === 1) {
    const sorted = [...anchos].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    moda = sorted.length % 2 === 0 
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid];
  }
  
  return moda;
}

/**
 * Validar precondiciones para la ejecución del detector
 * @param {Object} context - Contexto de ejecución
 * @returns {boolean} true si puede ejecutarse
 */
function validateContext(context) {
  if (!context) return false;
  if (!context.utils) return false;
  if (typeof context.utils.obtenerInputs !== 'function') return false;
  if (typeof context.utils.identificarFormulariosPorProximidad !== 'function') return false;
  
  return true;
}

// Metadatos del detector
run.metadata = {
  code: 'S02',
  name: 'Detector de Consistencia Espacial',
  description: 'Detecta inconsistencias dimensionales entre elementos funcionalmente relacionados',
  categories: ['CONSISTENCY', 'SPATIAL'],
  version: '1.0.0',
  stability: 'stable',
  dependencies: ['geometry', 'grouping'],
  
  // Configuraciones específicas del detector
  defaultSettings: {
    toleranceThreshold: 15, // pixels
    minimumGroupSize: 2,
    enableOutlierDetection: true,
    severityCalculation: 'standard_deviation'
  },
  
  // Métricas de rendimiento esperadas
  performance: {
    complexity: 'O(n log n)', // Dominado por algoritmos de agrupación
    averageTime: '< 50ms per 100 inputs',
    memoryUsage: 'moderate'
  }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    run, 
    validateContext,
    analizarConsistenciaDeGrupo,
    calculateConsistencySeverity,
    calcularAnchoRecomendado
  };
} else {
  // Para uso en navegador/Figma
  window.ConsistencyDetector = { 
    run, 
    validateContext,
    analizarConsistenciaDeGrupo,
    calculateConsistencySeverity,
    calcularAnchoRecomendado
  };
}
