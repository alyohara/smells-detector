# Ejemplos y Casos de Uso

Esta carpeta contiene ejemplos prácticos, casos de uso documentados y recursos para entender mejor cómo usar Simple Smells Detector.

## 📂 Estructura de Ejemplos

```
examples/
├── README.md                    # Este archivo
├── use-cases/                   # Casos de uso documentados
│   ├── ecommerce-checkout.md    # Proceso de checkout e-commerce
│   ├── banking-form.md          # Formularios bancarios
│   ├── registration-flow.md     # Flujos de registro
│   └── dashboard-layout.md      # Layouts de dashboard
├── prototypes/                  # Prototipos de ejemplo (referencias)
│   ├── before-optimization/     # Prototipos con smells
│   ├── after-optimization/      # Prototipos optimizados
│   └── figma-links.md          # Enlaces a prototipos en Figma
├── configurations/              # Ejemplos de configuración
│   ├── industry-presets.json    # Presets por industria
│   ├── custom-data-types.json   # Tipos de datos personalizados
│   └── advanced-settings.json   # Configuraciones avanzadas
└── tutorials/                   # Tutoriales paso a paso
    ├── getting-started.md       # Tutorial básico
    ├── advanced-usage.md        # Uso avanzado
    └── extending-detectors.md   # Crear detectores personalizados
```

## 🎯 Casos de Uso por Industria

### E-commerce
- **Formularios de checkout**: Optimización de campos de pago y envío
- **Registro de usuarios**: Simplificación del proceso de alta
- **Filtros de productos**: Diseño de controles de filtrado intuitivos

### Banca y Finanzas
- **Formularios de solicitud**: Gestión de información sensible
- **Transferencias**: Flujos críticos con validación robusta
- **Onboarding digital**: Procesos de alta de cuentas

### SaaS y Productividad
- **Dashboards**: Layouts complejos con múltiples métricas
- **Configuraciones**: Formularios de settings avanzados
- **Workflows**: Procesos multi-paso para tareas complejas

### Educación
- **Formularios de inscripción**: Captura de información académica
- **Evaluaciones**: Interfaces para exámenes y cuestionarios
- **Perfiles de estudiante**: Gestión de información personal

## 📊 Detectores por Escenario

### Formularios Web
| Detector | Aplicabilidad | Casos Típicos |
|----------|---------------|---------------|
| S01 (Tamaño) | ★★★★★ | Campos de email, teléfono, códigos |
| S02 (Consistencia) | ★★★★☆ | Formularios con múltiples campos |
| S03 (Formato) | ★★★★★ | Fechas, teléfonos, documentos |
| S05 (Valores limitados) | ★★★☆☆ | Países, categorías, tipos |
| S06 (Complejidad) | ★★★★☆ | Formularios de registro largos |

### Aplicaciones Móviles
| Detector | Aplicabilidad | Consideraciones Especiales |
|----------|---------------|----------------------------|
| S01 (Tamaño) | ★★★☆☆ | Umbrales diferentes para mobile |
| S06 (Complejidad) | ★★★★★ | Límites más estrictos |
| S07 (Flujos) | ★★★★☆ | Navegación en pantallas pequeñas |

### Dashboards y Análisis
| Detector | Aplicabilidad | Enfoque |
|----------|---------------|---------|
| S02 (Consistencia) | ★★★★★ | Alineación de widgets |
| S04 (Enlaces) | ★★★☆☆ | Enlaces a reportes detallados |
| S06 (Complejidad) | ★★★★☆ | Densidad de información |

## 🔧 Configuraciones Recomendadas

### Configuración Conservadora (Banca/Finanzas)
```json
{
  "UMBRAL_CAMPOS_FORMULARIO": 5,
  "MAX_DISTANCIA_VERTICAL": 30,
  "MAX_DESVIACION_HORIZONTAL": 8,
  "MAX_PASOS_FLOW": 20,
  "strictMode": true
}
```

### Configuración Balanceada (SaaS General)
```json
{
  "UMBRAL_CAMPOS_FORMULARIO": 8,
  "MAX_DISTANCIA_VERTICAL": 40,
  "MAX_DESVIACION_HORIZONTAL": 10,
  "MAX_PASOS_FLOW": 30,
  "strictMode": false
}
```

