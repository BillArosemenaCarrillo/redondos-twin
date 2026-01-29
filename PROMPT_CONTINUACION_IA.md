# CONTEXTO PARA CONTINUACIÓN: GEMELO DIGITAL "REDONDOS VANGUARD"

Hola Antigravity. Estoy retomando el desarrollo de un **Gemelo Digital Industrial** para el sector agropecuario (Granja Redondos). El proyecto tiene una base técnica sólida y ya hemos completado las primeras 3 fases de software. Necesito que leas este contexto y el código fuente para continuar con la **Fase 2.5 (Integración Hardware IoT)** y la **Fase 4 (IA & Bienestar Animal)**.

## 🛠️ Stack Tecnológico Actual
- **Framework:** Next.js 16.1.4 (Turbopack).
- **Mapa 3D:** MapLibre GL con capas personalizadas (Fill-Extrusion, GeoJSON, Three.js).
- **Lógica Espacial:** Breach Engine personalizado (Point-in-Polygon).

## 🗺️ Guia de Archivos (IMPORTANTE)
Antes de empezar, lee el archivo **[MAPA_ARQUITECTURA.md](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/MAPA_ARQUITECTURA.md)**. Allí detallo para qué sirve cada componente. Los archivos clave son:
- **MapLibreViewerFixed.tsx:** Motor central y Breach Engine.
- **ResourceDashboard.tsx:** Gestión de sostenibilidad.
- **BiosecurityDashboard.tsx:** Seguridad perimetral.

## 🏆 Hitos Logrados (Resumen para el nuevo Chat)
1. **Logística Viva:** Simulación de camiones con tracking GPS en tiempo real.
2. **Dashboard de Gestor:** Tablas de productividad, curvas de NH3 y niveles de silos (ICA optimizado).
3. **Biosecurity 360:** Zonas rojas editables en el mapa con alertas automáticas si camiones, personal o bloques BIM entran en áreas prohibidas.
4. **Smart Resources:** Monitorización de lagunas de oxidación (3D), paneles solares y presión hídrica.

## 🚀 Próximos Pasos (Donde debemos iniciar)
1. **Fase 2.5: Hardware Real (ESP32):** Necesitamos integrar el esquema de compra e integración de sensores físicos (Puertas, Luces, Alares) con el Twin.
2. **Fase 4: IA de Bienestar Animal:** Implementar simulación de toses (detección acústica) y heatmaps térmicos.
3. **Despliegue & Escalabilidad:** Preparar el sistema para múltiples sedes.
4. **Infraestructura Cloud (AWS):** Definir la estrategia de migración a AWS para el escalamiento industrial (IoT Core, S3 para modelos IFC, Lambda para analítica).

**OBJETIVO ACTUAL:** Diseñar la estrategia de integración física de sensores ESP32 y continuar expandiendo la inteligencia del gemelo digital, manteniendo la visión de una futura arquitectura en AWS. 👋🦾💎🚧
