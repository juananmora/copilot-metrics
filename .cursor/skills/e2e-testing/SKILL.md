---
name: e2e-testing
description: Ejecuta pruebas end-to-end completas del Copilot Metrics Portal usando MCP browser. Navega todas las secciones, valida funcionalidad, accesibilidad y performance. Genera informe de calidad en Markdown con resultados detallados. Usar cuando el usuario pida testear la aplicación, ejecutar E2E, validar el portal, o verificar que todo funciona correctamente.
---

# E2E Testing - Copilot Metrics Portal

Skill para ejecutar pruebas end-to-end automatizadas del portal con generación de informe de calidad.

## ⚠️ FLUJO OBLIGATORIO - SEGUIR EN ORDEN

```
┌─────────────────────────────────────────────────────────────────┐
│  PASO 1: EXPLORACIÓN CON MCP BROWSER (PRIORITARIO)             │
│  ─────────────────────────────────────────────────────────────  │
│  ANTES de generar código de tests, SIEMPRE usar el MCP         │
│  Chrome DevTools para explorar la aplicación en vivo.          │
│                                                                 │
│  1. Verificar puerto del servidor (ver terminal)               │
│  2. Navegar a cada sección con navigate_page                   │
│  3. Capturar snapshots con take_snapshot                       │
│  4. Tomar screenshots con take_screenshot                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASO 2: ANÁLISIS DE PERFORMANCE CON MCP                       │
│  ─────────────────────────────────────────────────────────────  │
│  Usar Chrome DevTools MCP para obtener métricas:                │
│                                                                 │
│  1. performance_start_trace con reload=true, autoStop=true     │
│  2. performance_analyze_insight para cada insight              │
│  3. Documentar: LCP, CLS, TTFB, DOM size, render blocking      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASO 3: ANÁLISIS DE ACCESIBILIDAD                              │
│  ─────────────────────────────────────────────────────────────  │
│  Analizar desde los snapshots:                                  │
│                                                                 │
│  - ¿Hay exactamente un <h1> por página?                         │
│  - ¿Los headings siguen jerarquía (h1 > h2 > h3)?               │
│  - ¿Todas las <img> tienen alt?                                 │
│  - ¿Todos los <button> tienen texto o aria-label?               │
│  - ¿Los links tienen texto descriptivo?                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASO 4: EJECUTAR TESTS PLAYWRIGHT                              │
│  ─────────────────────────────────────────────────────────────  │
│  cd copilot-metrics-portal                                      │
│  npx playwright test                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASO 5: GENERAR INFORME DE CALIDAD (OBLIGATORIO)              │
│  ─────────────────────────────────────────────────────────────  │
│  Crear archivo: docs/e2e-reports/quality-report.md              │
│  Con TODOS los datos recopilados en pasos anteriores            │
└─────────────────────────────────────────────────────────────────┘
```

---

## PASO 1: Exploración con MCP Chrome DevTools

### 1.1 Verificar Servidor

```
Checklist de Inicio:
- [ ] Verificar que el servidor de desarrollo está corriendo (npm run dev)
- [ ] Confirmar puerto en terminal (normalmente 3000 o 3001)
- [ ] Crear directorio de reportes: docs/e2e-reports/
```

### 1.2 Comandos MCP para Exploración

```javascript
// 1. Listar páginas existentes
CallMcpTool('user-Chrome DevTools', 'list_pages', {});

// 2. Navegar a la aplicación
CallMcpTool('user-Chrome DevTools', 'navigate_page', {
  url: 'http://localhost:3000/'  // Verificar puerto correcto
});

// 3. Capturar snapshot - ANALIZAR ESTRUCTURA
CallMcpTool('user-Chrome DevTools', 'take_snapshot', {});
// → Identificar: headings, imágenes, links, botones, navegación

// 4. Capturar screenshot visual
CallMcpTool('user-Chrome DevTools', 'take_screenshot', {});

// 5. Navegar a cada sección y repetir
```

### 1.3 Secciones a Explorar

| Sección | URL | Elementos a Verificar |
|---------|-----|----------------------|
| Overview | / | KPIs, gráficos, navegación |
| Pull Requests | /pull-requests | Tablas, filtros, paginación |
| Custom Agents | /agents | Charts, métricas |
| Usuarios | /users | Rankings, búsqueda |
| Executive | /executive | ROI, métricas ejecutivas |
| Settings | /settings | Formularios, configuración |

---

## PASO 2: Análisis de Performance con MCP

### 2.1 Iniciar Trace de Performance

```javascript
// Iniciar trace con recarga de página
CallMcpTool('user-Chrome DevTools', 'performance_start_trace', {
  reload: true,
  autoStop: true
});
```

### 2.2 Analizar Insights

```javascript
// Analizar cada insight disponible
CallMcpTool('user-Chrome DevTools', 'performance_analyze_insight', {
  insightSetId: 'NAVIGATION_0',
  insightName: 'RenderBlocking'  // o DOMSize, LCPBreakdown, etc.
});
```

### 2.3 Métricas a Documentar

| Métrica | Umbral Bueno | Umbral Aceptable |
|---------|--------------|------------------|
| LCP | < 2,500 ms | < 4,000 ms |
| CLS | < 0.1 | < 0.25 |
| TTFB | < 800 ms | < 1,800 ms |
| FCP | < 1,800 ms | < 3,000 ms |

### 2.4 Estructura de Datos de Performance

