/**
 * Bootstrap del sistema modular - Configuración e inicialización
 * Implementado según especificaciones del Capítulo 5, Sección 5.5.1
 */

// =================================================================================
// IMPORTACIÓN Y CONFIGURACIÓN DEL SISTEMA MODULAR
// =================================================================================

// Cargar módulos principales (simulación de imports para entorno Figma)
let detectorRegistry, analysisRunner;
let semanticsUtils, geometryUtils, groupingUtils;

// Función de inicialización del sistema modular
async function initializeModularSystem() {
  try {
    console.log('🔧 Inicializando sistema modular...');
    
    // En un entorno real, estos serían imports ES6
    // Para Figma, simulamos la carga de módulos
    
    // Verificar que los módulos estén disponibles globalmente
    if (typeof window !== 'undefined') {
      detectorRegistry = window.detectorRegistry;
      analysisRunner = window.analysisRunner;
      semanticsUtils = window.SemanticsUtils;
      geometryUtils = window.GeometryUtils;
      groupingUtils = window.GroupingUtils;
    }
    
    // Crear objeto de utilidades consolidado
    const utils = createUtilsObject();
    
    // Inicializar runner con dependencias
    if (analysisRunner && detectorRegistry) {
      analysisRunner.initialize(detectorRegistry, utils, SETTINGS);
      console.log('✅ Sistema modular inicializado correctamente');
      return true;
    } else {
      console.warn('⚠️ No se pudieron cargar todos los módulos - usando sistema legacy');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error inicializando sistema modular:', error);
    return false;
  }
}

// Crear objeto consolidado de utilidades
function createUtilsObject() {
  return {
    // Funciones de geometría
    getAbsRect: geometryUtils?.getAbsRect || getAbsRect,
    getInputVisualRect: geometryUtils?.getInputVisualRect || getInputVisualRect,
    estaDentro: geometryUtils?.estaDentro || estaDentro,
    calcularDistancia: geometryUtils?.calcularDistancia,
    
    // Funciones semánticas
    normalizarTexto: semanticsUtils?.normalizarTexto || normalizarTexto,
    encontrarTextoAsociado: semanticsUtils?.encontrarTextoAsociado || encontrarTextoAsociado,
    identificarTipoDeDato: semanticsUtils?.identificarTipoDeDato || identificarTipoDeDato,
    esVinculoConfuso: semanticsUtils?.esVinculoConfuso,
    esVinculoGenerico: semanticsUtils?.esVinculoGenerico,
    
    // Funciones de agrupación
    identificarFormulariosPorProximidad: groupingUtils?.identificarFormulariosPorProximidad || identificarFormulariosPorProximidad,
    estaEnContextoDeFormulario: groupingUtils?.estaEnContextoDeFormulario,
    agruparPorDensidad: groupingUtils?.agruparPorDensidad,
    
    // Funciones de obtención de datos
    obtenerInputs: obtenerInputs,
    obtenerTextos: obtenerTextos,
    getAllDataTypes: getAllDataTypes,
    
    // Funciones de metadatos
    withFrameInfo: withFrameInfo,
    getAncestorFrameInfo: getAncestorFrameInfo,
    isIgnored: isIgnored,
    isIgnoredById: isIgnoredById,
    
    // Funciones de validación
    esCandidatoAInput: esCandidatoAInput,
    esInputConfirmado: esInputConfirmado,
    esInputIgnorado: esInputIgnorado,
    
    // Cache y optimización
    clearCache: () => {
      if (geometryUtils?.clearRectCache) {
        geometryUtils.clearRectCache();
      }
    }
  };
}

// Funciones para registrar detectores automáticamente
function registerBuiltInDetectors() {
  if (!detectorRegistry) return;
  
  try {
    // Registrar detectores disponibles
    if (typeof window !== 'undefined') {
      
      // S01 - Size Detector
      if (window.SizeDetector) {
        detectorRegistry.register(window.SizeDetector.run);
        console.log('✅ Detector S01 (Size) registrado');
      }
      
      // S02 - Consistency Detector  
      if (window.ConsistencyDetector) {
        detectorRegistry.register(window.ConsistencyDetector.run);
        console.log('✅ Detector S02 (Consistency) registrado');
      }
      
      // Aquí se registrarían S03-S07 cuando estén implementados
      
    }
  } catch (error) {
    console.error('❌ Error registrando detectores:', error);
  }
}

// Función adaptadora para mantener compatibilidad con sistema legacy
async function runModularAnalysis(analysisType, scope = 'page') {
  const isModularReady = await initializeModularSystem();
  
  if (!isModularReady || !analysisRunner) {
    // Fallback al sistema legacy
    console.log('🔄 Usando sistema legacy para análisis');
    return runLegacyAnalysis(analysisType, scope);
  }
  
  try {
    // Mapear tipos de análisis legacy a códigos de detectores
    const detectorMapping = {
      'analyze-size': ['S01'],
      'analyze-consistency': ['S02'],
      'analyze-format': ['S03'],
      'analyze-links': ['S04'],
      'analyze-limited-values': ['S05'],
      'analyze-complexity': ['S06'],
      'analyze-flows': ['S07'],
      'analyze-complete': [] // Todos los detectores estables
    };
    
    const detectorCodes = detectorMapping[analysisType];
    
    if (detectorCodes !== undefined) {
      if (detectorCodes.length === 0) {
        // Análisis completo
        return await analysisRunner.runCompleteAnalysis(scope);
      } else if (detectorCodes.length === 1) {
        // Detector específico
        return await analysisRunner.runSingleDetector(detectorCodes[0], scope);
      } else {
        // Múltiples detectores específicos
        return await analysisRunner.runCompleteAnalysis(scope, detectorCodes);
      }
    } else {
      // Tipo no reconocido, usar legacy
      return runLegacyAnalysis(analysisType, scope);
    }
    
  } catch (error) {
    console.error('❌ Error en análisis modular, fallback a legacy:', error);
    return runLegacyAnalysis(analysisType, scope);
  }
}

// Función de fallback al sistema legacy
async function runLegacyAnalysis(analysisType, scope) {
  console.log(`🔄 Ejecutando análisis legacy: ${analysisType}`);
  
  // Mapear a funciones legacy existentes
  const legacyFunctions = {
    'analyze-size': () => analizarTamanoDeInputs(scope),
    'analyze-consistency': () => analizarConsistenciaGlobal(scope),
    'analyze-format': () => analizarCamposSinFormato(scope),
    'analyze-links': () => analizarVinculosConfusos(scope),
    'analyze-limited-values': () => analizarValoresLimitados(scope),
    'analyze-complexity': () => analizarComplejidadDeFormularios(scope),
    'analyze-flows': () => visualizarFlujosDePrototipo(),
    'analyze-complete': () => analizarCompletoMejorado(scope),
    'detect-potential-inputs': () => detectarCandidatosInputs(scope)
  };
  
  const legacyFunction = legacyFunctions[analysisType];
  
  if (legacyFunction) {
    return await legacyFunction();
  } else {
    console.error(`❌ Tipo de análisis no reconocido: ${analysisType}`);
    return [];
  }
}

// Función para obtener estado del sistema modular
function getModularSystemStatus() {
  return {
    isInitialized: !!analysisRunner?.isInitialized(),
    registryLoaded: !!detectorRegistry,
    runnerLoaded: !!analysisRunner,
    utilsLoaded: !!(semanticsUtils && geometryUtils && groupingUtils),
    registeredDetectors: detectorRegistry ? detectorRegistry.detectors.size : 0,
    performanceMetrics: analysisRunner ? analysisRunner.getPerformanceMetrics() : null
  };
}

// Auto-inicialización cuando se carga el script
if (typeof window !== 'undefined') {
  // Usar setTimeout para permitir que otros scripts se carguen primero
  setTimeout(() => {
    initializeModularSystem().then(() => {
      registerBuiltInDetectors();
      console.log('📊 Estado del sistema modular:', getModularSystemStatus());
    });
  }, 100);
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
  window.ModularSystem = {
    initialize: initializeModularSystem,
    registerDetectors: registerBuiltInDetectors,
    runAnalysis: runModularAnalysis,
    getStatus: getModularSystemStatus,
    runner: () => analysisRunner,
    registry: () => detectorRegistry
  };
}
