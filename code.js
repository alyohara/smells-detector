// =================================================================================
// CONFIGURACIÓN DE TIPOS DE DATOS Y HEURÍSTICAS
// =================================================================================
const TIPO_DE_DATOS = {
  FECHA: {
    keywords: ['fecha', 'date', 'nacimiento', 'vencimiento', 'caducidad'],
    minWidth: 100, maxWidth: 150,
    mensaje: 'Ancho no ideal para una Fecha.',
    requiresComponent: true,
    componentSmellMessage: 'Este campo de fecha es de texto libre.'
  },
  TELEFONO: {
    keywords: ['teléfono', 'phone', 'celular', 'móvil'],
    minWidth: 120, maxWidth: 200,
    mensaje: 'Ancho parece incorrecto para un Teléfono.',
    requiresComponent: true,
    componentSmellMessage: 'Este campo de teléfono es de texto libre.'
  },
  CODIGO_POSTAL: {
    keywords: ['código postal', 'cp', 'zip', 'postal code'],
    minWidth: 70, maxWidth: 120,
    mensaje: 'Ancho no ideal para un Código Postal.',
    requiresComponent: false
  },
  EMAIL: {
    keywords: ['email', 'correo electrónico', 'e-mail'],
    minWidth: 200, maxWidth: 350,
    mensaje: 'Ancho podría ser muy corto para un Email.',
    requiresComponent: false
  },
  NOMBRE_CORTO: {
    keywords: ['nombre', 'first name', 'apellido'],
    minWidth: 150, maxWidth: 250,
    mensaje: 'Ancho inadecuado para un Nombre o Apellido.',
    requiresComponent: false
  },
};

const FRASES_VINCULOS_CONFUSOS = [
    // ES
    'click aqui', 'haga click aqui', 'clic aqui', 'haz clic aqui',
    'ver mas', 'leer mas', 'mas informacion',
    'aqui', 'aca', 'este vinculo', 'este enlace',
    'descargar', 'bajar', 'ingresar aqui',
    // EN
    'click here', 'read more', 'learn more', 'more info', 'download'
];

const PALABRAS_CLAVE_LIMITED_VALUES = {
    'país': 'Considera usar un selector o un campo con autocompletado para este conjunto de valores limitado.',
    'paises': 'Considera usar un selector o un campo con autocompletado para este conjunto de valores limitado.',
    'ciudad': 'Considera usar un selector o un campo con autocompletado para este conjunto de valores limitado.',
    'ciudades': 'Considera usar un selector o un campo con autocompletado para este conjunto de valores limitado.',
    'provincia': 'Considera usar un selector para este conjunto de valores limitado.',
    'estado': 'Considera usar un selector para este conjunto de valores limitado.',
    'género': 'Considera usar radio buttons o un selector para este conjunto de valores limitado.',
    'sexo': 'Considera usar radio buttons o un selector para este conjunto de valores limitado.',
    'categoría': 'Considera usar un selector o radio buttons para este conjunto de valores limitado.',
    'categoria': 'Considera usar un selector o radio buttons para este conjunto de valores limitado.',
    'sucursal': 'Considera usar un selector para este conjunto de valores limitado.',
    'tipo de documento': 'Considera usar un selector para este conjunto de valores limitado.'
};

// Campos que NO deben considerarse de valores limitados (son texto libre válido)
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

const PALABRAS_CLAVE_DATOS_SENSIBLES = [
    'dni', 'documento', 'cuit', 'cuil', 'ssn', 'contraseña', 'password', 'clave'
];
// Ajustes configurables (se pueden sobrescribir por UI)
const DEFAULT_SETTINGS = {
    UMBRAL_CAMPOS_FORMULARIO: 8,
    MAX_DISTANCIA_VERTICAL: 40,
    MAX_DESVIACION_HORIZONTAL: 10,
    MAX_PASOS_FLOW: 30,
};
let SETTINGS = Object.assign({}, DEFAULT_SETTINGS);
const IGNORE_TYPES = ['SEMANTIC','CONSISTENCY','FORMAT','LINK','LIMITED_VALUES','SENSITIVE','COMPLEXITY'];

// Presets por industria
const INDUSTRY_PRESETS = {
  ecommerce: {
    UMBRAL_CAMPOS_FORMULARIO: 6,
    MAX_DISTANCIA_VERTICAL: 50,
    MAX_DESVIACION_HORIZONTAL: 15,
    MAX_PASOS_FLOW: 25,
    name: 'E-commerce'
  },
  banking: {
    UMBRAL_CAMPOS_FORMULARIO: 5,
    MAX_DISTANCIA_VERTICAL: 30,
    MAX_DESVIACION_HORIZONTAL: 8,
    MAX_PASOS_FLOW: 20,
    name: 'Banking & Fintech'
  },
  healthcare: {
    UMBRAL_CAMPOS_FORMULARIO: 7,
    MAX_DISTANCIA_VERTICAL: 35,
    MAX_DESVIACION_HORIZONTAL: 10,
    MAX_PASOS_FLOW: 15,
    name: 'Healthcare'
  },
  general: {
    UMBRAL_CAMPOS_FORMULARIO: 8,
    MAX_DISTANCIA_VERTICAL: 40,
    MAX_DESVIACION_HORIZONTAL: 10,
    MAX_PASOS_FLOW: 30,
    name: 'General'
  }
};
// Tipos de datos personalizados (persistidos)
let CUSTOM_DATA_TYPES = {};

// Cargar tipos personalizados al iniciar
(async function(){
    try {
        const stored = await figma.clientStorage.getAsync('ux-data-types');
        if (stored && typeof stored === 'object') {
            CUSTOM_DATA_TYPES = stored;
        }
    } catch(_) {}
})();

function getAllDataTypes() {
    // Unir defaults + personalizados, los personalizados sobreescriben por nombre
    const merged = {};
    // Defaults
    for (const k in TIPO_DE_DATOS) merged[k] = TIPO_DE_DATOS[k];
    // Custom
    for (const k in CUSTOM_DATA_TYPES) merged[k] = CUSTOM_DATA_TYPES[k];
    return merged;
}


// =================================================================================
// LÓGICA PRINCIPAL Y GESTIÓN DE LA INTERFAZ
// =================================================================================
figma.showUI(__html__, { width: 360, height: 600 });
// Restaurar tamaño previo de la UI si existe
(async function(){
    try {
        const saved = await figma.clientStorage.getAsync('ui-size');
        if (saved && typeof saved.w === 'number' && typeof saved.h === 'number') {
            figma.ui.resize(saved.w, saved.h);
        }
    } catch(_) {}
})();

