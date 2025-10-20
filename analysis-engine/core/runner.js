/**
 * Core Runner - Orquestador de ejecución del sistema de análisis
 * Implementado según especificaciones del Capítulo 5, Sección 5.5.1
 */

/**
 * Orquestador principal de análisis
 */
class AnalysisRunner {
  constructor() {
    this.registry = null;
    this.utils = null;
    this.settings = {};
    this.performanceMetrics = {
      totalAnalysisTime: 0,
      detectorMetrics: new Map(),
      lastRun: null
    };
  }

  /**
   * Inicializa el runner con dependencias
   * @param {Object} registry - Instancia de DetectorRegistry
   * @param {Object} utils - Utilidades del sistema
   * @param {Object} settings - Configuraciones globales
   */
  initialize(registry, utils, settings = {}) {
    this.registry = registry;
    this.utils = utils;
    this.settings = { ...this.getDefaultSettings(), ...settings };
    
    // Registrar detectores disponibles
    this.registerBuiltInDetectors();
  }

  /**
   * Ejecuta análisis completo del sistema
   * @param {string} scope - Alcance del análisis ('page' | 'selection')
   * @param {Array} detectorCodes - Códigos específicos de detectores (opcional)
   * @returns {Promise<Array>} Findings consolidados
   */
  async runCompleteAnalysis(scope = 'page', detectorCodes = null) {
    const startTime = Date.now();
    
    try {
      // Preparar contexto de ejecución
      const context = this.prepareExecutionContext(scope);
      
      // Seleccionar detectores
      const detectorsToRun = detectorCodes 
        ? this.getSpecificDetectors(detectorCodes)
        : this.registry.getDetectors({ stability: 'stable' });

      console.log(`🚀 Iniciando análisis con ${detectorsToRun.length} detectores...`);
      
      // Ejecutar detectores
      const findings = await this.registry.execute(detectorsToRun, context);
      
      // Post-procesar resultados
      const processedFindings = this.postProcessFindings(findings);
      
      // Actualizar métricas
      const totalTime = Date.now() - startTime;
      this.updatePerformanceMetrics(totalTime, findings.length);
      
      console.log(`✅ Análisis completado: ${processedFindings.length} findings en ${totalTime}ms`);
      
      return processedFindings;
      
    } catch (error) {
      console.error('❌ Error en análisis completo:', error);
      throw error;
    }
  }

  /**
   * Ejecuta un detector específico
   * @param {string} detectorCode - Código del detector
   * @param {string} scope - Alcance del análisis
   * @returns {Promise<Array>} Findings del detector
   */
  async runSingleDetector(detectorCode, scope = 'page') {
    if (!this.registry.hasDetector(detectorCode)) {
      throw new Error(`Detector ${detectorCode} no encontrado`);
    }

    const context = this.prepareExecutionContext(scope);
    const detector = this.getSpecificDetectors([detectorCode])[0];
    
    if (!detector) {
      throw new Error(`No se pudo obtener detector ${detectorCode}`);
    }

    console.log(`🔍 Ejecutando detector ${detectorCode}...`);
    
    const startTime = Date.now();
    const findings = await detector(context);
    const executionTime = Date.now() - startTime;
    
    console.log(`✅ Detector ${detectorCode} completado: ${findings.length} findings en ${executionTime}ms`);
    
    return Array.isArray(findings) ? findings : [];
  }

  /**
   * Prepara el contexto de ejecución para los detectores
   * @param {string} scope - Alcance del análisis
   * @returns {Object} Contexto de ejecución
   */
  prepareExecutionContext(scope) {
    // Obtener nodos según el scope
    let nodes = [];
    if (scope === 'selection' && figma.currentPage.selection.length > 0) {
      const selection = figma.currentPage.selection;
      // Incluir seleccionados y sus descendientes
      for (const node of selection) {
        nodes.push(node);
        if ('findAll' in node) {
          nodes.push(...node.findAll(() => true));
        }
      }
    } else {
      nodes = figma.currentPage.findAll(() => true);
    }

    return {
      nodes,
      scope,
      settings: this.settings,
      utils: this.utils,
      figma, // Referencia al API de Figma
      
      // Metadatos del contexto
      timestamp: Date.now(),
      pageId: figma.currentPage.id,
      pageName: figma.currentPage.name,
      nodeCount: nodes.length
    };
  }

  /**
   * Post-procesa los findings para normalización y enriquecimiento
   * @param {Array} findings - Findings crudos
   * @returns {Array} Findings procesados
   */
  postProcessFindings(findings) {
    if (!Array.isArray(findings)) return [];

    return findings
      .filter(finding => finding && typeof finding === 'object')
      .map(finding => this.enrichFinding(finding))
      .sort((a, b) => this.compareFindingsSeverity(a, b));
  }