### Configuración Flexible (Prototipado Rápido)
```json
{
  "UMBRAL_CAMPOS_FORMULARIO": 12,
  "MAX_DISTANCIA_VERTICAL": 60,
  "MAX_DESVIACION_HORIZONTAL": 20,
  "MAX_PASOS_FLOW": 50,
  "strictMode": false
}
```

## 📈 Métricas de Éxito

### KPIs Recomendados

- **Reducción de Smells**: % de smells resueltos por iteración
- **Tiempo de Detección**: Tiempo promedio para identificar problemas
- **Precisión**: Ratio de verdaderos positivos vs falsos positivos
- **Adopción**: % de diseñadores usando el plugin regularmente

### Benchmarking

| Métrica | Proyecto Pequeño | Proyecto Mediano | Proyecto Grande |
|---------|------------------|------------------|-----------------|
| Smells por página | < 3 | < 5 | < 8 |
| Tiempo de análisis | < 10s | < 30s | < 60s |
| Falsos positivos | < 10% | < 15% | < 20% |

## 🎓 Tutoriales Disponibles

### Para Principiantes
1. **[Getting Started](tutorials/getting-started.md)** - Primeros pasos con el plugin
2. **[Interpretar Resultados](tutorials/interpreting-results.md)** - Cómo leer y actuar sobre los hallazgos
3. **[Configuración Básica](tutorials/basic-configuration.md)** - Ajustar settings para tu proyecto

### Para Usuarios Avanzados
1. **[Workflow Integration](tutorials/workflow-integration.md)** - Integrar en procesos de diseño
2. **[Custom Data Types](tutorials/custom-data-types.md)** - Crear tipos de datos específicos
3. **[Batch Analysis](tutorials/batch-analysis.md)** - Análisis de múltiples archivos

### Para Desarrolladores
1. **[Extending Detectors](tutorials/extending-detectors.md)** - Crear detectores personalizados
2. **[API Usage](tutorials/api-usage.md)** - Usar la API programáticamente
3. **[Plugin Architecture](tutorials/plugin-architecture.md)** - Entender la arquitectura interna

## 🔗 Enlaces Útiles

### Figma Community
- [Plugin en Figma Community](https://www.figma.com/community/plugin/[plugin-id])
- [Plantillas de ejemplo](https://www.figma.com/community/search?model_type=hub_files&q=usability%20testing)

### Recursos Académicos
- [Paper original sobre Usability Smells](https://ejemplo.com/paper)
- [Heurísticas de Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [ISO 9241-11 Usability](https://www.iso.org/standard/63500.html)

### Herramientas Complementarias
- [Stark (Accesibilidad)](https://www.figma.com/community/plugin/732603254453395948)
- [Design Lint](https://www.figma.com/community/plugin/801195587640428208)
- [A11y - Color Contrast Checker](https://www.figma.com/community/plugin/733159460536249875)

## 📝 Contribuir Ejemplos

¿Tienes un caso de uso interesante? ¡Nos encantaría incluirlo!

### Formato de Contribución

1. **Documento de caso de uso** siguiendo la plantilla
2. **Capturas de pantalla** del antes/después
3. **Configuración específica** usada
4. **Métricas de mejora** si están disponibles

### Plantilla de Caso de Uso

```markdown
# Título del Caso de Uso

## Contexto
- **Industria**: [E-commerce/Banca/SaaS/etc.]
- **Tipo de proyecto**: [Web/Mobile/Desktop]
- **Equipo**: [Tamaño del equipo de diseño]

## Problema Inicial
- Descripción del problema de usabilidad
- Detectores que lo identificaron
- Impacto estimado

## Solución Aplicada
- Cambios realizados
- Configuración del plugin usada
- Tiempo invertido

## Resultados
- Métricas antes/después
- Feedback del equipo
- Lecciones aprendidas

## Archivos de Ejemplo
- [Enlace al prototipo original]
- [Enlace al prototipo optimizado]
- [Configuración JSON utilizada]
```

## 📞 Soporte

¿Necesitas ayuda con un caso específico?

- **GitHub Issues**: Para reportar problemas con ejemplos
- **Discussions**: Para discutir casos de uso
- **Email**: Para consultas privadas sobre implementación

---

⭐ **¡Marca este repositorio con una estrella si estos ejemplos te resultan útiles!**