figma.ui.onmessage = async (msg) => {
    let issues = [];
    const analysisType = msg.type;
    const scope = msg.scope || 'page'; // 'page' | 'selection'

    // Selección de capas (incluye soporte multi-id)
    if (analysisType === 'select-layer') {
        if (msg.ids && Array.isArray(msg.ids) && msg.ids.length > 0) {
            const nodes = [];
            for (let i = 0; i < msg.ids.length; i++) {
                const n = figma.getNodeById(msg.ids[i]);
                if (n) nodes.push(n);
            }
            if (nodes.length > 0) {
                figma.currentPage.selection = nodes;
                figma.viewport.scrollAndZoomIntoView(nodes);
                return;
            }
        }
        const nodeId = msg.parentId || msg.id;
        const nodo = figma.getNodeById(nodeId);
        if (nodo) {
            figma.currentPage.selection = [nodo];
            figma.viewport.scrollAndZoomIntoView([nodo]);
        }
        return;
    }

    // Settings & Presets
    if (analysisType === 'get-settings') {
        const presets = await figma.clientStorage.getAsync('ux-presets') || {};
        figma.ui.postMessage({ type: 'settings', settings: SETTINGS, presets: Object.keys(presets) });
        return;
    }
    if (analysisType === 'apply-settings') {
        const s = msg.settings || {};
        SETTINGS = Object.assign({}, SETTINGS, s);
        figma.notify('Ajustes aplicados');
        return;
    }
        if (analysisType === 'get-data-types') {
            // Devolver lista simple
            const list = [];
            for (const k in CUSTOM_DATA_TYPES) list.push({ name: k, def: CUSTOM_DATA_TYPES[k] });
            figma.ui.postMessage({ type: 'data-types', items: list });
            return;
        }
        if (analysisType === 'upsert-data-type') {
            const item = msg.item || {};
            const name = (item.name || '').trim();
            if (!name) { figma.notify('Nombre de tipo requerido'); return; }
            const def = {
                keywords: Array.isArray(item.keywords) ? item.keywords : [],
                minWidth: parseInt(item.minWidth, 10) || 0,
                maxWidth: parseInt(item.maxWidth, 10) || 0,
                mensaje: item.mensaje || 'Ancho no ideal para este tipo de dato.',
                requiresComponent: !!item.requiresComponent,
                componentSmellMessage: item.componentSmellMessage || 'Este campo requiere un componente específico.',
                suggestion: item.suggestion || ''
            };
            CUSTOM_DATA_TYPES[name] = def;
            await figma.clientStorage.setAsync('ux-data-types', CUSTOM_DATA_TYPES);
            const list = [];
            for (const k in CUSTOM_DATA_TYPES) list.push({ name: k, def: CUSTOM_DATA_TYPES[k] });
            figma.ui.postMessage({ type: 'data-types', items: list });
            figma.notify('Tipo de dato guardado');
            return;
        }
        if (analysisType === 'delete-data-type') {
            const name = (msg.name || '').trim();
            if (name && CUSTOM_DATA_TYPES[name]) {
                delete CUSTOM_DATA_TYPES[name];
                await figma.clientStorage.setAsync('ux-data-types', CUSTOM_DATA_TYPES);
                const list = [];
                for (const k in CUSTOM_DATA_TYPES) list.push({ name: k, def: CUSTOM_DATA_TYPES[k] });
                figma.ui.postMessage({ type: 'data-types', items: list });
                figma.notify('Tipo de dato eliminado');
            }
            return;
        }
        if (analysisType === 'resize-ui') {
            const w = Math.max(320, Math.min(1600, parseInt(msg.width, 10) || 0));
            const h = Math.max(260, Math.min(1200, parseInt(msg.height, 10) || 0));
            figma.ui.resize(w, h);
            await figma.clientStorage.setAsync('ui-size', { w: w, h: h });
            return;
        }
        if (analysisType === 'reset-defaults') {
            // Restaurar settings por defecto
            SETTINGS = Object.assign({}, DEFAULT_SETTINGS);
            // Limpiar flags de ignorados en toda la página actual
            const all = figma.currentPage.findAll(() => true);
            for (let i = 0; i < all.length; i++) {
                const n = all[i];
                if ('setPluginData' in n) {
                    for (let j = 0; j < IGNORE_TYPES.length; j++) {
                        n.setPluginData('ux-ignored-' + IGNORE_TYPES[j], '');
                    }
                }
            }
            const presets = await figma.clientStorage.getAsync('ux-presets') || {};
            figma.ui.postMessage({ type: 'settings', settings: SETTINGS, presets: Object.keys(presets) });
            figma.notify('Restablecido a valores por defecto');
            return;
        }
    if (analysisType === 'save-preset') {
        const name = (msg.name || '').trim();
        if (!name) { figma.notify('Nombre de preset requerido'); return; }
        const presets = await figma.clientStorage.getAsync('ux-presets') || {};
        presets[name] = SETTINGS;
        await figma.clientStorage.setAsync('ux-presets', presets);
        figma.ui.postMessage({ type: 'presets-saved', presets: Object.keys(presets) });
        figma.notify('Preset guardado');
        return;
    }
    if (analysisType === 'load-preset') {
        const name = msg.name;
        const presets = await figma.clientStorage.getAsync('ux-presets') || {};
        const preset = presets[name];
        if (preset) {
            SETTINGS = Object.assign({}, SETTINGS, preset);
            figma.ui.postMessage({ type: 'settings', settings: SETTINGS, presets: Object.keys(presets) });
            figma.notify('Preset cargado');
        } else {
            figma.notify('Preset no encontrado');
        }
        return;
    }

    // Confirmar como input
    if (analysisType === 'confirm-as-input') {
        const ids = Array.isArray(msg.ids) ? msg.ids : (msg.id ? [msg.id] : []);
        for (let i = 0; i < ids.length; i++) {
            const n = figma.getNodeById(ids[i]);
            if (n && 'setPluginData' in n) {
                n.setPluginData('ux-confirmed-input', '1');
            }
        }
        figma.notify('Confirmado como input');
        return;
    }
    
    // Ignorar como candidato a input
    if (analysisType === 'ignore-as-input') {
        const ids = Array.isArray(msg.ids) ? msg.ids : (msg.id ? [msg.id] : []);
        for (let i = 0; i < ids.length; i++) {
            const n = figma.getNodeById(ids[i]);
            if (n && 'setPluginData' in n) {
                n.setPluginData('ux-ignored-input', '1');
            }
        }
        figma.notify('Ignorado como candidato a input');
        return;
    }

    // Ignore / Restore
    if (analysisType === 'ignore-issue') {
        const typeKey = msg.issueType;
        const ids = Array.isArray(msg.ids) ? msg.ids : (msg.id ? [msg.id] : []);
        for (let i = 0; i < ids.length; i++) {
            const n = figma.getNodeById(ids[i]);
            if (n && 'setPluginData' in n) n.setPluginData('ux-ignored-' + typeKey, '1');
        }
        figma.notify('Ignorado');
        return;
    }
    if (analysisType === 'restore-issue') {
        const typeKey = msg.issueType;
        const ids = Array.isArray(msg.ids) ? msg.ids : (msg.id ? [msg.id] : []);
        for (let i = 0; i < ids.length; i++) {
            const n = figma.getNodeById(ids[i]);
            if (n && 'setPluginData' in n) n.setPluginData('ux-ignored-' + typeKey, '');
        }
        figma.notify('Restaurado');
        return;
    }

    // Análisis completos o específicos - SISTEMA MODULAR INTEGRADO
    
    // Verificar si el análisis es de tipo reconocido
    const analysisTypes = [
        'analyze-complete', 'analyze-size', 'analyze-consistency', 'analyze-format',
        'analyze-links', 'analyze-limited-values', 'analyze-complexity', 'analyze-flows',
        'detect-potential-inputs'
    ];
    
    if (analysisTypes.includes(analysisType)) {
        console.log(`🚀 Iniciando análisis: ${analysisType}...`);
        figma.notify(`Ejecutando ${analysisType}...`);
        
        try {
            // Timeout de 30 segundos
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout: Análisis tardó más de 30s')), 30000)
            );
            
            // NUEVO: Intentar usar sistema modular primero
            let analysisResult;
            
            if (typeof window !== 'undefined' && window.ModularSystem) {
                console.log('🔧 Usando sistema modular...');
                analysisResult = window.ModularSystem.runAnalysis(analysisType, scope);
            } else {
                console.log('🔄 Sistema modular no disponible, usando legacy...');
                analysisResult = runLegacyAnalysisFunction(analysisType, scope);
            }
            
            issues = await Promise.race([
                analysisResult,
                timeoutPromise
            ]);
            
            // Validar que issues sea un array
            if (!Array.isArray(issues)) {
                console.warn('⚠️ Resultado de análisis no es array, convirtiendo...');
                issues = [];
            }
            
            figma.notify(`✅ ${analysisType}: ${issues.length} issues encontrados`);
            
        } catch (error) {
            console.error(`❌ Error en ${analysisType}:`, error);
            figma.notify('❌ Error en análisis: ' + error.message);
            issues = []; // Retornar array vacío en caso de error
        }
    }
    figma.ui.postMessage({ type: 'render-issues', issues });
};

// =================================================================================
// FUNCIÓN DE FALLBACK PARA SISTEMA LEGACY
// =================================================================================

async function runLegacyAnalysisFunction(analysisType, scope) {
    const analysisFunctions = {
        'analyze-size': (s) => analizarTamanoDeInputs(s),
        'analyze-consistency': (s) => analizarConsistenciaGlobal(s),
        'analyze-format': (s) => analizarCamposSinFormato(s),
        'analyze-links': (s) => analizarVinculosConfusos(s),
        'analyze-limited-values': (s) => analizarValoresLimitados(s),
        'analyze-complexity': (s) => analizarComplejidadDeFormularios(s),
        'analyze-flows': () => visualizarFlujosDePrototipo(),
        'analyze-complete': (s) => analizarCompletoMejorado(s),
        'detect-potential-inputs': (s) => detectarCandidatosInputs(s)
    };
    
    const analysisFunction = analysisFunctions[analysisType];
    if (analysisFunction) {
        if (analysisType === 'analyze-flows') {
            return await analysisFunction();
        } else {
            return await analysisFunction(scope);
        }
    } else {
        console.error(`❌ Función de análisis no encontrada: ${analysisType}`);
        return [];
    }
}


// =================================================================================
// FUNCIONES DE ANÁLISIS Y VISUALIZACIÓN (SISTEMA LEGACY)
// =================================================================================

async function analizarTamanoDeInputs(scope = 'page') {
  let problemas = [];
  const inputs = obtenerInputs(scope);
  for (const nodo of inputs) {
    const textoAsociado = encontrarTextoAsociado(nodo);
    if (!textoAsociado) continue;
    const tipoDeDato = identificarTipoDeDato(textoAsociado);
    if (!tipoDeDato) continue;

    const anchoActual = Math.round(nodo.width);
    const { minWidth, maxWidth, mensaje } = tipoDeDato;
    if ((anchoActual < minWidth || anchoActual > maxWidth) && !isIgnored(nodo, 'SEMANTIC')) {
      problemas.push({
        id: nodo.id, name: `${nodo.name} (${anchoActual}px)`, issue: mensaje,
        type: 'SEMANTIC', severity: 'medium', suggestion: (tipoDeDato.suggestion && tipoDeDato.suggestion.length) ? tipoDeDato.suggestion : `Sugerido: ${minWidth}px - ${maxWidth}px`
      });
    }
  }
  return withFrameInfo(problemas);
}

async function analizarConsistenciaGlobal(scope = 'page') {
  let problemas = [];
  const inputs = obtenerInputs(scope);
  console.log(`🔍 Analizando consistencia global: ${inputs.length} inputs encontrados`);
  
  const formularios = identificarFormulariosPorProximidad(inputs);
  console.log(`📋 Formularios detectados por proximidad: ${formularios.length}`);
  
  for (const form of formularios) {
    console.log(`📝 Analizando formulario con ${form.length} inputs:`, form.map(f => f.name));
    const problemaConsistencia = analizarConsistenciaDeGrupo(form);
    if (problemaConsistencia) {
      // Filtrar si todos los ids están ignorados
      const allIgnored = (problemaConsistencia.relatedIds || []).every(id => isIgnoredById(id, 'CONSISTENCY'));
      if (!allIgnored) {
        console.log(`✅ Issue de consistencia agregado:`, problemaConsistencia.name);
        problemas.push(problemaConsistencia);
      } else {
        console.log(`⚠️ Issue de consistencia ignorado:`, problemaConsistencia.name);
      }
    } else {
      console.log(`✅ Formulario consistente (sin issues)`);
    }
  }
  
  console.log(`📊 Total issues de consistencia: ${problemas.length}`);
  return withFrameInfo(problemas);
}

async function analizarCamposSinFormato(scope = 'page') {
    let problemas = [];
    const inputs = obtenerInputs(scope);
    for (const nodo of inputs) {
        const textoAsociado = encontrarTextoAsociado(nodo);
        if (!textoAsociado) continue;
        const tipoDeDato = identificarTipoDeDato(textoAsociado);
        if (!tipoDeDato) continue;

        const { requiresComponent, componentSmellMessage } = tipoDeDato;
        if (requiresComponent && !esParteDeInstancia(nodo) && !isIgnored(nodo, 'FORMAT')) {
            problemas.push({
                id: nodo.id, name: nodo.name, issue: componentSmellMessage,
                type: 'FORMAT', severity: 'high', suggestion: 'Considera usar un componente específico (ej: calendario).'
            });
        }
    }
    return withFrameInfo(problemas);
}

async function analizarVinculosConfusos(scope = 'page') {
    let problemas = [];
    const textNodes = obtenerTextos(scope);

    for (const nodo of textNodes) {
        if (typeof nodo.hyperlink === 'object' && nodo.hyperlink !== null && nodo.hyperlink.type === 'URL') {
            const textoNormal = normalizarTexto(nodo.characters).replace(/[:.]/g, '');
        if (FRASES_VINCULOS_CONFUSOS.includes(textoNormal) && !isIgnored(nodo, 'LINK')) {
                problemas.push({
                    id: nodo.id,
                    name: `Vínculo: "${nodo.characters}"`,
                    issue: 'El texto del vínculo es genérico y no describe su destino.',
                    type: 'LINK', severity: 'medium',
                    suggestion: 'Usa un texto que describa claramente a dónde lleva el link. Ej: "Ver reporte anual 2025".'
                });
                continue;
            }
            // Heurística adicional: texto muy corto o genérico
            const words = textoNormal.split(/\s+/).filter(Boolean);
            const genericas = ['aqui','ver','mas','more','here','click','clic','info','informacion','leer'];
            const overlap = words.filter(w => genericas.includes(w)).length;
        if (words.length <= 2 && overlap > 0 && !isIgnored(nodo, 'LINK')) {
                problemas.push({
                    id: nodo.id,
                    name: `Vínculo: "${nodo.characters}"`,
                    issue: 'El texto del vínculo podría ser más descriptivo.',
                    type: 'LINK', severity: 'low',
                    suggestion: 'Redacta el vínculo con el destino o la acción específica.'
                });
            }
        }
    }
    return withFrameInfo(problemas);
}

