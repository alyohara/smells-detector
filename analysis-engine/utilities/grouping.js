/**
 * Módulo de algoritmos de clustering y agrupación espacial
 * Implementado según especificaciones del Capítulo 5, Sección 5.5.1
 */

/**
 * Identifica formularios por proximidad espacial de inputs
 * @param {Array} inputs - Array de inputs a analizar
 * @param {number} maxDistanciaVertical - Distancia vertical máxima para agrupar
 * @param {number} maxDesviacionHorizontal - Desviación horizontal máxima
 * @returns {Array} Array de grupos (formularios)
 */
function identificarFormulariosPorProximidad(inputs, maxDistanciaVertical = 40, maxDesviacionHorizontal = 10) {
  if (inputs.length < 2) return [];
  
  // Usar criterios más permisivos para mayor detección
  const distanciaVerticalPermisiva = Math.max(maxDistanciaVertical, 60); // Mínimo 60px
  const desviacionHorizontalPermisiva = Math.max(maxDesviacionHorizontal, 30); // Mínimo 30px
  
  // Ordenar inputs por posición vertical
  const sortedInputs = [...inputs].sort((a, b) => {
    const rectA = getInputVisualRect(a);
    const rectB = getInputVisualRect(b);
    return rectA.y - rectB.y;
  });
  
  const formularios = [];
  let formActual = [sortedInputs[0]];
  
  for (let i = 1; i < sortedInputs.length; i++) {
    const prev = sortedInputs[i - 1];
    const current = sortedInputs[i];
    const prevRect = getInputVisualRect(prev);
    const curRect = getInputVisualRect(current);
    
    const distVertical = curRect.y - (prevRect.y + prevRect.height);
    const desviacionHorizontal = Math.abs(curRect.x - prevRect.x);
    
    // Lógica de agrupación flexible
    const estanCerca = distVertical >= 0 && 
                       distVertical < distanciaVerticalPermisiva && 
                       desviacionHorizontal < desviacionHorizontalPermisiva;
    
    // También agrupar si están en el mismo contenedor padre
    const mismoContenedor = prev.parent && current.parent && prev.parent.id === current.parent.id;
    
    // Agrupar si están en contexto de formulario
    const enContextoFormulario = estaEnContextoDeFormulario(current) && estaEnContextoDeFormulario(prev);
    
    if (estanCerca || mismoContenedor || enContextoFormulario) {
      formActual.push(current);
    } else {
      if (formActual.length > 1) formularios.push(formActual);
      formActual = [current];
    }
  }
  
  if (formActual.length > 1) formularios.push(formActual);
  
  // Segunda pasada para elementos aislados que podrían formar grupos
  const inputsAislados = inputs.filter(input => 
    !formularios.some(form => form.includes(input))
  );
  const gruposAdicionales = buscarGruposAlternativos(inputsAislados);
  formularios.push(...gruposAdicionales);
  
  return formularios;
}

/**
 * Busca grupos alternativos en inputs aislados
 * @param {Array} inputsAislados - Inputs no agrupados en primera pasada
 * @returns {Array} Grupos adicionales encontrados
 */
function buscarGruposAlternativos(inputsAislados) {
  if (inputsAislados.length < 2) return [];
  
  const grupos = [];
  const yaAgrupados = new Set();
  
  for (let i = 0; i < inputsAislados.length; i++) {
    if (yaAgrupados.has(inputsAislados[i].id)) continue;
    
    const input = inputsAislados[i];
    const grupo = [input];
    yaAgrupados.add(input.id);
    
    // Buscar otros inputs que puedan formar grupo con este
    for (let j = i + 1; j < inputsAislados.length; j++) {
      if (yaAgrupados.has(inputsAislados[j].id)) continue;
      
      const otroInput = inputsAislados[j];
      
      // Criterios alternativos para agrupar
      if (deberianEstarEnMismoGrupo(input, otroInput)) {
        grupo.push(otroInput);
        yaAgrupados.add(otroInput.id);
      }
    }
    
    // Solo agregar grupos de 2 o más elementos
    if (grupo.length >= 2) {
      grupos.push(grupo);
    }
  }
  
  return grupos;
}

/**
 * Determina si dos inputs deberían estar en el mismo grupo
 * @param {Object} input1 - Primer input
 * @param {Object} input2 - Segundo input
 * @returns {boolean}
 */
function deberianEstarEnMismoGrupo(input1, input2) {
  // 1. Mismo contenedor padre
  if (input1.parent && input2.parent && input1.parent.id === input2.parent.id) {
    return true;
  }
  
  // 2. Ambos en contexto de formulario
  if (estaEnContextoDeFormulario(input1) && estaEnContextoDeFormulario(input2)) {
    return true;
  }
  
  // 3. Distancia euclidiana razonable (hasta 150px)
  const rect1 = getInputVisualRect(input1);
  const rect2 = getInputVisualRect(input2);
  const distancia = Math.hypot(rect2.x - rect1.x, rect2.y - rect1.y);
  
  if (distancia <= 150) {
    return true;
  }
  
  // 4. Misma área general de la página
  const areaOverlap = calcularSolapamientoDeAreasExpandidas(input1, input2);
  if (areaOverlap > 0.3) { // 30% de solapamiento de área
    return true;
  }
  
  return false;
}

