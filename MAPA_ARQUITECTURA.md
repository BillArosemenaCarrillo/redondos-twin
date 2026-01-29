# MAPA DE ARQUITECTURA: REDONDOS VANGUARD 🗺️🦾

Este documento describe la estructura del software para que cualquier desarrollador o IA pueda navegar el proyecto eficientemente.

## 📂 Directorio Raíz: `src/components/`

### 1. Núcleo del Mapa (`Map/`)
- **[MapLibreViewerFixed.tsx](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/src/components/Map/MapLibreViewerFixed.tsx):** 
    - El archivo más importante. Contiene el motor de MapLibre GL.
    - **Breach Engine:** Lógica de detección de colisiones espaciales (Point-in-Polygon).
    - **Simulaciones:** Loops de animación para camiones y personal.
    - **HUD:** Interfaz de usuario flotante sobre el mapa.
- **[ThreeLayer.ts](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/src/components/Map/ThreeLayer.ts):** 
    - Puente entre MapLibre y Three.js. Renderiza objetos 3D personalizados sobre el mapa.

### 2. Dashboards Especializados (`Dashboard/`)
- **[GestorDashboard.tsx](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/src/components/Dashboard/GestorDashboard.tsx):** Tablas de KPI, estado de lotes y productividad general.
- **[ClimateDashboard.tsx](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/src/components/Dashboard/ClimateDashboard.tsx):** Inteligencia ambiental (NH3, Temperatura, CO2).
- **[FeedingDashboard.tsx](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/src/components/Dashboard/FeedingDashboard.tsx):** Control de alimentación, ICA (Índice de Conversión) y niveles de Silos.
- **[BiosecurityDashboard.tsx](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/src/components/Dashboard/BiosecurityDashboard.tsx):** Registro de infracciones en zonas rojas y cumplimiento de protocolos sanitarios.
- **[ResourceDashboard.tsx](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/src/components/Dashboard/ResourceDashboard.tsx):** Monitoreo de lagunas, energía solar y red hídrica.

### 3. Navegación y Estructura (`Navigation/` & `UI/`)
- **[Sidebar.tsx](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/src/components/Navigation/Sidebar.tsx):** Barra lateral de navegación que controla el estado de las secciones activas.
- **[HomePageClient.tsx](file:///c:/Users/User/.gemini/antigravity/scratch/redondos-twin/src/app/HomePageClient.tsx):** Wrapper principal que orquestra el layout `Sidebar + Map + Active Dashboard`.

---

## 🔧 Lógica Crítica a Revisar
1. **Punto de Colisión (Breach Engine):** Se encuentra en la función `isPointInPolygon` dentro de `MapLibreViewerFixed.tsx`.
2. **Sincronización Reactiva:** Se utilizan `useEffect` con `Refs` en el mapa para evitar el "stale state" durante las animaciones.
3. **Persistencia del Mapa:** El mapa se mantiene montado con `hidden` para no perder el contexto (zoom/posición) al navegar.