async function analizarValoresLimitados(scope = 'page') {
    let problemas = [];
    const inputs = obtenerInputs(scope);

    for (const nodo of inputs) {
        const textoAsociado = encontrarTextoAsociado(nodo);
        if (!textoAsociado) continue;

        // NUEVO: Verificar si es un campo de texto libre válido (no debe ser detectado)
        const esTextoLibreValido = CAMPOS_TEXTO_LIBRE_VALIDOS.some(campo => 
            textoAsociado.includes(normalizarTexto(campo)) || 
            normalizarTexto(nodo.name).includes(normalizarTexto(campo))
        );
        
        if (esTextoLibreValido) {
            continue; // Saltar campos que son válidos como texto libre
        }

        // Buscar tanto en el texto asociado directamente como en patrones alternativos
        let mejorCoincidencia = null;

        for (const palabraClave in PALABRAS_CLAVE_LIMITED_VALUES) {
            const claveNorm = normalizarTexto(palabraClave);
            let encontrado = false;
            let contextoEncontrado = '';
            let prioridad = 0;
            
            // 1) Búsqueda original en texto asociado (alta prioridad)
            if (textoAsociado.includes(claveNorm)) {
                encontrado = true;
                contextoEncontrado = `Etiqueta: ${palabraClave}`;
                prioridad = 3;
            }
            
            // 2) Búsqueda extendida en rectángulos con etiquetas cercanas (baja prioridad)
            if (!encontrado) {
                const resultadoBusqueda = buscarPatronEnRectangulosConEtiquetas(nodo, palabraClave);
                if (resultadoBusqueda.encontrado) {
                    encontrado = true;
                    contextoEncontrado = resultadoBusqueda.contexto;
                    prioridad = 1;
                }
            }
            
            // Guardar la mejor coincidencia (mayor prioridad)
            if (encontrado && (!mejorCoincidencia || prioridad > mejorCoincidencia.prioridad)) {
                mejorCoincidencia = {
                    palabraClave,
                    contextoEncontrado,
                    prioridad
                };
            }
        }
        
        // Usar solo la mejor coincidencia
        if (mejorCoincidencia) {
                if (!esParteDeInstancia(nodo) && !isIgnored(nodo, 'LIMITED_VALUES')) {
                    problemas.push({
                        id: nodo.id,
                    name: `Campo: "${nodo.name}" (${mejorCoincidencia.contextoEncontrado})`,
                        issue: 'Campo de texto libre usado para un conjunto de valores limitado.',
                        type: 'LIMITED_VALUES', severity: 'medium',
                    suggestion: PALABRAS_CLAVE_LIMITED_VALUES[mejorCoincidencia.palabraClave]
                    });
            }
        }
    }
    return withFrameInfo(problemas);
}

async function analizarComplejidadDeFormularios(scope = 'page') {
    let problemas = [];
    const inputs = obtenerInputs(scope);
    const formularios = identificarFormulariosPorProximidad(inputs);

    for (const form of formularios) {
        // Contar datos sensibles en el grupo
        let sensiblesEnGrupo = 0;
        for (const inputNode of form) {
            const textoAsociado = encontrarTextoAsociado(inputNode);
            if (textoAsociado) {
                for (const palabraSensible of PALABRAS_CLAVE_DATOS_SENSIBLES) {
                    if (textoAsociado.includes(normalizarTexto(palabraSensible)) && !isIgnored(inputNode, 'SENSITIVE')) {
                        problemas.push({
                            id: inputNode.id,
                            name: `Campo: "${inputNode.name}"`,
                            issue: `Se solicita un dato potencialmente sensible ("${palabraSensible}").`,
                            type: 'SENSITIVE',
                            severity: 'high',
                            suggestion: 'Asegúrate de que sea estrictamente necesario y comunica por qué se pide y cómo se protege.'
                        });
                        sensiblesEnGrupo++;
                    }
                }
            }
        }

        if (form.length > SETTINGS.UMBRAL_CAMPOS_FORMULARIO) {
            problemas.push({
                id: form[0].parent.id,
                name: `Formulario: "${form[0].parent.name}"`,
                issue: `Formulario con ${form.length} campos.`,
                type: 'COMPLEXITY',
                severity: 'medium',
                suggestion: `Umbral: ${SETTINGS.UMBRAL_CAMPOS_FORMULARIO}. Considera dividir en pasos o eliminar campos no esenciales.`,
                relatedIds: form.map(n => n.id),
                fieldsCount: form.length,
                sensitiveCount: sensiblesEnGrupo
            });
        }
    }
    return withFrameInfo(problemas);
}

async function visualizarFlujosDePrototipo() {
    const flujos = [];
    const nodosConReacciones = figma.currentPage.findAll(n => Array.isArray(n.reactions) && n.reactions.length > 0);
    const destinos = new Set();
    for (const n of nodosConReacciones) {
        for (const r of n.reactions) {
            const destId = r.action && r.action.destinationId;
            if (destId) destinos.add(destId);
        }
    }
    const nodosDeInicio = nodosConReacciones.filter(n => !destinos.has(n.id));
    if (nodosDeInicio.length === 0 && nodosConReacciones.length > 0) nodosDeInicio.push(nodosConReacciones[0]);

    let flowCount = 1;
    const MAX_PASOS = SETTINGS.MAX_PASOS_FLOW;
    for (const inicio of nodosDeInicio) {
        // BFS por ramas
        const visitados = new Set();
        const queue = [{ node: inicio, path: [`<b>${inicio.name}</b>`], pathNodes: [inicio], steps: 1 }];
        let mejoresRamas = [];
        while (queue.length > 0) {
            const { node, path, pathNodes, steps } = queue.shift();
            if (!node || visitados.has(node.id) || steps > MAX_PASOS) continue;
            visitados.add(node.id);
            const reactions = Array.isArray(node.reactions) ? node.reactions : [];
            const salidas = reactions.map(r => r.action && r.action.destinationId).filter(Boolean);
            if (salidas.length === 0) {
                mejoresRamas.push({ steps, path, pathNodes });
                continue;
            }
            for (const destId of salidas) {
                const dest = figma.getNodeById(destId);
                if (dest) {
                    queue.push({ node: dest, path: [...path, dest.name], pathNodes: [...pathNodes, dest], steps: steps + 1 });
                }
            }
        }
        // Elegir la rama más larga para el resumen
        mejoresRamas.sort((a,b)=>b.steps-a.steps);
        const mejor = mejoresRamas[0] || { steps: 1, path: [`<b>${inicio.name}</b>`], pathNodes: [inicio] };
        const pathString = mejor.path.join(' → ');
        flujos.push({ id: inicio.id, name: `Flujo ${flowCount}`, path: pathString, type: 'FLOW', steps: mejor.steps, relatedIds: mejor.pathNodes.map(n=>n.id) });
        flowCount++;
    }
    return withFrameInfo(flujos);
}


// =================================================================================
// FUNCIONES AUXILIARES
// =================================================================================
function identificarFormulariosPorProximidad(inputs, maxDistanciaVertical = SETTINGS.MAX_DISTANCIA_VERTICAL, maxDesviacionHorizontal = SETTINGS.MAX_DESVIACION_HORIZONTAL) {
  if (inputs.length < 2) {
    console.log(`⚠️ Proximidad: No hay suficientes inputs (${inputs.length}) para formar formularios`);
    return [];
  }
  
  console.log(`🔍 Proximidad: Analizando ${inputs.length} inputs con tolerancias V:${maxDistanciaVertical}px H:${maxDesviacionHorizontal}px`);
  
  // MEJORA: Usar criterios más permisivos
  const distanciaVerticalPermisiva = Math.max(maxDistanciaVertical, 60); // Mínimo 60px
  const desviacionHorizontalPermisiva = Math.max(maxDesviacionHorizontal, 30); // Mínimo 30px
  
    const sortedInputs = [...inputs].sort((a, b) => getInputVisualRect(a).y - getInputVisualRect(b).y);
  const formularios = [];
  let formActual = [sortedInputs[0]];
  
  for (let i = 1; i < sortedInputs.length; i++) {
    const prev = sortedInputs[i - 1];
    const current = sortedInputs[i];
        const prevRect = getInputVisualRect(prev);
        const curRect = getInputVisualRect(current);
    
    const distVertical = curRect.y - (prevRect.y + prevRect.height);
    const desviacionHorizontal = Math.abs(curRect.x - prevRect.x);
    
    // MEJORA: Lógica más flexible de agrupación
    const estanCerca = distVertical >= 0 && distVertical < distanciaVerticalPermisiva && 
                       desviacionHorizontal < desviacionHorizontalPermisiva;
    
    // NUEVO: También agrupar si están en el mismo contenedor padre
    const mismoContenedor = prev.parent && current.parent && prev.parent.id === current.parent.id;
    
    // NUEVO: Agrupar si están en contexto de formulario
    const enContextoFormulario = estaEnContextoDeFormulario(current) && estaEnContextoDeFormulario(prev);
    
    console.log(`   Comparando elementos ${i-1}-${i}:`, {
      prev: prev.name,
      current: current.name,
      distVertical,
      desviacionHorizontal,
      estanCerca,
      mismoContenedor: mismoContenedor,
      enContextoFormulario,
      seAgrupan: estanCerca || mismoContenedor || enContextoFormulario
    });
    
    if (estanCerca || mismoContenedor || enContextoFormulario) {
      formActual.push(current);
      console.log(`     → Agregado al grupo actual (tamaño: ${formActual.length})`);
    } else {
      if (formActual.length > 1) {
        formularios.push(formActual);
        console.log(`     → Grupo completado con ${formActual.length} elementos:`, formActual.map(f => f.name));
      }
      formActual = [current];
      console.log(`     → Iniciando nuevo grupo con:`, current.name);
    }
  }
  
  if (formActual.length > 1) formularios.push(formActual);
  
  console.log(`💡 Formularios detectados por proximidad:`, formularios.length);
  formularios.forEach((form, idx) => {
    console.log(`   Formulario ${idx + 1}: ${form.length} elementos -`, form.map(f => f.name));
    // Calcular métricas del formulario
    const anchos = form.map(f => getInputVisualRect(f).width);
    const anchoMin = Math.min(...anchos);
    const anchoMax = Math.max(...anchos);
    const diferencia = anchoMax - anchoMin;
    console.log(`     Anchos: min=${anchoMin}, max=${anchoMax}, diferencia=${diferencia}`);
  });
  
  // NUEVO: Intentar segunda pasada para elementos aislados que podrían formar grupos
  const inputsAislados = inputs.filter(input => !formularios.some(form => form.includes(input)));
  console.log(`🔍 Inputs aislados para segunda pasada:`, inputsAislados.length, inputsAislados.map(i => i.name));
  
  const gruposAdicionales = buscarGruposAlternativos(inputsAislados);
  if (gruposAdicionales.length > 0) {
    console.log(`✨ Grupos adicionales encontrados:`, gruposAdicionales.length);
    gruposAdicionales.forEach((grupo, idx) => {
      console.log(`   Grupo adicional ${idx + 1}:`, grupo.map(g => g.name));
    });
  }
  formularios.push(...gruposAdicionales);
  
  return formularios;
}

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
  const areaOverlap = calcularSolapamientoDeAreas(input1, input2);
  if (areaOverlap > 0.3) { // 30% de solapamiento de área
    return true;
  }
  
  return false;
}