  /**
   * Enriquece un finding individual con metadatos adicionales
   * @param {Object} finding - Finding original
   * @returns {Object} Finding enriquecido
   */
  enrichFinding(finding) {
    const enriched = { ...finding };
    
    // Agregar timestamp si no existe
    if (!enriched.timestamp) {
      enriched.timestamp = Date.now();
    }
    
    // Agregar información de frame si no existe
    if (!enriched.frameId || !enriched.frameName) {
      const frameInfo = this.utils.getAncestorFrameInfo 
        ? this.utils.getAncestorFrameInfo(figma.getNodeById(finding.id))
        : { frameId: null, frameName: '—' };
      
      enriched.frameId = frameInfo.frameId;
      enriched.frameName = frameInfo.frameName;
    }
    
    // Normalizar severidad
    if (!enriched.severity) {
      enriched.severity = 'medium';
    }
    
    // Agregar categorías si no existen
    if (!enriched.categories && enriched.type) {
      enriched.categories = this.getCategoriesForType(enriched.type);
    }
    
    return enriched;
  }

  /**
   * Compara findings por severidad para ordenamiento
   * @param {Object} a - Primer finding
   * @param {Object} b - Segundo finding
   * @returns {number} Resultado de comparación
   */
  compareFindingsSeverity(a, b) {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityA = severityOrder[a.severity] || 1;
    const severityB = severityOrder[b.severity] || 1;
    
    // Ordenar por severidad (alta primero), luego por tipo
    if (severityA !== severityB) {
      return severityB - severityA;
    }
    
    return (a.type || '').localeCompare(b.type || '');
  }

  /**
   * Obtiene categorías para un tipo de finding
   * @param {string} type - Tipo de finding
   * @returns {Array} Categorías aplicables
   */
  getCategoriesForType(type) {
    const typeCategories = {
      'SEMANTIC': ['UX', 'SEMANTIC'],
      'CONSISTENCY': ['UX', 'LAYOUT'],
      'FORMAT': ['UX', 'COMPONENTS'],
      'LINK': ['UX', 'CONTENT'],
      'LIMITED_VALUES': ['UX', 'INTERACTION'],
      'COMPLEXITY': ['UX', 'USABILITY'],
      'FLOW': ['UX', 'NAVIGATION']
    };
    
    return typeCategories[type] || ['UX'];
  }

  /**
   * Obtiene detectores específicos por códigos
   * @param {Array} detectorCodes - Códigos de detectores
   * @returns {Array} Detectores encontrados
   */
  getSpecificDetectors(detectorCodes) {
    const detectors = [];
    
    for (const code of detectorCodes) {
      const allDetectors = this.registry.getAllDetectors();
      const detector = allDetectors.find(d => d.metadata && d.metadata.code === code);
      
      if (detector) {
        detectors.push(detector);
      } else {
        console.warn(`Detector ${code} no encontrado`);
      }
    }
    
    return detectors;
  }

  /**
   * Registra detectores built-in del sistema
   */
  registerBuiltInDetectors() {
    // Esta función debería ser implementada para registrar
    // todos los detectores S01-S07 automáticamente
    console.log('🔧 Registrando detectores built-in...');
    
    // Los detectores se registrarían aquí si estuvieran disponibles
    // Ejemplo: this.registry.register(SizeDetector.run);
  }

  /**
   * Actualiza métricas de rendimiento
   * @param {number} totalTime - Tiempo total de ejecución
   * @param {number} findingsCount - Número de findings generados
   */
  updatePerformanceMetrics(totalTime, findingsCount) {
    this.performanceMetrics.totalAnalysisTime = totalTime;
    this.performanceMetrics.lastRun = {
      timestamp: Date.now(),
      duration: totalTime,
      findingsCount,
      nodeCount: this.lastContextNodeCount || 0
    };
  }

  /**
   * Obtiene métricas de rendimiento
   * @returns {Object} Métricas de rendimiento
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * Obtiene configuraciones por defecto
   * @returns {Object} Configuraciones por defecto
   */
  getDefaultSettings() {
    return {
      UMBRAL_CAMPOS_FORMULARIO: 8,
      MAX_DISTANCIA_VERTICAL: 40,
      MAX_DESVIACION_HORIZONTAL: 10,
      MAX_PASOS_FLOW: 30,
      enablePerformanceLogging: false,
      enableCache: true,
      timeout: 30000 // 30 segundos
    };
  }

  /**
   * Valida que el runner esté correctamente inicializado
   * @returns {boolean} true si está inicializado
   */
  isInitialized() {
    return !!(this.registry && this.utils);
  }

  /**
   * Limpia el estado del runner
   */
  reset() {
    this.performanceMetrics = {
      totalAnalysisTime: 0,
      detectorMetrics: new Map(),
      lastRun: null
    };
    
    // Limpiar cache si está disponible
    if (this.utils && this.utils.clearCache) {
      this.utils.clearCache();
    }
  }
}

// Instancia global del runner
const analysisRunner = new AnalysisRunner();

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnalysisRunner, analysisRunner };
} else {
  // Para uso en navegador/Figma
  window.AnalysisRunner = AnalysisRunner;
  window.analysisRunner = analysisRunner;
}
