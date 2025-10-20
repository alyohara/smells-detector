/**
 * S01: Detector de Análisis Dimensional Semántico
 * Implementado según especificaciones del Capítulo 5, Sección 5.5.1
 */

/**
 * Detecta problemas de dimensiones inadecuadas en campos de entrada
 * @param {Object} context - Contexto de ejecución
 * @param {Array} context.nodes - Nodos a analizar (opcional, se calcula si no se proporciona)
 * @param {Object} context.settings - Configuraciones de análisis
 * @param {Object} context.utils - Utilidades disponibles
 * @returns {Promise<Array>} Findings encontrados
 */
async function run(context) {
  const { settings, utils, scope = 'page' } = context;
  let problemas = [];
  
  // Obtener inputs para analizar
  const inputs = utils.obtenerInputs(scope);
  
  for (const nodo of inputs) {
    // Buscar texto asociado para inferir tipo de dato
    const textoAsociado = utils.encontrarTextoAsociado(nodo);
    if (!textoAsociado) continue;
    
    // Identificar tipo de dato basado en el texto
    const tipoDeDato = utils.identificarTipoDeDato(textoAsociado);
    if (!tipoDeDato) continue;

    // Validar dimensiones actuales
    const anchoActual = Math.round(nodo.width);
    const { minWidth, maxWidth, mensaje } = tipoDeDato;
    
    // Verificar si está fuera del rango recomendado y no está ignorado
    if ((anchoActual < minWidth || anchoActual > maxWidth) && !utils.isIgnored(nodo, 'SEMANTIC')) {
      problemas.push({
        id: nodo.id, 
        name: `${nodo.name} (${anchoActual}px)`, 
        issue: mensaje,
        type: 'SEMANTIC', 
        severity: calculateSeverity(anchoActual, minWidth, maxWidth),
        suggestion: (tipoDeDato.suggestion && tipoDeDato.suggestion.length) 
          ? tipoDeDato.suggestion 
          : `Sugerido: ${minWidth}px - ${maxWidth}px`,
        // Metadatos adicionales para análisis
        metadata: {
          currentWidth: anchoActual,
          recommendedMin: minWidth,
          recommendedMax: maxWidth,
          dataType: Object.keys(utils.getAllDataTypes()).find(key => 
            utils.getAllDataTypes()[key] === tipoDeDato
          ),
          associatedText: textoAsociado
        }
      });
    }
  }
  
  return utils.withFrameInfo(problemas);
}

/**
 * Calcula la severidad basada en qué tan lejos está de los rangos recomendados
 * @param {number} actual - Ancho actual
 * @param {number} min - Ancho mínimo recomendado
 * @param {number} max - Ancho máximo recomendado
 * @returns {string} Nivel de severidad: 'low', 'medium', 'high'
 */
function calculateSeverity(actual, min, max) {
  if (actual < min) {
    const deficit = min - actual;
    if (deficit > 50) return 'high';
    if (deficit > 20) return 'medium';
    return 'low';
  }
  
  if (actual > max) {
    const excess = actual - max;
    if (excess > 100) return 'high';
    if (excess > 50) return 'medium';
    return 'low';
  }
  
  return 'low'; // No debería llegar aquí en condiciones normales
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
  if (typeof context.utils.encontrarTextoAsociado !== 'function') return false;
  if (typeof context.utils.identificarTipoDeDato !== 'function') return false;
  
  return true;
}

// Metadatos del detector
run.metadata = {
  code: 'S01',
  name: 'Detector de Análisis Dimensional',
  description: 'Detecta campos con ancho inadecuado basado en análisis semántico del tipo de dato',
  categories: ['SEMANTIC', 'DIMENSIONAL'],
  version: '1.0.0',
  stability: 'stable',
  dependencies: ['semantics', 'geometry'],
  
  // Configuraciones específicas del detector
  defaultSettings: {
    enableSeverityCalculation: true,
    includeMetadata: true,
    strictMode: false // Si es true, usa rangos más estrictos
  },
  
  // Tipos de datos que puede analizar
  supportedDataTypes: [
    'FECHA', 'TELEFONO', 'CODIGO_POSTAL', 'EMAIL', 'NOMBRE_CORTO'
  ],
  
  // Métricas de rendimiento esperadas
  performance: {
    complexity: 'O(n)', // Lineal en número de inputs
    averageTime: '< 10ms per 100 inputs',
    memoryUsage: 'minimal'
  }
};

// Función de utilidad para obtener configuración específica del detector
function getDetectorSettings(globalSettings) {
  return {
    ...run.metadata.defaultSettings,
    ...globalSettings?.detectors?.S01
  };
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    run, 
    validateContext, 
    calculateSeverity, 
    getDetectorSettings 
  };
} else {
  // Para uso en navegador/Figma
  window.SizeDetector = { 
    run, 
    validateContext, 
    calculateSeverity, 
    getDetectorSettings 
  };
}