/**
 * Calcula solapamiento de áreas expandidas (áreas de influencia)
 * @param {Object} input1 - Primer input
 * @param {Object} input2 - Segundo input
 * @returns {number} Ratio de solapamiento (0-1)
 */
function calcularSolapamientoDeAreasExpandidas(input1, input2) {
  const rect1 = getInputVisualRect(input1);
  const rect2 = getInputVisualRect(input2);
  
  // Expandir rectángulos para crear "áreas de influencia"
  const area1 = {
    x: rect1.x - 100,
    y: rect1.y - 100,
    width: rect1.width + 200,
    height: rect1.height + 200
  };
  
  const area2 = {
    x: rect2.x - 100,
    y: rect2.y - 100,
    width: rect2.width + 200,
    height: rect2.height + 200
  };
  
  // Calcular intersección
  const intersectX = Math.max(0, Math.min(area1.x + area1.width, area2.x + area2.width) - Math.max(area1.x, area2.x));
  const intersectY = Math.max(0, Math.min(area1.y + area1.height, area2.y + area2.height) - Math.max(area1.y, area2.y));
  const intersectArea = intersectX * intersectY;
  
  // Calcular unión
  const area1Size = area1.width * area1.height;
  const area2Size = area2.width * area2.height;
  const unionArea = area1Size + area2Size - intersectArea;
  
  return unionArea > 0 ? intersectArea / unionArea : 0;
}

/**
 * Verifica si un input está en contexto de formulario
 * @param {Object} input - Input a verificar
 * @returns {boolean}
 */
function estaEnContextoDeFormulario(input) {
  if (!input) return false;
  
  // Buscar en la jerarquía de padres indicios de formulario
  let current = input.parent;
  let levels = 0;
  
  while (current && levels < 5) { // Máximo 5 niveles hacia arriba
    const name = (current.name || '').toLowerCase();
    
    // Palabras clave que indican contexto de formulario
    const formKeywords = [
      'form', 'formulario', 'registro', 'sign', 'login',
      'contact', 'contacto', 'datos', 'info', 'modal',
      'dialog', 'popup', 'checkout', 'payment', 'pago'
    ];
    
    if (formKeywords.some(keyword => name.includes(keyword))) {
      return true;
    }
    
    current = current.parent;
    levels++;
  }
  
  return false;
}

/**
 * Agrupa inputs por densidad espacial usando algoritmo de clustering
 * @param {Array} inputs - Array de inputs
 * @param {number} epsilon - Radio de vecindad
 * @param {number} minPoints - Mínimo de puntos para formar cluster
 * @returns {Array} Array de clusters
 */
function agruparPorDensidad(inputs, epsilon = 100, minPoints = 2) {
  if (inputs.length < minPoints) return [];
  
  const visited = new Set();
  const clusters = [];
  
  function getVecinos(input, epsilon) {
    const rect = getInputVisualRect(input);
    const centro = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    
    return inputs.filter(otherInput => {
      if (input.id === otherInput.id) return false;
      
      const otherRect = getInputVisualRect(otherInput);
      const otherCentro = { x: otherRect.x + otherRect.width / 2, y: otherRect.y + otherRect.height / 2 };
      
      const distancia = Math.hypot(centro.x - otherCentro.x, centro.y - otherCentro.y);
      return distancia <= epsilon;
    });
  }
  
  function expandirCluster(input, vecinos, cluster, epsilon, minPoints) {
    cluster.push(input);
    visited.add(input.id);
    
    for (let i = 0; i < vecinos.length; i++) {
      const vecino = vecinos[i];
      
      if (!visited.has(vecino.id)) {
        visited.add(vecino.id);
        const vecinosDelVecino = getVecinos(vecino, epsilon);
        
        if (vecinosDelVecino.length >= minPoints) {
          vecinos.push(...vecinosDelVecino.filter(v => !vecinos.includes(v)));
        }
      }
      
      if (!clusters.some(cluster => cluster.includes(vecino))) {
        cluster.push(vecino);
      }
    }
  }
  
  for (const input of inputs) {
    if (visited.has(input.id)) continue;
    
    const vecinos = getVecinos(input, epsilon);
    
    if (vecinos.length < minPoints) {
      continue; // Punto de ruido
    }
    
    const cluster = [];
    expandirCluster(input, vecinos, cluster, epsilon, minPoints);
    
    if (cluster.length >= minPoints) {
      clusters.push(cluster);
    }
  }
  
  return clusters;
}

/**
 * Identifica patrones de layout en grupos de inputs
 * @param {Array} grupo - Grupo de inputs
 * @returns {Object} Información del patrón detectado
 */