function calcularSolapamientoDeAreas(input1, input2) {
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

function analizarConsistenciaDeGrupo(inputGroup) {
    console.log(`🔍 Analizando grupo de ${inputGroup.length} inputs`);
    const widths = new Set(inputGroup.map(input => Math.round(getInputVisualRect(input).width)));
    console.log(`📏 Anchos únicos detectados:`, Array.from(widths));
    
    if (widths.size > 1) {
        const widthList = Array.from(widths).sort((a, b) => a - b);
        const minWidth = widthList[0];
        const maxWidth = widthList[widthList.length - 1];
        const diferencia = maxWidth - minWidth;
        
        console.log(`🚨 Generando issue de consistencia: diferencia de ${diferencia}px entre anchos ${minWidth}px y ${maxWidth}px`);
        
        const issue = {
            id: inputGroup[0].id, 
            parentId: inputGroup[0].parent ? inputGroup[0].parent.id : null, 
            name: `📋 Formulario con inconsistencias de ancho`,
            issue: `Detectados ${inputGroup.length} campos con anchos inconsistentes (diferencia: ${diferencia}px)`, 
            type: 'CONSISTENCY', 
            severity: diferencia > 100 ? 'MEDIUM' : 'LOW',
            suggestion: `Anchos encontrados: ${widthList.map(w => `${w}px`).join(', ')}. Recomendación: unificar a ${Math.round(widthList.reduce((a,b) => a+b, 0) / widthList.length)}px`,
            frameId: inputGroup[0].parent && inputGroup[0].parent.parent ? inputGroup[0].parent.parent.id : 'root',
            frameName: inputGroup[0].parent && inputGroup[0].parent.parent ? inputGroup[0].parent.parent.name : 'Frame',
            relatedIds: inputGroup.map(n => n.id)
        };
        
        console.log(`✅ Issue creado:`, issue);
        return issue;
    } else {
        console.log(`✅ Todos los anchos son iguales (${Array.from(widths)[0]}px) - no se genera issue`);
    }
    return null;
}

function esCandidatoAInput(nodo) {
  // NUEVO: Verificar si ya fue confirmado por el usuario
  if (esInputConfirmado(nodo)) return true;
  
  // NUEVO: Verificar si ya fue ignorado por el usuario
  if (esInputIgnorado(nodo)) return false;
  
  const tipo = nodo.type;
  const altura = nodo.height;
  const ancho = nodo.width;
  
  // Verificar si es un botón por nombre (excluir)
  const isButtonName = esBotonPorNombre(nodo.name);
  if (isButtonName) return false;
  
  // Verificar tipos de input específicos primero
  if (esRadioButton(nodo)) return true;
  if (esCheckbox(nodo)) return true;
  if (esTextArea(nodo)) return true;
  
  // Continuar con la lógica original para inputs de texto
  const alturaOk = altura >= 24 && altura <= 60;
  const anchoOk = ancho >= 80; // evitar chips
  
  const isRect = tipo === 'RECTANGLE';
  const isContainer = tipo === 'FRAME' || tipo === 'COMPONENT' || tipo === 'INSTANCE';
  
  if (!(isRect || isContainer)) return false;
  
  // MEJORA: Si el nombre sugiere fuertemente que es un input, ser más permisivo con el tamaño
  const nameHint = esInputPorNombre(nodo.name);
  const nombreSugiereInput = nameHint || tieneNombreDeInput(nodo.name);
  
  console.log(`🔍 Evaluando nodo "${nodo.name}": ${ancho}x${altura}, tipo:${tipo}, nameHint:${nameHint}, nombreSugiere:${nombreSugiereInput}`);
  
  if (nombreSugiereInput) {
    // Criterios MUY permisivos para elementos con nombres de input claros
    const alturaPermisiva = altura >= 15 && altura <= 100; // Más permisivo: desde 15px
    const anchoPermisivo = ancho >= 40; // Más permisivo: desde 40px
    console.log(`📝 Nombre sugiere input: "${nodo.name}" → altura:${altura} (≥15), ancho:${ancho} (≥40)`);
    if (!(alturaPermisiva && anchoPermisivo)) {
      console.log(`❌ No cumple criterios permisivos`);
      return false;
    }
    console.log(`✅ Cumple criterios permisivos por nombre`);
  } else {
    // Criterios estrictos para el resto
    if (!(alturaOk && anchoOk)) {
      console.log(`❌ No cumple criterios estrictos: altura:${altura} (24-60), ancho:${ancho} (≥80)`);
      return false;
    }
  }
  
  // MEJORA CRÍTICA: Reconocimiento por estructura (rectángulo + etiqueta cercana)
  // Esta es la función clave para detectar inputs sin nombre específico
  const structuralHint = esInputPorEstructura(nodo);
  
  // Si tenemos evidencia estructural fuerte, es muy probable que sea un input
  if (structuralHint) {
    console.log(`✅ Detectado por estructura: "${nodo.name}"`);
    return true;
  }
  
  // Señales visuales básicas (solo si no hay evidencia estructural)
    const hasFills = (function(){
        if (!Array.isArray(nodo.fills) || nodo.fills.length === 0) return false;
        const f0 = nodo.fills[0];
        const visibleProp = (f0 && typeof f0 === 'object' && 'visible' in f0) ? f0.visible !== false : true;
        return visibleProp;
    })();
  const hasStrokes = Array.isArray(nodo.strokes) && nodo.strokes.length > 0;
  
  // Para rectángulos: requerir evidencia visual O nombre O estructura
  if (isRect) {
    const resultado = (hasFills || hasStrokes || nameHint) && !isButtonName;
    console.log(`🎯 Rectángulo "${nodo.name}": fills:${hasFills}, strokes:${hasStrokes}, nameHint:${nameHint}, button:${isButtonName} → ${resultado}`);
    return resultado;
  }
  
  // Para contenedores, que tengan un RECTANGLE o TEXT interno típico de input
  if ('children' in nodo && Array.isArray(nodo.children)) {
    const childRect = nodo.children.find(c => c.type === 'RECTANGLE' && c.height >= 24 && c.height <= 60);
    const childText = nodo.children.find(c => c.type === 'TEXT');
    const resultado = (!!childRect || !!childText || nameHint) && !isButtonName;
    console.log(`📦 Contenedor "${nodo.name}": childRect:${!!childRect}, childText:${!!childText}, nameHint:${nameHint} → ${resultado}`);
    return resultado;
  }
  
  console.log(`❓ Tipo no reconocido "${nodo.name}": ${tipo}`);
  return false;
}

// Funciones auxiliares para reconocimiento mejorado de inputs
function esBotonPorNombre(name) {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  const buttonKeywords = ['button', 'btn', 'boton', 'submit', 'enviar', 'send', 'cancel', 'cancelar'];
  return buttonKeywords.some(keyword => lowerName.includes(keyword));
}

function tieneNombreDeInput(name) {
  if (!name) return false;
  const lowerName = name.toLowerCase().trim();
  
  // Nombres específicos que claramente indican inputs
  const inputNames = ['email', 'mail', 'correo', 'telefono', 'phone', 'nombre', 'name', 
                     'apellido', 'surname', 'direccion', 'address', 'ciudad', 'city',
                     'pais', 'country', 'password', 'clave', 'usuario', 'user', 'login',
                     'codigo', 'code', 'fecha', 'date', 'hora', 'time'];
  
  // Verificar coincidencia exacta primero (caso "email")
  if (inputNames.includes(lowerName)) {
    return true;
  }
  
  // Luego verificar si contiene alguno de los nombres
  return inputNames.some(inputName => lowerName.includes(inputName));
}

function esInputPorNombre(name) {
  if (!name) return false;
  const lowerName = name.toLowerCase();
  
  // Patrones directos
  const directPatterns = ['input', 'field', 'campo', 'textbox', 'text-box', 'textarea', 'text-area',
                         'form-control', 'form_control', 'control', 'entrada', 'ingreso'];
  if (directPatterns.some(pattern => lowerName.includes(pattern))) return true;
  
  // Patrones con números (input1, input2, field_1, etc.)
  const numberedPatterns = [
    /input\s*[0-9]+/,
    /field\s*[0-9]+/,
    /campo\s*[0-9]+/,
    /text\s*[0-9]+/,
    /input[-_]\d+/,
    /field[-_]\d+/,
    /campo[-_]\d+/,
    /control[-_]\d+/,
    /entry[-_]\d+/
  ];
  if (numberedPatterns.some(pattern => pattern.test(lowerName))) return true;
  
  // Patrones de tipos de input específicos
  const typePatterns = ['email', 'password', 'tel', 'number', 'date', 'time', 'url', 'search',
                       'telefono', 'contrasena', 'clave', 'fecha', 'hora', 'buscar', 'busqueda'];
  if (typePatterns.some(type => lowerName.includes(type))) return true;
  
  // Patrones para radio buttons y checkboxes
  const controlPatterns = ['radio', 'checkbox', 'check', 'option', 'choice', 'select',
                          'opcion', 'seleccion', 'marca', 'verificacion'];
  if (controlPatterns.some(pattern => lowerName.includes(pattern))) return true;
  
  return false;
}

function esInputPorEstructura(nodo) {
  // Buscar si hay texto cercano que sugiera que es un input
  const rect = getAbsRect(nodo);
  const padre = nodo.parent;
  
  // 1) Buscar texto hermano que indique que es un input (MEJORADO)
  if (padre && 'children' in padre) {
    for (const hermano of padre.children) {
      if (hermano.type === 'TEXT') {
        const textoRect = getAbsRect(hermano);
        
        // AMPLIAMOS las tolerancias de proximidad
        const esEtiquetaIzq = Math.abs((textoRect.x + textoRect.width) - rect.x) < 30 && 
                              Math.abs(textoRect.y - rect.y) < 20;
        const esEtiquetaArr = Math.abs(textoRect.x - rect.x) < 20 && 
                              Math.abs((textoRect.y + textoRect.height) - rect.y) < 25;
        
        // NUEVO: También considerar texto a la derecha (para algunos layouts)
        const esEtiquetaDer = Math.abs(textoRect.x - (rect.x + rect.width)) < 30 && 
                              Math.abs(textoRect.y - rect.y) < 20;
        
        // NUEVO: Texto debajo del input (para algunos diseños)
        const esEtiquetaAbajo = Math.abs(textoRect.x - rect.x) < 20 && 
                                Math.abs(textoRect.y - (rect.y + rect.height)) < 25;
        
        if (esEtiquetaIzq || esEtiquetaArr || esEtiquetaDer || esEtiquetaAbajo) {
          const texto = normalizarTexto(hermano.characters);
          
          // Si el texto sugiere que es un campo de entrada
          if (esPosibleEtiquetaDeInput(texto)) {
            return true;
          }
        }
      }
    }
  }
  
  // 2) Buscar texto cercano en un radio más amplio (MEJORADO)
  const radioAmpliado = 80; // Incrementamos el radio
  const textosProximos = figma.currentPage.findAllWithCriteria({ types: ['TEXT'] });
  
  for (const texto of textosProximos) {
    const textoRect = getAbsRect(texto);
    const distancia = calcularDistancia(rect, textoRect);
    
    if (distancia <= radioAmpliado) {
      const contenidoTexto = normalizarTexto(texto.characters);
      
      // MEJORADO: Verificar posición relativa del texto
      const esPosicionLogica = verificarPosicionLogicaEtiqueta(rect, textoRect);
      
      if (esPosicionLogica && esPosibleEtiquetaDeInput(contenidoTexto)) {
        return true;
      }
    }
  }
  
  // 3) NUEVO: Verificar si está en un contexto de formulario
  if (estaEnContextoDeFormulario(nodo)) {
    return true;
  }
  
  return false;
}

function esPosibleEtiquetaDeInput(texto) {
  if (!texto || texto.length < 2) return false;
  
  // Limpiar el texto de caracteres especiales comunes en etiquetas
  const textoLimpio = texto.replace(/[*:()\[\]]/g, '').trim();
  
  // Patrones que sugieren campos de entrada (AMPLIADO)
  const patterns = [
    // Datos personales
    'nombre', 'apellido', 'email', 'correo', 'telefono', 'celular', 'direccion',
    'edad', 'fecha', 'nacimiento', 'documento', 'dni', 'cedula', 'pasaporte',
    'genero', 'sexo', 'nacionalidad', 'ocupacion', 'profesion', 'titulo',
    // Ubicación
    'pais', 'ciudad', 'provincia', 'estado', 'codigo postal', 'cp', 'zip',
    'localidad', 'municipio', 'region', 'departamento', 'direccion',
    // Comerciales
    'empresa', 'trabajo', 'cargo', 'puesto', 'salario', 'experiencia',
    'categoria', 'tipo', 'sucursal', 'area', 'sector', 'industria',
    // Autenticación
    'usuario', 'password', 'contraseña', 'clave', 'login', 'acceso',
    // Formularios
    'comentario', 'mensaje', 'observaciones', 'descripcion', 'notas',
    'cantidad', 'precio', 'monto', 'valor', 'numero', 'codigo',
    'fecha inicio', 'fecha fin', 'hora', 'tiempo', 'duracion',
    // Opciones y selecciones
    'selecciona', 'elige', 'marca', 'indica', 'especifica',
    'si/no', 'verdadero/falso', 'activo/inactivo',
    // NUEVOS: Patrones más generales
    'texto', 'campo', 'dato', 'informacion', 'detalle', 'contenido',
    'buscar', 'busqueda', 'filtro', 'criterio', 'termino',
    // En inglés
    'name', 'surname', 'last name', 'first name', 'phone', 'address',
    'country', 'city', 'state', 'zip code', 'postal code',
    'company', 'job', 'position', 'username', 'message', 'comment',
    'amount', 'price', 'number', 'code', 'description', 'notes',
    'select', 'choose', 'pick', 'check', 'mark', 'indicate',
    'yes/no', 'true/false', 'active/inactive', 'enabled/disabled',
    'start date', 'end date', 'time', 'duration', 'search', 'filter',
    'text', 'field', 'data', 'information', 'detail', 'content'
  ];
  
  // Buscar patrones directos en texto original
  if (patterns.some(pattern => texto.includes(pattern))) {
    return true;
  }
  
  // Buscar patrones en texto limpio
  if (patterns.some(pattern => textoLimpio.includes(pattern))) {
    return true;
  }
  
  // Buscar patrones con dos puntos (típico de etiquetas)
  if (texto.includes(':')) {
    const antesDeDosPuntos = texto.split(':')[0].trim();
    if (antesDeDosPuntos.length >= 2) {
      return patterns.some(pattern => antesDeDosPuntos.includes(pattern));
    }
  }
  
  // Buscar patrones con asterisco (campos obligatorios)
  if (texto.includes('*')) {
    const sinAsterisco = texto.replace(/\*/g, '').trim();
    return patterns.some(pattern => sinAsterisco.includes(pattern));
  }
  
  // NUEVO: Heurística adicional - si es una sola palabra corta que podría ser una etiqueta
  const palabras = textoLimpio.split(/\s+/).filter(Boolean);
  if (palabras.length === 1 && palabras[0].length >= 3 && palabras[0].length <= 15) {
    // Palabras sueltas que comúnmente son etiquetas
    const etiquetasComunes = [
      'nombre', 'email', 'telefono', 'direccion', 'ciudad', 'pais',
      'empresa', 'cargo', 'edad', 'fecha', 'codigo', 'precio',
      'name', 'phone', 'address', 'city', 'country', 'company',
      'title', 'price', 'code', 'date', 'time', 'amount'
    ];
    
    const esPalabraEtiqueta = etiquetasComunes.includes(palabras[0]);
    if (esPalabraEtiqueta) {
      return true;
    }
  }
  
  // NUEVO: Si termina con dos puntos, es muy probable que sea una etiqueta
  if (texto.trim().endsWith(':') && textoLimpio.length >= 3) {
    return true;
  }
  
  return false;
}

function calcularDistancia(rect1, rect2) {
  const dx = Math.max(0, Math.max(rect2.x - (rect1.x + rect1.width), rect1.x - (rect2.x + rect2.width)));
  const dy = Math.max(0, Math.max(rect2.y - (rect1.y + rect1.height), rect1.y - (rect2.y + rect2.height)));
  return Math.hypot(dx, dy);
}

// NUEVA: Verificar si la posición del texto es lógica para una etiqueta
function verificarPosicionLogicaEtiqueta(rectInput, rectTexto) {
  // El texto debe estar en una posición lógica respecto al input
  
  // Arriba del input (más común)
  const arribaDelInput = rectTexto.y + rectTexto.height <= rectInput.y + 30;
  
  // A la izquierda del input (común en formularios horizontales)
  const izquierdaDelInput = rectTexto.x + rectTexto.width <= rectInput.x + 40;
  
  // A la derecha del input (menos común, pero posible)
  const derechaDelInput = rectTexto.x >= rectInput.x + rectInput.width - 10;
  
  // Debajo del input (para ayuda o errores, pero también etiquetas)
  const abajoDelInput = rectTexto.y >= rectInput.y + rectInput.height - 10;
  
  // Verificar alineación horizontal o vertical aproximada
  const alineacionHorizontal = Math.abs(rectTexto.x - rectInput.x) < 30;
  const alineacionVertical = Math.abs(rectTexto.y - rectInput.y) < 25;
  
  return (arribaDelInput && alineacionHorizontal) || 
         (izquierdaDelInput && alineacionVertical) ||
         (derechaDelInput && alineacionVertical) ||
         (abajoDelInput && alineacionHorizontal);
}

// NUEVA: Verificar si el nodo está en un contexto de formulario
function estaEnContextoDeFormulario(nodo) {
  // Buscar indicios de que está dentro de un formulario
  let padre = nodo.parent;
  let depth = 0;
  
  while (padre && depth < 10) { // Limitar la búsqueda hacia arriba
    const nombrePadre = (padre.name || '').toLowerCase();
    
    // Buscar nombres que sugieran formulario
    const esFormulario = ['form', 'formulario', 'registro', 'login', 'signup', 
                         'checkout', 'contact', 'contacto', 'datos'].some(keyword => 
                         nombrePadre.includes(keyword));
    
    if (esFormulario) return true;
    
    // Buscar si el contenedor tiene múltiples elementos similares (típico de formularios)
    if ('children' in padre) {
      const rectangulos = padre.children.filter(child => 
        child.type === 'RECTANGLE' && 
        child.height >= 24 && child.height <= 60 && 
        child.width >= 80
      );
      
      // Si hay 3 o más rectángulos similares, probablemente es un formulario
      if (rectangulos.length >= 3) return true;
    }
    
    padre = padre.parent;
    depth++;
  }
  
  return false;
}

// Funciones para detectar tipos específicos de inputs
function esRadioButton(nodo) {
  const tipo = nodo.type;
  const altura = nodo.height;
  const ancho = nodo.width;
  
  // Radio buttons suelen ser círculos o cuadrados pequeños
  const esCircular = (tipo === 'ELLIPSE' || tipo === 'RECTANGLE') && 
                     Math.abs(altura - ancho) < 5 && 
                     altura >= 12 && altura <= 30;
  
  if (!esCircular) return false;
  
  // Verificar por nombre
  const name = (nodo.name || '').toLowerCase();
  const radioPatterns = ['radio', 'option', 'choice', 'opcion', 'seleccion'];
  if (radioPatterns.some(pattern => name.includes(pattern))) return true;
  
  // Verificar por estructura: debe tener texto cercano
  const tieneTextoAsociado = verificarTextoAsociadoParaControl(nodo);
  if (tieneTextoAsociado) {
    // Si es circular y tiene texto cerca, probablemente es un radio button
    return true;
  }
  
  // Verificar si está en un grupo con otros elementos similares (radio group)
  if (esParteDeGrupoRadio(nodo)) return true;
  
  return false;
}

function esCheckbox(nodo) {
  const tipo = nodo.type;
  const altura = nodo.height;
  const ancho = nodo.width;
  
  // Checkboxes suelen ser cuadrados pequeños
  const esCuadrado = tipo === 'RECTANGLE' && 
                     Math.abs(altura - ancho) < 5 && 
                     altura >= 12 && altura <= 30;
  
  if (!esCuadrado) return false;
  
  // Verificar por nombre
  const name = (nodo.name || '').toLowerCase();
  const checkPatterns = ['check', 'checkbox', 'tick', 'marca', 'verificacion'];
  if (checkPatterns.some(pattern => name.includes(pattern))) return true;
  
  // Verificar por estructura: debe tener texto cercano
  const tieneTextoAsociado = verificarTextoAsociadoParaControl(nodo);
  if (tieneTextoAsociado) {
    // Si es cuadrado pequeño y tiene texto cerca, probablemente es un checkbox
    return true;
  }
  
  // Verificar si tiene un ícono de check adentro
  if ('children' in nodo && Array.isArray(nodo.children)) {
    const tieneIconoCheck = nodo.children.some(child => {
      const childName = (child.name || '').toLowerCase();
      return childName.includes('check') || childName.includes('tick') || childName.includes('✓');
    });
    if (tieneIconoCheck) return true;
  }
  
  return false;
}

function esTextArea(nodo) {
  const tipo = nodo.type;
  const altura = nodo.height;
  const ancho = nodo.width;
  
  // TextAreas son rectángulos más altos que anchos
  const esRectangular = (tipo === 'RECTANGLE' || tipo === 'FRAME');
  const esAlto = altura >= 60 && altura <= 200; // Más alto que un input normal
  const esAncho = ancho >= 100;
  
  if (!esRectangular || !esAlto || !esAncho) return false;
  
  // Verificar por nombre
  const name = (nodo.name || '').toLowerCase();
  const textareaPatterns = ['textarea', 'text-area', 'comment', 'message', 'description', 
                           'comentario', 'mensaje', 'descripcion', 'observaciones', 'notas'];
  if (textareaPatterns.some(pattern => name.includes(pattern))) return true;
  
  // Verificar por estructura: texto asociado que sugiera textarea
  const textoAsociado = encontrarTextoAsociado(nodo);
  if (textoAsociado) {
    const textareaKeywords = ['comentario', 'comentarios', 'mensaje', 'descripcion', 
                             'observaciones', 'notas', 'detalles', 'comment', 'message', 
                             'description', 'notes', 'details'];
    if (textareaKeywords.some(keyword => textoAsociado.includes(keyword))) {
      return true;
    }
  }
  
  return false;
}

function verificarTextoAsociadoParaControl(nodo) {
  const rect = getAbsRect(nodo);
  const padre = nodo.parent;
  
  // Buscar texto hermano cercano
  if (padre && 'children' in padre) {
    for (const hermano of padre.children) {
      if (hermano.type === 'TEXT') {
        const textoRect = getAbsRect(hermano);
        
        // Para radio/checkbox, el texto suele estar a la derecha
        const esEtiquetaDer = Math.abs(textoRect.x - (rect.x + rect.width)) < 15 && 
                              Math.abs(textoRect.y - rect.y) < 10;
        const esEtiquetaIzq = Math.abs((textoRect.x + textoRect.width) - rect.x) < 15 && 
                              Math.abs(textoRect.y - rect.y) < 10;
        
        if (esEtiquetaDer || esEtiquetaIzq) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function esParteDeGrupoRadio(nodo) {
  const padre = nodo.parent;
  if (!padre || !('children' in padre)) return false;
  
  // Buscar otros elementos similares en el mismo contenedor
  const elementosSimilares = padre.children.filter(child => {
    if (child === nodo) return false;
    if (child.type !== nodo.type) return false;
    
    const alturasSimilares = Math.abs(child.height - nodo.height) < 5;
    const anchosSimiliares = Math.abs(child.width - nodo.width) < 5;
    
    return alturasSimilares && anchosSimiliares;
  });
  
  // Si hay al menos 2 elementos similares (incluyendo este), probablemente es un grupo de radio
  return elementosSimilares.length >= 1;
}

// Función para buscar patrones en rectángulos con etiquetas
function buscarPatronEnRectangulosConEtiquetas(nodoInput, palabraClave) {
  const rectInput = getAbsRect(nodoInput);
  const claveNorm = normalizarTexto(palabraClave);
  
  // Patrones alternativos para búsqueda más flexible
  const patronesAlternativos = generarPatronesAlternativos(palabraClave);
  
  // Buscar en un radio más amplio alrededor del input
  const radio = 100;
  const todosLosTextos = figma.currentPage.findAllWithCriteria({ types: ['TEXT'] });
  
  for (const textoNode of todosLosTextos) {
    const rectTexto = getAbsRect(textoNode);
    const distancia = calcularDistancia(rectInput, rectTexto);
    
    if (distancia <= radio) {
      const contenidoTexto = normalizarTexto(textoNode.characters);
      
      // MEJORADO: Verificar coincidencia exacta o muy específica
      for (const patron of patronesAlternativos) {
        // Buscar coincidencia exacta de palabra completa, no substring
        const palabrasTexto = contenidoTexto.split(/\s+/);
        const coincidenciaExacta = palabrasTexto.includes(patron) || 
                                  contenidoTexto === patron ||
                                  contenidoTexto === patron + ':' ||
                                  contenidoTexto === patron + '*';
        
        if (coincidenciaExacta) {
          // Verificar si hay un rectángulo cerca del texto (que podría ser una etiqueta)
          const tieneRectanguloAsociado = verificarRectanguloAsociadoATexto(textoNode);
          
          return {
            encontrado: true,
            contexto: `Patrón "${patron}" encontrado en rectángulo con etiqueta cercana`
          };
        }
      }
    }
  }
  
  return { encontrado: false, contexto: '' };
}

function generarPatronesAlternativos(palabraClave) {
  const claveNorm = normalizarTexto(palabraClave);
  const patrones = [claveNorm];
  
  // Agregar variaciones comunes
  const variaciones = {
    'pais': ['country', 'nacion', 'nacionalidad'],
    'paises': ['countries', 'naciones'],
    'ciudad': ['city', 'localidad', 'municipio'],
    'ciudades': ['cities', 'localidades', 'municipios'],
    'provincia': ['state', 'region', 'departamento'],
    'estado': ['state', 'status', 'situacion'],
    'genero': ['gender', 'sex', 'sexo'],
    'sexo': ['gender', 'sex', 'genero'],
    'categoria': ['category', 'tipo', 'class'],
    'categoría': ['category', 'tipo', 'class', 'categoria'],
    'sucursal': ['branch', 'office', 'oficina'],
    'tipo de documento': ['document type', 'tipo documento', 'tipo doc']
  };
  
  if (variaciones[palabraClave]) {
    patrones.push(...variaciones[palabraClave].map(v => normalizarTexto(v)));
  }
  
  // Agregar patrones con espacios y guiones
  patrones.push(claveNorm.replace(/\s+/g, ''));
  patrones.push(claveNorm.replace(/\s+/g, '-'));
  patrones.push(claveNorm.replace(/\s+/g, '_'));
  
  return [...new Set(patrones)]; // Eliminar duplicados
}

function verificarRectanguloAsociadoATexto(textoNode) {
  const rectTexto = getAbsRect(textoNode);
  const padre = textoNode.parent;
  
  // Buscar rectángulos hermanos
  if (padre && 'children' in padre) {
    for (const hermano of padre.children) {
      if (hermano.type === 'RECTANGLE') {
        const rectHermano = getAbsRect(hermano);
        const distancia = calcularDistancia(rectTexto, rectHermano);
        
        // Si hay un rectángulo muy cerca, probablemente es una etiqueta
        if (distancia < 30) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function esParteDeInstancia(nodo) {
  let parent = nodo.parent;
  let depth = 0;
  while (parent && depth < 50) {
    if (parent.type === 'INSTANCE' || parent.type === 'COMPONENT') return true;
    if (parent.type === 'PAGE') return false;
    parent = parent.parent;
    depth++;
  }
  return false;
}

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
                if (esPlaceholder || esEtiquetaIzq || esEtiquetaArr) return normalizarTexto(hermano.characters);
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
            mejor = t; mejorDist = dist;
        }
    }
    return mejor ? normalizarTexto(mejor.characters) : null;
}

function identificarTipoDeDato(texto) {
    const all = getAllDataTypes();
    for (const tipo in all) {
        const def = all[tipo];
        if (Array.isArray(def.keywords) && def.keywords.some(function(pal){ return texto.includes(normalizarTexto(pal)); })) {
            return def;
        }
    }
    return null;
}

function estaDentro(cajaInterna, cajaExterna) {
    if (!cajaInterna || !cajaExterna) return false;
    return (cajaInterna.x >= cajaExterna.x && cajaInterna.y >= cajaExterna.y && cajaInterna.x + cajaInterna.width <= cajaExterna.x + cajaExterna.width && cajaInterna.y + cajaInterna.height <= cajaExterna.y + cajaExterna.height);
}

// -------------------------- Nuevas utilidades --------------------------
function normalizarTexto(s) {
    if (!s) return '';
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function getAbsRect(node) {
    // Calcula el bounding box absoluto axis-aligned
    const m = node.absoluteTransform; // [[a,c,e],[b,d,f]]
    const w = node.width, h = node.height;
    const pts = [
        { x: 0, y: 0 }, { x: w, y: 0 }, { x: 0, y: h }, { x: w, y: h }
    ].map(p => ({ x: m[0][0]*p.x + m[0][1]*p.y + m[0][2], y: m[1][0]*p.x + m[1][1]*p.y + m[1][2] }));
    const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function obtenerInputs(scope = 'page') {
    let baseNodes = [];
        if (scope === 'selection' && figma.currentPage.selection.length > 0) {
            const sel = figma.currentPage.selection;
            // Incluir seleccionados y sus descendientes
            let descendants = [];
            for (const n of sel) {
                if ('findAll' in n) {
                    descendants = descendants.concat(n.findAll(()=>true));
                }
            }
            baseNodes = sel.concat(descendants);
        } else {
        baseNodes = figma.currentPage.findAll(()=>true);
    }
        // Filtrar para incluir diferentes tipos de inputs
        return baseNodes.filter(n => {
            // Incluir RECTANGLE (inputs de texto tradicionales)
            if (n.type === 'RECTANGLE' && esCandidatoAInput(n)) return true;
            
            // Incluir ELLIPSE (posibles radio buttons)
            if (n.type === 'ELLIPSE' && esCandidatoAInput(n)) return true;
            
            // Incluir FRAME, COMPONENT, INSTANCE (contenedores de inputs)
            if ((n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'INSTANCE') && esCandidatoAInput(n)) return true;
            
            return false;
        });
}

function obtenerTextos(scope = 'page') {
    if (scope === 'selection' && figma.currentPage.selection.length > 0) {
        const sel = figma.currentPage.selection;
        const textos = [];
        for (const n of sel) {
            if (n.type === 'TEXT') textos.push(n);
            if ('findAll' in n) textos.push(...n.findAll(nn => nn.type === 'TEXT'));
        }
        return textos;
    }
    return figma.currentPage.findAllWithCriteria({ types: ['TEXT'] });
}

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

function getAncestorFrameInfo(n) {
    let p = n;
    while (p && p.type !== 'FRAME' && p.type !== 'PAGE') { p = p.parent; }
    if (p && p.type === 'FRAME') return { frameId: p.id, frameName: p.name };
    return { frameId: null, frameName: '—' };
}

function withFrameInfo(list) {
    return list.map(it => {
        const node = figma.getNodeById(it.id) || (it.parentId && figma.getNodeById(it.parentId));
        if (node) {
            const info = getAncestorFrameInfo(node);
            it.frameId = info.frameId;
            it.frameName = info.frameName;
        }
        return it;
    });
}

function isIgnored(node, typeKey) {
    if (!node || !('getPluginData' in node)) return false;
    const val = node.getPluginData('ux-ignored-' + typeKey) || '';
    return val === '1';
}

function isIgnoredById(id, typeKey) {
    const n = figma.getNodeById(id);
    return isIgnored(n, typeKey);
}

// Funciones para manejar confirmación de inputs por el usuario
function esInputConfirmado(nodo) {
    if (!nodo || !('getPluginData' in nodo)) return false;
    return nodo.getPluginData('ux-confirmed-input') === '1';
}

function esInputIgnorado(nodo) {
    if (!nodo || !('getPluginData' in nodo)) return false;
    return nodo.getPluginData('ux-ignored-input') === '1';
}

// Nueva función para detectar candidatos potenciales a inputs
async function detectarCandidatosInputs(scope = 'page') {
    let candidatos = [];
    let baseNodes = [];
    
    if (scope === 'selection' && figma.currentPage.selection.length > 0) {
        const sel = figma.currentPage.selection;
        let descendants = [];
        for (const n of sel) {
            if ('findAll' in n) {
                descendants = descendants.concat(n.findAll(()=>true));
            }
        }
        baseNodes = sel.concat(descendants);
    } else {
        baseNodes = figma.currentPage.findAll(()=>true);
    }
    
    // Buscar rectángulos que podrían ser inputs pero no se detectan actualmente
    for (const nodo of baseNodes) {
        if (esCandidatoPotencial(nodo) && !esCandidatoAInput(nodo)) {
            const evidencia = analizarEvidenciaInput(nodo);
            if (evidencia.score > 0) {
                candidatos.push({
                    id: nodo.id,
                    name: `Candidato: "${nodo.name}"`,
                    issue: `Posible input no detectado. ${evidencia.razon}`,
                    type: 'POTENTIAL_INPUT',
                    severity: evidencia.score >= 3 ? 'high' : 'medium',
                    suggestion: 'Confirma si este elemento es un input o ignóralo si no lo es.',
                    evidencias: evidencia.evidencias,
                    score: evidencia.score
                });
            }
        }
    }
    
    return withFrameInfo(candidatos);
}

function esCandidatoPotencial(nodo) {
    const tipo = nodo.type;
    const altura = nodo.height;
    const ancho = nodo.width;
    
    // Debe ser un rectángulo o contenedor
    if (!(tipo === 'RECTANGLE' || tipo === 'FRAME' || tipo === 'COMPONENT' || tipo === 'INSTANCE')) {
        return false;
    }
    
    // Debe tener un tamaño razonable (MUY permisivo para candidatos)
    const alturaOk = altura >= 15 && altura <= 100; // Muy permisivo para candidatos
    const anchoOk = ancho >= 40; // Muy permisivo para candidatos
    
    if (!alturaOk || !anchoOk) return false;
    
    // No debe ser claramente un botón
    if (esBotonPorNombre(nodo.name)) return false;
    
    // Ya debe estar confirmado o ignorado
    if (esInputConfirmado(nodo) || esInputIgnorado(nodo)) return false;
    
    return true;
}

function analizarEvidenciaInput(nodo) {
    let score = 0;
    let evidencias = [];
    let razon = '';
    
    // 1. Analizar nombre del elemento
    const nombreScore = analizarNombreParaInput(nodo.name);
    if (nombreScore > 0) {
        score += nombreScore;
        evidencias.push(`Nombre sugiere input: "${nodo.name}"`);
    }
    
    // 2. Buscar texto cercano
    const textoScore = analizarTextoCercano(nodo);
    if (textoScore.score > 0) {
        score += textoScore.score;
        evidencias.push(`Texto cercano: "${textoScore.texto}"`);
    }
    
    // 3. Analizar contexto de formulario
    if (estaEnContextoDeFormulario(nodo)) {
        score += 2;
        evidencias.push('Está en contexto de formulario');
    }
    
    // 4. Analizar características visuales
    const visualScore = analizarCaracteristicasVisuales(nodo);
    if (visualScore > 0) {
        score += visualScore;
        evidencias.push('Tiene características visuales de input');
    }
    
    // Crear razón descriptiva
    if (evidencias.length > 0) {
        razon = `Evidencias: ${evidencias.join(', ')}`;
    } else {
        razon = 'Sin evidencias claras';
    }
    
    return { score, evidencias, razon };
}

function analizarNombreParaInput(nombre) {
    if (!nombre) return 0;
    
    const lowerName = nombre.toLowerCase();
    
    // Palabras que sugieren inputs pero no se detectan siempre
    const palabrasInput = ['email', 'mail', 'correo', 'telefono', 'phone', 'tel', 
                          'nombre', 'name', 'apellido', 'surname', 'direccion', 'address',
                          'ciudad', 'city', 'pais', 'country', 'codigo', 'code',
                          'password', 'clave', 'usuario', 'user', 'login'];
    
    for (const palabra of palabrasInput) {
        if (lowerName.includes(palabra)) {
            return 3; // Alta evidencia por nombre
        }
    }
    
    // Patrones numéricos
    if (/\d+/.test(lowerName) && (lowerName.includes('field') || lowerName.includes('input'))) {
        return 2;
    }
    
    return 0;
}

function analizarTextoCercano(nodo) {
    const rect = getAbsRect(nodo);
    const radio = 100;
    
    const textosProximos = figma.currentPage.findAllWithCriteria({ types: ['TEXT'] });
    
    for (const texto of textosProximos) {
        const textoRect = getAbsRect(texto);
        const distancia = calcularDistancia(rect, textoRect);
        
        if (distancia <= radio) {
            const contenidoTexto = normalizarTexto(texto.characters);
            
            if (esPosibleEtiquetaDeInput(contenidoTexto)) {
                const esPosicionLogica = verificarPosicionLogicaEtiqueta(rect, textoRect);
                return {
                    score: esPosicionLogica ? 3 : 2,
                    texto: contenidoTexto
                };
            }
        }
    }
    
    return { score: 0, texto: '' };
}

function analizarCaracteristicasVisuales(nodo) {
    let score = 0;
    
    // Verificar fills
    const hasFills = Array.isArray(nodo.fills) && nodo.fills.length > 0;
    if (hasFills) score += 1;
    
    // Verificar strokes
    const hasStrokes = Array.isArray(nodo.strokes) && nodo.strokes.length > 0;
    if (hasStrokes) score += 1;
    
    // Verificar aspect ratio típico de inputs
    const aspectRatio = nodo.width / nodo.height;
    if (aspectRatio >= 2 && aspectRatio <= 8) {
        score += 1;
    }
    
    return score;
}

// Función de debug para verificar por qué un elemento específico no se detecta
function debugElementoEspecifico(nodo) {
    if (!nodo.name.toLowerCase().includes('email')) return; // Solo debug para elementos con "email"
    
    console.log(`\n=== DEBUG ELEMENTO: ${nodo.name} ===`);
    console.log(`ID: ${nodo.id}`);
    console.log(`Tipo: ${nodo.type}`);
    console.log(`Tamaño: ${nodo.width}x${nodo.height}`);
    
    // Verificar si es botón
    const isButton = esBotonPorNombre(nodo.name);
    console.log(`Es botón: ${isButton}`);
    
    // Verificar nombre
    const nameHint = esInputPorNombre(nodo.name);
    const tieneNombre = tieneNombreDeInput(nodo.name);
    console.log(`esInputPorNombre: ${nameHint}`);
    console.log(`tieneNombreDeInput: ${tieneNombre}`);
    
    // Verificar tamaño
    const altura = nodo.height;
    const ancho = nodo.width;
    const alturaPermisiva = altura >= 16 && altura <= 100;
    const anchoPermisivo = ancho >= 50;
    console.log(`Altura válida (${altura}px): ${alturaPermisiva}`);
    console.log(`Ancho válido (${ancho}px): ${anchoPermisivo}`);
    
    // Verificar estructura
    const structural = esInputPorEstructura(nodo);
    console.log(`Evidencia estructural: ${structural}`);
    
    // Verificar confirmado/ignorado
    const confirmado = esInputConfirmado(nodo);
    const ignorado = esInputIgnorado(nodo);
    console.log(`Confirmado por usuario: ${confirmado}`);
    console.log(`Ignorado por usuario: ${ignorado}`);
    
    // Resultado final
    const resultado = esCandidatoAInput(nodo);
    console.log(`RESULTADO FINAL: ${resultado}`);
    console.log(`========================\n`);
}

// ========== NUEVOS ANÁLISIS AVANZADOS ==========

// Análisis de componentes
async function analizarComponentes(scope = 'page') {
  let problemas = [];
  
  const nodes = obtenerNodos(scope);
  const components = nodes.filter(n => n.type === 'COMPONENT');
  const instances = nodes.filter(n => n.type === 'INSTANCE');
  
  // Detectar componentes duplicados (misma estructura pero diferentes nombres)
  const componentsByStructure = {};
  components.forEach(comp => {
    const structure = getComponentStructure(comp);
    if (!componentsByStructure[structure]) {
      componentsByStructure[structure] = [];
    }
    componentsByStructure[structure].push(comp);
  });
  
  Object.values(componentsByStructure).forEach(duplicates => {
    if (duplicates.length > 1) {
      duplicates.slice(1).forEach(comp => {
        problemas.push({
          id: comp.id,
          type: 'COMPONENT_DUPLICATION',
          severity: 'medium',
          name: comp.name,
          issue: `Posible componente duplicado. Componente similar: "${duplicates[0].name}"`,
          suggestion: 'Considera consolidar componentes similares para mantener consistencia y reducir mantenimiento.'
        });
      });
    }
  });
  
  // Detectar instancias sin componente padre (componentes borrados)
  instances.forEach(instance => {
    if (!instance.mainComponent) {
      problemas.push({
        id: instance.id,
        type: 'ORPHANED_INSTANCE',
        severity: 'high',
        name: instance.name,
        issue: 'Instancia huérfana: el componente padre fue eliminado',
        suggestion: 'Reemplaza con un componente válido o convierte a grupo regular.'
      });
    }
  });
  
  return withFrameInfo(problemas);
}

function getComponentStructure(component) {
  // Simplificada: usa el nombre y el número de hijos como "huella digital"
  const childCount = component.children ? component.children.length : 0;
  const hasText = component.findOne(n => n.type === 'TEXT') !== null;
  const hasRect = component.findOne(n => n.type === 'RECTANGLE') !== null;
  return `${childCount}-${hasText}-${hasRect}`;
}

// Análisis de patrones de diseño
async function analizarPatrones(scope = 'page') {
  let problemas = [];
  
  const nodes = obtenerNodos(scope);
  const buttons = nodes.filter(n => esBoton(n));
  
  // Análisis de consistencia en botones
  if (buttons.length > 1) {
    const buttonStyles = buttons.map(btn => ({
      id: btn.id,
      name: btn.name,
      width: Math.round(btn.width),
      height: Math.round(btn.height),
      borderRadius: getBorderRadius(btn),
      fills: getFills(btn)
    }));
    
    // Detectar inconsistencias en tamaños de botones
    const heights = buttonStyles.map(b => b.height);
    const uniqueHeights = [...new Set(heights)];
    
    if (uniqueHeights.length > 2) {
      problemas.push({
        id: 'pattern-inconsistent-buttons',
        type: 'PATTERN_INCONSISTENCY',
        severity: 'medium',
        name: 'Botones inconsistentes',
        issue: `Se detectaron ${uniqueHeights.length} alturas diferentes en botones: ${uniqueHeights.join(', ')}px`,
        suggestion: 'Estandariza las alturas de botones. Usa máximo 2-3 tamaños (pequeño, mediano, grande).',
        relatedIds: buttons.map(b => b.id)
      });
    }
  }
  
  return withFrameInfo(problemas);
}

function esBoton(nodo) {
  const nombre = (nodo.name || '').toLowerCase();
  return nombre.includes('button') || nombre.includes('btn') || 
         (nodo.type === 'FRAME' && hasButtonLikeAppearance(nodo));
}

function hasButtonLikeAppearance(nodo) {
  // Heurística: tiene texto, es pequeño y tiene fondo
  const hasText = nodo.findOne(n => n.type === 'TEXT') !== null;
  const isSmallish = nodo.width < 200 && nodo.height < 60;
  const hasFill = nodo.fills && nodo.fills.length > 0 && nodo.fills[0].visible;
  return hasText && isSmallish && hasFill;
}

function getBorderRadius(nodo) {
  if (nodo.cornerRadius !== undefined) return nodo.cornerRadius;
  if (nodo.topLeftRadius !== undefined) {
    return Math.max(nodo.topLeftRadius, nodo.topRightRadius, nodo.bottomLeftRadius, nodo.bottomRightRadius);
  }
  return 0;
}

function getFills(nodo) {
  if (!nodo.fills || !Array.isArray(nodo.fills)) return [];
  return nodo.fills.filter(f => f.visible).map(f => f.type);
}

// Análisis de jerarquía tipográfica
async function analizarJerarquiaTipografica(scope = 'page') {
  let problemas = [];
  
  const textNodes = obtenerNodos(scope).filter(n => n.type === 'TEXT');
  
  if (textNodes.length === 0) return [];
  
  // Agrupar por tamaño de fuente
  const fontSizes = {};
  textNodes.forEach(text => {
    const size = Math.round(text.fontSize || 16);
    if (!fontSizes[size]) fontSizes[size] = [];
    fontSizes[size].push(text);
  });
  
  const uniqueSizes = Object.keys(fontSizes).map(Number).sort((a, b) => b - a);
  
  // Detectar demasiados tamaños de fuente
  if (uniqueSizes.length > 6) {
    problemas.push({
      id: 'typography-too-many-sizes',
      type: 'TYPOGRAPHY_INCONSISTENCY',
      severity: 'medium',
      name: 'Demasiados tamaños de fuente',
      issue: `Se detectaron ${uniqueSizes.length} tamaños diferentes: ${uniqueSizes.join(', ')}px`,
      suggestion: 'Reduce a máximo 5-6 tamaños para mantener jerarquía clara. Usa una escala tipográfica consistente.',
      relatedIds: textNodes.map(t => t.id)
    });
  }
  
  // Detectar saltos muy grandes en la escala
  for (let i = 0; i < uniqueSizes.length - 1; i++) {
    const ratio = uniqueSizes[i] / uniqueSizes[i + 1];
    if (ratio > 2.5) {
      problemas.push({
        id: `typography-large-jump-${i}`,
        type: 'TYPOGRAPHY_SCALE',
        severity: 'low',
        name: 'Salto grande en escala tipográfica',
        issue: `Salto de ${uniqueSizes[i + 1]}px a ${uniqueSizes[i]}px (ratio: ${ratio.toFixed(1)})`,
        suggestion: 'Considera usar una escala más gradual (1.2x, 1.5x, etc.) para mejor jerarquía visual.'
      });
    }
  }
  
  return withFrameInfo(problemas);
}

// Análisis de espaciado y ritmo visual
async function analizarEspaciado(scope = 'page') {
  let problemas = [];
  
  const frames = obtenerNodos(scope).filter(n => n.type === 'FRAME' && n.children.length > 1);
  
  frames.forEach(frame => {
    const children = frame.children.filter(child => child.visible !== false);
    if (children.length < 2) return;
    
    // Analizar espaciado vertical
    const verticalGaps = [];
    for (let i = 0; i < children.length - 1; i++) {
      const current = getAbsRect(children[i]);
      const next = getAbsRect(children[i + 1]);
      
      if (current.bottom < next.top) {
        verticalGaps.push(Math.round(next.top - current.bottom));
      }
    }
    
    if (verticalGaps.length > 2) {
      const uniqueGaps = [...new Set(verticalGaps)];
      if (uniqueGaps.length > 3) {
        problemas.push({
          id: frame.id,
          type: 'SPACING_INCONSISTENCY',
          severity: 'low',
          name: frame.name,
          issue: `Espaciado inconsistente: ${uniqueGaps.length} valores diferentes (${uniqueGaps.join(', ')}px)`,
          suggestion: 'Usa un sistema de espaciado consistente (ej: múltiplos de 8px: 8, 16, 24, 32px).'
        });
      }
    }
  });
  
  return withFrameInfo(problemas);
}

// Análisis combinado mejorado (con manejo de errores)
async function analizarCompletoMejorado(scope = 'page') {
  let todosLosProblemas = [];
  
  console.log('🔄 Iniciando análisis completo mejorado...');
  
  try {
    // Análisis originales (core - siempre ejecutar)
    console.log('📋 Ejecutando análisis originales...');
    const problems1 = await analizarTamanoDeInputs(scope);
    const problems2 = await analizarConsistenciaGlobal(scope);
    const problems3 = await analizarCamposSinFormato(scope); // Usar nombre correcto
    const problems4 = await analizarVinculosConfusos(scope);
    const problems5 = await analizarValoresLimitados(scope);
    const problems6 = await analizarComplejidadDeFormularios(scope);
    
    // Análisis de flujos (formularios por proximidad incluido)
    console.log('📋 Ejecutando análisis de flujos...');
    const problems7 = await visualizarFlujosDePrototipo();
    
    // Detección de inputs potenciales
    console.log('📋 Ejecutando detección de inputs potenciales...');
    const problems8 = await detectarCandidatosInputs(scope);
    
    todosLosProblemas = [
      ...problems1, ...problems2, ...problems3, 
      ...problems4, ...problems5, ...problems6,
      ...problems7, ...problems8
    ];
    
    console.log('✅ Análisis principales completados:', todosLosProblemas.length, 'issues');
    
    // Log específico para debugging de consistencia
    const issuesByType = todosLosProblemas.reduce((acc, i) => {
      acc[i.type || 'unknown'] = (acc[i.type || 'unknown'] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 Issues finales por tipo:', issuesByType);
    
    const consistencyIssues = todosLosProblemas.filter(i => i.type === 'CONSISTENCY');
    if (consistencyIssues.length > 0) {
      console.log('🔧 Issues de CONSISTENCY en resultado final:', consistencyIssues);
    }
    
    // ANÁLISIS AVANZADOS DESHABILITADOS TEMPORALMENTE
    /*
    // Nuevos análisis avanzados (con manejo de errores individual)
    console.log('🚀 Ejecutando análisis avanzados...');
    
    try {
      const problems9 = await analizarComponentes(scope);
      todosLosProblemas.push(...problems9);
      console.log('✅ Análisis de componentes OK');
    } catch (e) {
      console.warn('⚠️ Error en análisis de componentes:', e.message);
    }
    
    try {
      const problems10 = await analizarPatrones(scope);
      todosLosProblemas.push(...problems10);
      console.log('✅ Análisis de patrones OK');
    } catch (e) {
      console.warn('⚠️ Error en análisis de patrones:', e.message);
    }
    
    try {
      const problems11 = await analizarJerarquiaTipografica(scope);
      todosLosProblemas.push(...problems11);
      console.log('✅ Análisis tipográfico OK');
    } catch (e) {
      console.warn('⚠️ Error en análisis tipográfico:', e.message);
    }
    
    try {
      const problems12 = await analizarEspaciado(scope);
      todosLosProblemas.push(...problems12);
      console.log('✅ Análisis de espaciado OK');
    } catch (e) {
      console.warn('⚠️ Error en análisis de espaciado:', e.message);
    }
    */
    
  } catch (e) {
    console.error('❌ Error grave en análisis completo:', e);
    figma.notify('Error en análisis: ' + e.message);
  }
  
  console.log('🎯 Análisis completo terminado:', todosLosProblemas.length, 'issues total');
    
    return todosLosProblemas;
}

// =================================================================================
// INICIALIZACIÓN DEL SISTEMA MODULAR
// =================================================================================

// Cargar sistema modular si está disponible
(async function initializePlugin() {
    try {
        console.log('🔧 Inicializando plugin UX Smells Detector...');
        
        // Verificar si el sistema modular está disponible
        if (typeof eval !== 'undefined') {
            console.log('📦 Cargando módulos del sistema...');
            
            // En un entorno real, estos serían imports dinámicos
            // Por ahora, se asume que los módulos están cargados globalmente
            
            // Simular carga de módulos (en producción sería dynamic import)
            try {
                // Los módulos deberían estar disponibles como scripts incluidos
                console.log('✅ Módulos base cargados');
                
                // Inicializar sistema modular si está disponible
                setTimeout(() => {
                    if (typeof window !== 'undefined' && window.ModularSystem) {
                        window.ModularSystem.initialize().then(() => {
                            console.log('✅ Sistema modular inicializado correctamente');
                            console.log('📊 Estado:', window.ModularSystem.getStatus());
                        }).catch(error => {
                            console.warn('⚠️ Error inicializando sistema modular:', error);
                            console.log('🔄 Continuando con sistema legacy');
                        });
                    } else {
                        console.log('ℹ️ Sistema modular no disponible, usando legacy');
                    }
                }, 200);
                
            } catch (error) {
                console.warn('⚠️ Error cargando módulos:', error);
                console.log('🔄 Continuando con sistema legacy únicamente');
            }
        }
        
        console.log('✅ Plugin inicializado');
        
    } catch (error) {
        console.error('❌ Error en inicialización del plugin:', error);
    }
})();