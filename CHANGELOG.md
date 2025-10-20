# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [Sin liberar]

### Agregado
- Documentación completa del repositorio para GitHub
- CI/CD pipeline con GitHub Actions
- Configuración de desarrollo con ESLint y Prettier

## [1.0.0] - 2024-12-30

### Agregado
- Plugin Simple Smells Detector para Figma
- 7 detectores de usability smells implementados:
  - **S01**: Detección de campos con ancho inadecuado
  - **S02**: Análisis de inconsistencias dimensionales
  - **S03**: Identificación de campos sin formato estructural
  - **S04**: Detección de enlaces confusos o ambiguos
  - **S05**: Identificación de valores limitados como texto libre
  - **S06**: Análisis de complejidad excesiva en formularios
  - **S07**: Detección de flujos lineales demasiado extensos

### Características Principales
- **Arquitectura modular** con motor de análisis extensible
- **Sistema de configuración** con presets por industria
- **Interfaz de usuario intuitiva** con pestañas organizadas
- **Sistema de ignorados persistente** para excepciones de usuario
- **Exportación de resultados** en formato CSV y Markdown
- **Configuraciones personalizables** por proyecto
- **Soporte multiidioma** (Español/Inglés)

### Utilidades del Motor de Análisis
- **Geometry Utils**: Cálculos geométricos y agrupación por proximidad
- **Semantic Utils**: Análisis semántico y normalización de texto
- **Node Filters**: Filtros especializados para identificación de elementos
- **Flow Analysis**: Análisis de flujos de prototipo

### Presets de Configuración
- **E-commerce**: Configuración optimizada para tiendas online
- **Banca**: Settings conservadores para aplicaciones financieras
- **SaaS**: Configuración balanceada para aplicaciones web generales
- **Personalizada**: Configuración completamente customizable

### Integración y Extensibilidad
- **API de extensión** para desarrolladores
- **Tipos de datos personalizados** configurables
- **Sistema de registro** para nuevos detectores
- **Documentación técnica** completa

### Documentación
- **README comprehensivo** con guía de instalación y uso
- **Documentación técnica** de arquitectura y API
- **Guía de contribución** para desarrolladores
- **Ejemplos y casos de uso** por industria
- **Tutoriales paso a paso**

### Configuración de Desarrollo
- **Package.json** con scripts de desarrollo
- **ESLint** configurado para plugins de Figma
- **Prettier** para formateo consistente de código
- **GitHub Actions** para CI/CD automatizado

## Tipos de Cambios

- `Agregado` para nuevas funcionalidades.
- `Cambiado` para cambios en funcionalidad existente.
- `Deprecado` para funcionalidades que serán removidas en versiones futuras.
- `Removido` para funcionalidades removidas en esta versión.
- `Solucionado` para corrección de bugs.
- `Seguridad` en caso de vulnerabilidades.

## Roadmap

### v1.1.0 - Próxima versión menor
- **S08**: Detector de labels ausentes o lejanos
- **S09**: Detector de desalineación horizontal
- **S10**: Detector de espaciado vertical inconsistente
- Mejoras en precisión de detectores existentes
- Soporte para temas oscuros en la UI

### v1.2.0 - Funcionalidades avanzadas
- **Sistema de plantillas** para diferentes tipos de proyectos
- **Análisis batch** de múltiples archivos
- **Integración con herramientas de design systems**
- **Métricas de rendimiento** y analytics

### v2.0.0 - Próxima versión mayor
- **Detectores basados en IA** para análisis semántico avanzado
- **Soporte para accesibilidad** (WCAG compliance)
- **API REST** para integración con herramientas externas
- **Sistema de reportes** avanzado con métricas visuales

## Contribuciones

Este proyecto es resultado de una investigación académica sobre **detección temprana y automatizada de usability smells en prototipos de interfaces digitales**.

### Reconocimientos
- Basado en investigación sobre taxonomías de usability smells
- Inspirado en trabajos previos sobre refactorización de UX
- Fundamentado en estándares internacionales de usabilidad (ISO 9241-11, ISO/IEC 25010)

### Referencias Académicas
- Grigera, J., et al. (2017). "Automatic Detection of Usability Smells in Web Applications"
- Garrido, A., Rossi, G., & Distante, D. (2010). "Refactoring for Usability in Web Applications"
- Nielsen, J., & Molich, R. (1990). "Heuristic evaluation of user interfaces"

## Soporte

### Reportar Issues
- **Bugs**: Usar la plantilla de bug report
- **Features**: Usar la plantilla de feature request
- **Documentación**: Para mejoras en docs

### Comunicación
- **GitHub Issues**: Para bugs y features
- **GitHub Discussions**: Para preguntas generales
- **Email**: Para consultas privadas

### Links Útiles
- [Documentación completa](docs/)
- [Guía de contribución](CONTRIBUTING.md)
- [Ejemplos y casos de uso](examples/)
- [API Reference](docs/api.md)

---

## Notas de Desarrollo

### Versionado
- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Funcionalidades nuevas compatibles hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

### Proceso de Release
1. Actualizar version en `manifest.json` y `package.json`
2. Actualizar `CHANGELOG.md` con los cambios
3. Crear tag con `git tag v1.x.x`
4. Push tags con `git push --tags`
5. GitHub Actions automáticamente:
   - Ejecuta tests y validaciones
   - Crea package del plugin
   - Genera release en GitHub

### Mantenimiento
- **Releases menores**: Cada 2-3 meses
- **Patches críticos**: Según sea necesario
- **Releases mayores**: Anualmente o según cambios significativos

---

**Para más información, consulta la [documentación completa](README.md) o abre un [issue](../../issues) si tienes preguntas.**