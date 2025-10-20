/**
 * Módulo de operaciones geométricas y análisis espacial
 * Implementado según especificaciones del Capítulo 5, Sección 5.5.1
 */

/**
 * Calcula el bounding box absoluto axis-aligned de un nodo
 * @param {Object} node - Nodo de Figma
 * @returns {Object} {x, y, width, height}
 */
function getAbsRect(node) {
  // Calcula el bounding box absoluto axis-aligned
  const m = node.absoluteTransform; // [[a,c,e],[b,d,f]]
  const w = node.width, h = node.height;
  const pts = [
    { x: 0, y: 0 }, { x: w, y: 0 }, { x: 0, y: h }, { x: w, y: h }
  ].map(p => ({ 
    x: m[0][0]*p.x + m[0][1]*p.y + m[0][2], 
    y: m[1][0]*p.x + m[1][1]*p.y + m[1][2] 
  }));
  
  const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Verifica si una caja está completamente dentro de otra
 * @param {Object} cajaInterna - {x, y, width, height}
 * @param {Object} cajaExterna - {x, y, width, height}
 * @returns {boolean}
 */
function estaDentro(cajaInterna, cajaExterna) {
  if (!cajaInterna || !cajaExterna) return false;
  return (
    cajaInterna.x >= cajaExterna.x && 
    cajaInterna.y >= cajaExterna.y && 
    cajaInterna.x + cajaInterna.width <= cajaExterna.x + cajaExterna.width && 
    cajaInterna.y + cajaInterna.height <= cajaExterna.y + cajaExterna.height
  );
}

/**
 * Calcula la distancia euclidiana entre dos puntos
 * @param {Object} punto1 - {x, y}
 * @param {Object} punto2 - {x, y}
 * @returns {number} Distancia en pixels
 */
function calcularDistancia(punto1, punto2) {
  const dx = punto2.x - punto1.x;
  const dy = punto2.y - punto1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula la distancia mínima entre dos rectángulos
 * @param {Object} rect1 - {x, y, width, height}
 * @param {Object} rect2 - {x, y, width, height}
 * @returns {number} Distancia mínima en pixels
 */
function calcularDistanciaEntreRectangulos(rect1, rect2) {
  const dx = Math.max(0, Math.max(rect1.x - (rect2.x + rect2.width), rect2.x - (rect1.x + rect1.width)));
  const dy = Math.max(0, Math.max(rect1.y - (rect2.y + rect2.height), rect2.y - (rect1.y + rect1.height)));
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula el solapamiento entre dos áreas rectangulares
 * @param {Object} input1 - Primer rectángulo
 * @param {Object} input2 - Segundo rectángulo
 * @returns {number} Porcentaje de solapamiento (0-1)
 */
function calcularSolapamientoDeAreas(input1, input2) {
  const rect1 = getAbsRect(input1);
  const rect2 = getAbsRect(input2);
  
  const area1 = {
    left: rect1.x,
    right: rect1.x + rect1.width,
    top: rect1.y,
    bottom: rect1.y + rect1.height
  };
  
  const area2 = {
    left: rect2.x,
    right: rect2.x + rect2.width,
    top: rect2.y,
    bottom: rect2.y + rect2.height
  };
  
  // Calcular intersección
  const interseccionLeft = Math.max(area1.left, area2.left);
  const interseccionRight = Math.min(area1.right, area2.right);
  const interseccionTop = Math.max(area1.top, area2.top);
  const interseccionBottom = Math.min(area1.bottom, area2.bottom);
  
  if (interseccionLeft >= interseccionRight || interseccionTop >= interseccionBottom) {
    return 0; // No hay solapamiento
  }
  
  const areaInterseccion = (interseccionRight - interseccionLeft) * (interseccionBottom - interseccionTop);
  const area1Total = rect1.width * rect1.height;
  const area2Total = rect2.width * rect2.height;
  const areaUnion = area1Total + area2Total - areaInterseccion;
  
  return areaInterseccion / areaUnion;
}

/**
 * Obtiene el rectángulo visual efectivo de un input
 * @param {Object} node - Nodo de Figma
 * @returns {Object} Rectángulo visual
 */
function getInputVisualRect(node) {
  // Si es rectángulo, su caja es la visual
  if (node.type === 'RECTANGLE') return getAbsRect(node);
  
  // Si es contenedor, intentamos encontrar un hijo rectángulo con altura típica de input
  if ('children' in node && Array.isArray(node.children)) {
    for (var i = 0; i < node.children.length; i++) {
      var c = node.children[i];
      if (c.type === 'RECTANGLE' && c.height >= 24 && c.height <= 60) {
        return getAbsRect(c);
      }
    }
  }
  
  // Fallback
  return getAbsRect(node);
}

/**
 * Verifica si dos inputs están alineados horizontalmente
 * @param {Object} input1 - Primer input
 * @param {Object} input2 - Segundo input
 * @param {number} tolerance - Tolerancia en pixels (default: 10)
 * @returns {boolean}
 */
function estanAlineadosHorizontalmente(input1, input2, tolerance = 10) {
  const rect1 = getInputVisualRect(input1);
  const rect2 = getInputVisualRect(input2);
  
  return Math.abs(rect1.x - rect2.x) <= tolerance;
}

/**
 * Verifica si dos inputs están alineados verticalmente
 * @param {Object} input1 - Primer input
 * @param {Object} input2 - Segundo input
 * @param {number} tolerance - Tolerancia en pixels (default: 10)
 * @returns {boolean}
 */
function estanAlineadosVerticalmente(input1, input2, tolerance = 10) {
  const rect1 = getInputVisualRect(input1);
  const rect2 = getInputVisualRect(input2);
  
  return Math.abs(rect1.y - rect2.y) <= tolerance;
}

/**
 * Calcula el centro de un rectángulo
 * @param {Object} rect - {x, y, width, height}
 * @returns {Object} {x, y}
 */
function calcularCentro(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}

/**
 * Ordena inputs por posición vertical (top to bottom)
 * @param {Array} inputs - Array de inputs
 * @returns {Array} Inputs ordenados
 */
function ordenarPorPosicionVertical(inputs) {
  return inputs.sort((a, b) => {
    const rectA = getInputVisualRect(a);
    const rectB = getInputVisualRect(b);
    return rectA.y - rectB.y;
  });
}

/**
 * Ordena inputs por posición horizontal (left to right)
 * @param {Array} inputs - Array de inputs
 * @returns {Array} Inputs ordenados
 */
function ordenarPorPosicionHorizontal(inputs) {
  return inputs.sort((a, b) => {
    const rectA = getInputVisualRect(a);
    const rectB = getInputVisualRect(b);
    return rectA.x - rectB.x;
  });
}

/**
 * Encuentra el rectángulo que contiene todos los elementos dados
 * @param {Array} elements - Array de elementos
 * @returns {Object} Bounding box que contiene todos los elementos
 */
function calcularBoundingBox(elements) {
  if (!elements || elements.length === 0) return null;
  
  const rects = elements.map(el => getAbsRect(el));
  
  const minX = Math.min(...rects.map(r => r.x));
  const minY = Math.min(...rects.map(r => r.y));
  const maxX = Math.max(...rects.map(r => r.x + r.width));
  const maxY = Math.max(...rects.map(r => r.y + r.height));
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Verifica si un punto está dentro de un rectángulo
 * @param {Object} punto - {x, y}
 * @param {Object} rect - {x, y, width, height}
 * @returns {boolean}
 */
function puntoEnRectangulo(punto, rect) {
  return (
    punto.x >= rect.x &&
    punto.x <= rect.x + rect.width &&
    punto.y >= rect.y &&
    punto.y <= rect.y + rect.height
  );
}

/**
 * Calcula el área de un rectángulo
 * @param {Object} rect - {x, y, width, height}
 * @returns {number} Área en pixels cuadrados
 */
function calcularArea(rect) {
  return rect.width * rect.height;
}

// Cache para optimización de cálculos frecuentes
const rectCache = new WeakMap();

/**
 * Versión optimizada de getAbsRect con cache
 * @param {Object} node - Nodo de Figma
 * @returns {Object} Rectángulo cacheado
 */
function getAbsRectCached(node) {
  if (rectCache.has(node)) {
    return rectCache.get(node);
  }
  
  const rect = getAbsRect(node);
  rectCache.set(node, rect);
  return rect;
}

/**
 * Limpia el cache de rectángulos
 */
function clearRectCache() {
  rectCache.clear();
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getAbsRect,
    getAbsRectCached,
    clearRectCache,
    estaDentro,
    calcularDistancia,
    calcularDistanciaEntreRectangulos,
    calcularSolapamientoDeAreas,
    getInputVisualRect,
    estanAlineadosHorizontalmente,
    estanAlineadosVerticalmente,
    calcularCentro,
    ordenarPorPosicionVertical,
    ordenarPorPosicionHorizontal,
    calcularBoundingBox,
    puntoEnRectangulo,
    calcularArea
  };
} else {
  // Para uso en navegador/Figma
  window.GeometryUtils = {
    getAbsRect,
    getAbsRectCached,
    clearRectCache,
    estaDentro,
    calcularDistancia,
    calcularDistanciaEntreRectangulos,
    calcularSolapamientoDeAreas,
    getInputVisualRect,
    estanAlineadosHorizontalmente,
    estanAlineadosVerticalmente,
    calcularCentro,
    ordenarPorPosicionVertical,
    ordenarPorPosicionHorizontal,
    calcularBoundingBox,
    puntoEnRectangulo,
    calcularArea
  };
}
