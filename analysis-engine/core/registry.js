/**
 * Registry Pattern: Catálogo de detectores disponibles con metadatos de capacidades
 * Implementado según especificaciones del Capítulo 5, Sección 5.5.1
 */

class DetectorRegistry {
  constructor() {
    this.detectors = new Map();
    this.executionOrder = [];
  }

  /**
   * Registra un detector en el catálogo
   * @param {Function} detector - Función detector con metadata
   */
  register(detector) {
    // Validación de interfaz
    if (typeof detector !== 'function') {
      throw new Error('Detector debe ser una función');
    }
    
    if (!detector.metadata || typeof detector.metadata !== 'object') {
      throw new Error('Detector debe tener metadata válido');
    }

    const { code, categories, version, stability, dependencies } = detector.metadata;
    
    // Validación de metadatos requeridos
    if (!code || typeof code !== 'string') {
      throw new Error('Detector debe tener código identificador válido');
    }
    
    if (!Array.isArray(categories)) {
      throw new Error('Detector debe tener categorías válidas');
    }

    // Registro en catálogo interno
    this.detectors.set(code, {
      detector,
      metadata: {
        code,
        categories: categories || [],
        version: version || '1.0.0',
        stability: stability || 'experimental',
        dependencies: dependencies || []
      }
    });

    // Actualizar orden de ejecución basado en dependencias
    this._updateExecutionOrder();
  }

  /**
   * Obtiene detectores filtrados por criterios
   * @param {Object} criteria - Criterios de filtrado (estabilidad, categoría, versión)
   * @returns {Array} Array de detectores aplicables
   */
  getDetectors(criteria = {}) {
    const { stability, categories, version, includeExperimental = false } = criteria;
    
    const filtered = Array.from(this.detectors.values()).filter(entry => {
      const meta = entry.metadata;
      
      // Filtro por estabilidad
      if (stability && meta.stability !== stability) {
        return false;
      }
      
      // Excluir experimentales por defecto
      if (!includeExperimental && meta.stability === 'experimental') {
        return false;
      }
      
      // Filtro por categorías
      if (categories && Array.isArray(categories)) {
        const hasCategory = categories.some(cat => meta.categories.includes(cat));
        if (!hasCategory) return false;
      }
      
      // Filtro por versión (comparación simple)
      if (version && meta.version !== version) {
        return false;
      }
      
      return true;
    });

    return filtered.map(entry => entry.detector);
  }

  /**
   * Ejecuta detectores con orquestación secuencial/paralela
   * @param {Array} detectors - Array de detectores a ejecutar
   * @param {Object} context - Contexto de ejecución
   * @returns {Promise<Array>} Resultados agregados
   */
  async execute(detectors, context) {
    const results = [];
    const metrics = {
      totalDuration: 0,
      detectorDurations: new Map(),
      nodesProcessed: context.nodes ? context.nodes.length : 0,
      findingsGenerated: 0,
      memoryFootprint: 0
    };

    const startTime = Date.now();

    try {
      // Ejecución secuencial para mantener orden y evitar conflictos
      for (const detector of detectors) {
        const detectorStart = Date.now();
        
        try {
          const findings = await detector(context);
          
          if (Array.isArray(findings)) {
            results.push(...findings);
            metrics.findingsGenerated += findings.length;
          }
          
          const detectorDuration = Date.now() - detectorStart;
          metrics.detectorDurations.set(detector.metadata?.code || 'unknown', detectorDuration);
          
        } catch (error) {
          console.error(`Error en detector ${detector.metadata?.code || 'unknown'}:`, error);
          // Continuar con otros detectores en caso de error
        }
      }

      metrics.totalDuration = Date.now() - startTime;

      // Log de métricas de rendimiento
      if (context.settings?.enablePerformanceLogging) {
        console.log('Métricas de rendimiento:', metrics);
      }

      return results;

    } catch (error) {
      console.error('Error en ejecución de detectores:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los detectores registrados en orden de ejecución
   * @returns {Array} Detectores ordenados por dependencias
   */
  getAllDetectors() {
    return this.executionOrder.map(code => this.detectors.get(code).detector);
  }

  /**
   * Obtiene metadata de un detector específico
   * @param {string} code - Código del detector
   * @returns {Object|null} Metadata del detector
   */
  getDetectorMetadata(code) {
    const entry = this.detectors.get(code);
    return entry ? entry.metadata : null;
  }

  /**
   * Verifica si un detector está registrado
   * @param {string} code - Código del detector
   * @returns {boolean}
   */
  hasDetector(code) {
    return this.detectors.has(code);
  }

  /**
   * Actualiza el orden de ejecución basado en dependencias
   * @private
   */
  _updateExecutionOrder() {
    const visited = new Set();
    const visiting = new Set();
    const order = [];

    const visit = (code) => {
      if (visiting.has(code)) {
        throw new Error(`Dependencia circular detectada: ${code}`);
      }
      
      if (visited.has(code)) {
        return;
      }

      visiting.add(code);
      
      const entry = this.detectors.get(code);
      if (entry && entry.metadata.dependencies) {
        for (const dep of entry.metadata.dependencies) {
          // Solo procesar dependencias que están registradas
          if (this.detectors.has(dep)) {
            visit(dep);
          }
        }
      }

      visiting.delete(code);
      visited.add(code);
      order.push(code);
    };

    // Visitar todos los detectores
    for (const code of this.detectors.keys()) {
      visit(code);
    }

    this.executionOrder = order;
  }

  /**
   * Elimina un detector del registro
   * @param {string} code - Código del detector a eliminar
   */
  unregister(code) {
    if (this.detectors.delete(code)) {
      this._updateExecutionOrder();
      return true;
    }
    return false;
  }

  /**
   * Limpia todos los detectores registrados
   */
  clear() {
    this.detectors.clear();
    this.executionOrder = [];
  }
}

// Instancia global del registry
const detectorRegistry = new DetectorRegistry();

// Exportar tanto la clase como la instancia global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DetectorRegistry, detectorRegistry };
} else {
  // Para uso en navegador/Figma
  window.DetectorRegistry = DetectorRegistry;
  window.detectorRegistry = detectorRegistry;
}