```typescript
interface PerformanceData {
  LCP: { value: number; status: 'good' | 'needs-improvement' | 'poor' };
  CLS: { value: number; status: string };
  TTFB: { value: number; status: string };
  domSize: { elements: number; depth: number; maxChildren: number };
  renderBlocking: { resources: string[]; impact: string };
}
```

---

## PASO 3: Análisis de Accesibilidad

### 3.1 Checklist desde Snapshots

```
Para cada sección, verificar en el snapshot:

□ Headings
  - ¿Exactamente un H1? (considerar header + contenido)
  - ¿Jerarquía correcta? (h1 > h2 > h3, sin saltos)
  
□ Imágenes
  - ¿Todas tienen atributo alt?
  - ¿Alt es descriptivo?

□ Botones
  - ¿Tienen texto visible o aria-label?
  - ¿Botones de iconos tienen aria-label?

□ Links
  - ¿Tienen texto descriptivo?
  - ¿Evitan "click aquí" o "más info"?

□ Formularios
  - ¿Inputs tienen labels asociados?
  - ¿Errores son accesibles?
```

### 3.2 Issues Comunes a Detectar

| Issue | WCAG | Severidad |
|-------|------|-----------|
| Múltiples H1 | 1.3.1 | Moderada |
| Imagen sin alt | 1.1.1 | Alta |
| Botón sin texto/label | 1.1.1 | Media |
| Link sin texto | 2.4.4 | Media |
| Bajo contraste | 1.4.3 | Alta |

---

## PASO 4: Ejecutar Tests Playwright

### 4.1 Comando de Ejecución

```bash
cd copilot-metrics-portal
npx playwright test
```

**⚠️ IMPORTANTE:** Ejecutar SIEMPRE desde `copilot-metrics-portal`, NO desde el directorio raíz.

### 4.2 Configuración en playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  reporter: [
    ['html', { outputFolder: 'docs/e2e-reports', open: 'never' }],
    ['json', { outputFile: 'docs/e2e-reports/results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000', // Ajustar puerto
    screenshot: 'on',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
```

---

## PASO 5: Generar Informe de Calidad (OBLIGATORIO)

### 5.1 Archivo de Salida

**Ubicación:** `docs/e2e-reports/quality-report.md`

### 5.2 Estructura del Informe

```markdown
# Informe de Calidad - Copilot Metrics Portal

**Fecha:** [fecha actual]
**URL base:** [url del servidor]

---

## Resumen Ejecutivo

| Categoría | Puntuación | Estado |
|-----------|------------|--------|
| Performance | XX/100 | [BUENO/MODERADO/MALO] |
| Accesibilidad | XX/100 | [BUENO/MODERADO/MALO] |
| Funcionalidad | XX/100 | [BUENO/MODERADO/MALO] |
| Responsive | XX/100 | [BUENO/MODERADO/MALO] |

---

## 1. Performance

### 1.1 Core Web Vitals
[Tabla con LCP, CLS, TTFB]

### 1.2 Tiempos de Carga por Sección
[Tabla con tiempos]

### 1.3 Issues Detectados
[Lista de issues con severidad y recomendación]

---

## 2. Accesibilidad

### 2.1 Puntuación WCAG
[Tabla con criterios]

### 2.2 Issues Detectados
[Lista con severidad, WCAG, descripción, recomendación]

### 2.3 Checks Pasados
[Lista de verificaciones correctas]

---

## 3. Tests E2E

### 3.1 Resumen
[Total pasados/fallidos/omitidos]

### 3.2 Resultados por Feature
[Tabla con cada test y su resultado]

---

## 4. Recomendaciones
[Lista priorizada de mejoras]

---

## 5. Conclusión
[Veredicto final: APROBADO/RECHAZADO]
```

### 5.3 Criterios de Puntuación

| Puntuación | Rango | Significado |
|------------|-------|-------------|
| EXCELENTE | 90-100 | Sin issues, cumple todos los criterios |
| BUENO | 75-89 | Issues menores, funcional |
| MODERADO | 50-74 | Issues que requieren atención |
| MALO | 0-49 | Issues críticos, requiere corrección |

---

## Archivos de Salida

```
docs/e2e-reports/
├── quality-report.md       # Informe completo (PRINCIPAL)
├── index.html              # Informe HTML Playwright
├── results.json            # Resultados JSON
├── mcp-analysis.json       # Datos MCP
└── data/
    └── *.png               # Screenshots
```

---

## Resumen del Flujo

```
Usuario pide: "haz las pruebas del portal" / "revisa la calidad"

1. ✅ Verificar servidor corriendo (ver terminal)
2. ✅ USAR MCP navigate_page a página principal
3. ✅ USAR MCP take_snapshot para ver estructura
4. ✅ USAR MCP performance_start_trace para métricas
5. ✅ USAR MCP performance_analyze_insight
6. ✅ NAVEGAR cada sección con MCP, analizar snapshots
7. ✅ DETECTAR issues de accesibilidad en snapshots
8. ✅ EJECUTAR tests: npx playwright test
9. ✅ GENERAR quality-report.md con TODOS los datos
10. ✅ MOSTRAR resumen al usuario
```

---

## Recursos

- Patrones de test: [test-patterns.md](test-patterns.md)
- Checks accesibilidad: [accessibility-checks.md](accessibility-checks.md)
- Template informe: [templates/quality-report-template.md](templates/quality-report-template.md)
