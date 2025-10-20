/**
 * Módulo de análisis semántico y procesamiento de lenguaje natural
 * Implementado según especificaciones del Capítulo 5, Sección 5.5.1
 */

/**
 * Normaliza texto para comparaciones semánticas
 * @param {string} s - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizarTexto(s) {
  if (!s) return '';
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Encuentra texto asociado a un input mediante análisis de proximidad
 * @param {Object} nodoInput - Nodo input de Figma
 * @returns {string|null} Texto asociado normalizado
 */
function encontrarTextoAsociado(nodoInput) {
  const rectInput = getAbsRect(nodoInput);
  const padre = nodoInput.parent;
  
  // 1) Buscar hermanos
  if (padre && 'children' in padre) {
    for (const hermano of padre.children) {
      if (hermano.type === 'TEXT') {
        const r = getAbsRect(hermano);
        const esPlaceholder = estaDentro(r, rectInput);
        const esEtiquetaIzq = Math.abs((r.x + r.width) - rectInput.x) < 16 && Math.abs(r.y - rectInput.y) < 12;
        const esEtiquetaArr = Math.abs(r.x - rectInput.x) < 12 && Math.abs((r.y + r.height) - rectInput.y) < 16;
        
        if (esPlaceholder || esEtiquetaIzq || esEtiquetaArr) {
          return normalizarTexto(hermano.characters);
        }
      }
    }
  }
  
  // 2) Buscar texto cercano en la página (fallback)
  const radios = 80; // px
  const textos = figma.currentPage.findAllWithCriteria({ types: ['TEXT'] });
  let mejor = null;
  let mejorDist = Infinity;
  
  for (const t of textos) {
    const tr = getAbsRect(t);
    const dx = Math.max(0, Math.max(rectInput.x - (tr.x + tr.width), tr.x - (rectInput.x + rectInput.width)));
    const dy = Math.max(0, Math.max(rectInput.y - (tr.y + tr.height), tr.y - (rectInput.y + rectInput.height)));
    const dist = Math.hypot(dx, dy);
    const arribaOizq = (tr.y + tr.height) <= (rectInput.y + 4) || (tr.x + tr.width) <= (rectInput.x + 4);
    
    if (dist <= radios && arribaOizq && dist < mejorDist) {
      mejor = t; 
      mejorDist = dist;
    }
  }
  
  return mejor ? normalizarTexto(mejor.characters) : null;
}

/**
 * Identifica tipo de dato basado en análisis semántico del texto
 * @param {string} texto - Texto a analizar
 * @returns {Object|null} Definición del tipo de dato identificado
 */
function identificarTipoDeDato(texto) {
  const all = getAllDataTypes();
  
  for (const tipo in all) {
    const def = all[tipo];
    if (Array.isArray(def.keywords) && def.keywords.some(function(pal){ 
      return texto.includes(normalizarTexto(pal)); 
    })) {
      return def;
    }
  }
  
  return null;
}

/**
 * Analiza nombre de elemento para determinar si es un input
 * @param {string} nombre - Nombre del elemento
 * @returns {number} Puntuación de confianza (0-3)
 */
function analizarNombreParaInput(nombre) {
  const nombreNorm = normalizarTexto(nombre);
  let score = 0;
  
  // Palabras que sugieren inputs
  const keywordsInput = [
    'input', 'field', 'textbox', 'texto',
    'email', 'password', 'nombre', 'apellido',
    'telefono', 'direccion', 'fecha', 'hora'
  ];
  
  // Palabras que sugieren formulario
  const keywordsForm = [
    'form', 'formulario', 'registro', 'login',
    'contacto', 'datos', 'informacion'
  ];
  
  for (const keyword of keywordsInput) {
    if (nombreNorm.includes(keyword)) {
      score += 2;
      break;
    }
  }
  
  for (const keyword of keywordsForm) {
    if (nombreNorm.includes(keyword)) {
      score += 1;
      break;
    }
  }
  
  return Math.min(score, 3);
}

/**
 * Analiza texto cercano para determinar contexto de input
 * @param {Object} nodo - Nodo a analizar
 * @returns {Object} {score: number, texto: string}
 */
function analizarTextoCercano(nodo) {
  const textoAsociado = encontrarTextoAsociado(nodo);
  
  if (!textoAsociado) {
    return { score: 0, texto: '' };
  }
  
  let score = 0;
  
  // Patrones comunes de labels de inputs
  const patronesInput = [
    'nombre', 'apellido', 'email', 'correo', 'telefono', 'celular',
    'direccion', 'ciudad', 'pais', 'codigo postal', 'fecha',
    'password', 'contraseña', 'usuario', 'comentario', 'mensaje'
  ];
  
  for (const patron of patronesInput) {
    if (textoAsociado.includes(normalizarTexto(patron))) {
      score += 2;
      break;
    }
  }
  
  // Patrones de preguntas
  if (textoAsociado.includes('?') || textoAsociado.includes('cual') || textoAsociado.includes('como')) {
    score += 1;
  }
  
  return { score: Math.min(score, 3), texto: textoAsociado };
}