function identificarPatronDeLayout(grupo) {
  if (!grupo || grupo.length < 2) return { pattern: 'single', confidence: 0 };
  
  const rects = grupo.map(input => getInputVisualRect(input));
  
  // Analizar alineación vertical (columna)
  const alineacionVertical = analizarAlineacionVertical(rects);
  
  // Analizar alineación horizontal (fila)
  const alineacionHorizontal = analizarAlineacionHorizontal(rects);
  
  // Analizar distribución en grilla
  const patronGrilla = analizarPatronGrilla(rects);
  
  // Determinar el patrón más probable
  if (patronGrilla.confidence > 0.7) {
    return { pattern: 'grid', confidence: patronGrilla.confidence, details: patronGrilla };
  } else if (alineacionVertical.confidence > alineacionHorizontal.confidence) {
    return { pattern: 'column', confidence: alineacionVertical.confidence, details: alineacionVertical };
  } else if (alineacionHorizontal.confidence > 0.5) {
    return { pattern: 'row', confidence: alineacionHorizontal.confidence, details: alineacionHorizontal };
  } else {
    return { pattern: 'scattered', confidence: 0.3 };
  }
}

/**
 * Analiza alineación vertical de un grupo de rectángulos
 * @param {Array} rects - Array de rectángulos
 * @returns {Object} Análisis de alineación vertical
 */
function analizarAlineacionVertical(rects) {
  if (rects.length < 2) return { confidence: 0 };
  
  const xPositions = rects.map(r => r.x);
  const avgX = xPositions.reduce((sum, x) => sum + x, 0) / xPositions.length;
  const maxDeviation = Math.max(...xPositions.map(x => Math.abs(x - avgX)));
  
  // Confianza inversamente proporcional a la desviación
  const confidence = Math.max(0, 1 - (maxDeviation / 50)); // 50px de tolerancia
  
  return {
    confidence,
    averageX: avgX,
    maxDeviation,
    alignment: 'vertical'
  };
}

/**
 * Analiza alineación horizontal de un grupo de rectángulos
 * @param {Array} rects - Array de rectángulos
 * @returns {Object} Análisis de alineación horizontal
 */
function analizarAlineacionHorizontal(rects) {
  if (rects.length < 2) return { confidence: 0 };
  
  const yPositions = rects.map(r => r.y);
  const avgY = yPositions.reduce((sum, y) => sum + y, 0) / yPositions.length;
  const maxDeviation = Math.max(...yPositions.map(y => Math.abs(y - avgY)));
  
  // Confianza inversamente proporcional a la desviación
  const confidence = Math.max(0, 1 - (maxDeviation / 30)); // 30px de tolerancia
  
  return {
    confidence,
    averageY: avgY,
    maxDeviation,
    alignment: 'horizontal'
  };
}

/**
 * Analiza si el grupo sigue un patrón de grilla
 * @param {Array} rects - Array de rectángulos
 * @returns {Object} Análisis de patrón de grilla
 */
function analizarPatronGrilla(rects) {
  if (rects.length < 4) return { confidence: 0 };
  
  // Detectar número de columnas y filas
  const xPositions = [...new Set(rects.map(r => Math.round(r.x / 10) * 10))].sort((a, b) => a - b);
  const yPositions = [...new Set(rects.map(r => Math.round(r.y / 10) * 10))].sort((a, b) => a - b);
  
  const cols = xPositions.length;
  const rows = yPositions.length;
  
  // Verificar si la distribución es regular
  const expectedItems = cols * rows;
  const actualItems = rects.length;
  
  const fillRatio = actualItems / expectedItems;
  
  // Confianza basada en qué tan completa está la grilla
  const confidence = fillRatio > 0.7 ? fillRatio * 0.8 : 0;
  
  return {
    confidence,
    columns: cols,
    rows: rows,
    fillRatio,
    pattern: 'grid'
  };
}

// Funciones auxiliares que se necesitan (simplificadas)
function getInputVisualRect(node) {
  // Esta función debería estar en geometry.js
  if (typeof window !== 'undefined' && window.GeometryUtils) {
    return window.GeometryUtils.getInputVisualRect(node);
  }
  // Fallback básico
  return { x: node.x || 0, y: node.y || 0, width: node.width || 0, height: node.height || 0 };
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    identificarFormulariosPorProximidad,
    buscarGruposAlternativos,
    deberianEstarEnMismoGrupo,
    calcularSolapamientoDeAreasExpandidas,
    estaEnContextoDeFormulario,
    agruparPorDensidad,
    identificarPatronDeLayout,
    analizarAlineacionVertical,
    analizarAlineacionHorizontal,
    analizarPatronGrilla
  };
} else {
  // Para uso en navegador/Figma
  window.GroupingUtils = {
    identificarFormulariosPorProximidad,
    buscarGruposAlternativos,
    deberianEstarEnMismoGrupo,
    calcularSolapamientoDeAreasExpandidas,
    estaEnContextoDeFormulario,
    agruparPorDensidad,
    identificarPatronDeLayout,
    analizarAlineacionVertical,
    analizarAlineacionHorizontal,
    analizarPatronGrilla
  };
}