/**
 * Verifica si es un campo de texto libre válido
 * @param {string} textoAsociado - Texto asociado al campo
 * @param {string} nombreNodo - Nombre del nodo
 * @returns {boolean}
 */
function esTextoLibreValido(textoAsociado, nombreNodo) {
  const CAMPOS_TEXTO_LIBRE_VALIDOS = [
    'email', 'correo', 'mail', 'e-mail',
    'nombre', 'name', 'apellido', 'surname', 'last name', 'first name',
    'telefono', 'phone', 'tel', 'celular', 'movil',
    'direccion', 'address', 'domicilio',
    'comentario', 'comment', 'mensaje', 'message', 'observaciones', 'notas', 'notes',
    'descripcion', 'description', 'detalle', 'details',
    'codigo', 'code', 'numero', 'number', 'clave', 'password', 'contraseña',
    'fecha', 'date', 'hora', 'time', 'timestamp',
    'usuario', 'user', 'username', 'login'
  ];
  
  return CAMPOS_TEXTO_LIBRE_VALIDOS.some(campo => 
    textoAsociado.includes(normalizarTexto(campo)) || 
    normalizarTexto(nombreNodo).includes(normalizarTexto(campo))
  );
}

/**
 * Busca mejor coincidencia para valores limitados
 * @param {string} textoAsociado - Texto asociado
 * @param {Object} palabrasClave - Diccionario de palabras clave
 * @returns {Object|null} {palabra: string, mensaje: string}
 */
function buscarMejorCoincidenciaValoresLimitados(textoAsociado, palabrasClave) {
  let mejorCoincidencia = null;
  let mayorLongitud = 0;
  
  for (const palabraClave in palabrasClave) {
    const palabraNorm = normalizarTexto(palabraClave);
    
    if (textoAsociado.includes(palabraNorm) && palabraNorm.length > mayorLongitud) {
      mejorCoincidencia = {
        palabra: palabraClave,
        mensaje: palabrasClave[palabraClave]
      };
      mayorLongitud = palabraNorm.length;
    }
  }
  
  return mejorCoincidencia;
}

/**
 * Verifica si una frase es un vínculo confuso
 * @param {string} texto - Texto del vínculo
 * @returns {boolean}
 */
function esVinculoConfuso(texto) {
  const FRASES_VINCULOS_CONFUSOS = [
    // ES
    'click aqui', 'haga click aqui', 'clic aqui', 'haz clic aqui',
    'ver mas', 'leer mas', 'mas informacion',
    'aqui', 'aca', 'este vinculo', 'este enlace',
    'descargar', 'bajar', 'ingresar aqui',
    // EN
    'click here', 'read more', 'learn more', 'more info', 'download'
  ];
  
  const textoNormal = normalizarTexto(texto).replace(/[:.]/g, '');
  return FRASES_VINCULOS_CONFUSOS.includes(textoNormal);
}

/**
 * Análisis adicional para vínculos genéricos
 * @param {string} texto - Texto del vínculo
 * @returns {boolean}
 */
function esVinculoGenerico(texto) {
  const textoNormal = normalizarTexto(texto).replace(/[:.]/g, '');
  const words = textoNormal.split(/\s+/).filter(Boolean);
  const genericas = ['aqui','ver','mas','more','here','click','clic','info','informacion','leer'];
  const overlap = words.filter(w => genericas.includes(w)).length;
  
  return words.length <= 2 && overlap > 0;
}

// Dependencias geométricas (estas deberían moverse a geometry.js)
function estaDentro(cajaInterna, cajaExterna) {
  if (!cajaInterna || !cajaExterna) return false;
  return (
    cajaInterna.x >= cajaExterna.x && 
    cajaInterna.y >= cajaExterna.y && 
    cajaInterna.x + cajaInterna.width <= cajaExterna.x + cajaExterna.width && 
    cajaInterna.y + cajaInterna.height <= cajaExterna.y + cajaExterna.height
  );
}

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

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizarTexto,
    encontrarTextoAsociado,
    identificarTipoDeDato,
    analizarNombreParaInput,
    analizarTextoCercano,
    esTextoLibreValido,
    buscarMejorCoincidenciaValoresLimitados,
    esVinculoConfuso,
    esVinculoGenerico,
    estaDentro,
    getAbsRect
  };
} else {
  // Para uso en navegador/Figma
  window.SemanticsUtils = {
    normalizarTexto,
    encontrarTextoAsociado,
    identificarTipoDeDato,
    analizarNombreParaInput,
    analizarTextoCercano,
    esTextoLibreValido,
    buscarMejorCoincidenciaValoresLimitados,
    esVinculoConfuso,
    esVinculoGenerico,
    estaDentro,
    getAbsRect
  };
}
