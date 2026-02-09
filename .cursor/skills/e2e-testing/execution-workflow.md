# Workflow de Ejecución E2E

Guía paso a paso para ejecutar las pruebas E2E del Copilot Metrics Portal.

## Pre-requisitos

### Verificar Servidor de Desarrollo

```bash
# El servidor debe estar corriendo en http://localhost:5173
# Si no está corriendo:
cd copilot-metrics-portal
npm run dev
```

### Verificar MCP Browser Disponible

El MCP `cursor-ide-browser` debe estar habilitado. Comandos disponibles:
- `browser_navigate`
- `browser_lock`
- `browser_unlock`
- `browser_snapshot`
- `browser_click`
- `browser_fill`
- `browser_wait`
- `browser_tabs`

## Fase 1: Inicialización

### 1.1 Crear Directorio de Reportes

```javascript
// Crear estructura de directorios si no existe
docs/
  e2e-reports/
    gherkin/
```

### 1.2 Inicializar Objeto de Resultados

```javascript
const results = {
  timestamp: new Date().toISOString(),
  baseUrl: 'http://localhost:5173',
  sections: [],
  summary: {}
};
```

## Fase 2: Descubrimiento de Secciones

### 2.1 Navegar a Página Principal

```javascript
// MCP: Navegar a la aplicación
await CallMcpTool('cursor-ide-browser', 'browser_navigate', {
  url: 'http://localhost:5173'
});

// Esperar carga inicial
await CallMcpTool('cursor-ide-browser', 'browser_wait', {
  timeout: 2000
});
```

### 2.2 Capturar Snapshot del Menú

```javascript
// MCP: Obtener snapshot de la página
const snapshot = await CallMcpTool('cursor-ide-browser', 'browser_snapshot');

// Analizar snapshot para encontrar elementos de navegación:
// - Buscar <nav>, <aside>, elementos con role="navigation"
// - Extraer links <a href="/...">
// - Identificar items de menú
```

### 2.3 Mapear Secciones

Secciones típicas a buscar:
- `/` - Dashboard Principal
- `/dashboard` - Dashboard (si es diferente)
- `/teams` - Equipos
- `/users` - Usuarios
- `/settings` - Configuración
- `/reports` - Reportes

```javascript
const sections = [
  { name: 'Dashboard', url: '/' },
  { name: 'Teams', url: '/teams' },
  { name: 'Users', url: '/users' },
  // ... más secciones descubiertas
];
```

## Fase 3: Ejecución de Tests por Sección

Para cada sección descubierta:

### 3.1 Test de Funcionalidad

```javascript
// 1. Navegar a la sección
await browser_navigate({ url: baseUrl + section.url });
await browser_lock();

// 2. Medir tiempo de carga
const startTime = Date.now();
await browser_wait({ timeout: 500 });
const loadSnapshot = await browser_snapshot();
const loadTime = (Date.now() - startTime) / 1000;

// 3. Verificar elementos principales
const tests = [];

// Test: Página carga sin errores
tests.push({
  name: 'Página carga correctamente',
  status: hasContent(loadSnapshot) ? 'passed' : 'failed',
  gherkin: generateGherkin('carga', section)
});

// Test: Título visible
tests.push({
  name: 'Título de sección visible',
  status: hasHeading(loadSnapshot, section.name) ? 'passed' : 'failed',
  gherkin: generateGherkin('titulo', section)
});

// Test: Contenido principal
tests.push({
  name: 'Contenido principal renderiza',
  status: hasMainContent(loadSnapshot) ? 'passed' : 'failed',
  gherkin: generateGherkin('contenido', section)
});

// 4. Probar interacciones básicas
// - Click en botones
// - Hover en elementos interactivos
// - Validar respuesta

await browser_unlock();
```

### 3.2 Test de Accesibilidad

```javascript
// Analizar snapshot para accesibilidad
const a11yIssues = [];

// Check 1: Estructura de headings
const headings = extractHeadings(snapshot);
if (!hasValidHeadingHierarchy(headings)) {
  a11yIssues.push({
    severity: 'serious',
    description: 'Jerarquía de headings incorrecta',
    element: headings.join(' -> '),
    criterion: 'WCAG 1.3.1'
  });
}

// Check 2: Imágenes con alt
const imagesWithoutAlt = findImagesWithoutAlt(snapshot);
if (imagesWithoutAlt.length > 0) {
  a11yIssues.push({
    severity: 'critical',
    description: `${imagesWithoutAlt.length} imágenes sin texto alternativo`,
    element: imagesWithoutAlt[0],
    criterion: 'WCAG 1.1.1'
  });
}

// Check 3: Botones con labels
const buttonsWithoutLabels = findButtonsWithoutLabels(snapshot);
if (buttonsWithoutLabels.length > 0) {
  a11yIssues.push({
    severity: 'serious',
    description: 'Botones sin texto o aria-label',
    element: buttonsWithoutLabels[0],
    criterion: 'WCAG 4.1.2'
  });
}

// Check 4: Inputs con labels
const inputsWithoutLabels = findInputsWithoutLabels(snapshot);
// ... continuar con más checks
```

### 3.3 Test de Performance

```javascript
const performance = {
  loadTime: loadTime, // Calculado anteriormente
  renderTime: measureRenderTime(loadSnapshot),
  domElements: countDomElements(loadSnapshot),
  warnings: []
};

// Evaluar métricas
if (loadTime > 3) {
  performance.warnings.push('Tiempo de carga superior a 3 segundos');
}

if (performance.domElements > 1500) {
  performance.warnings.push('Número elevado de elementos DOM');
}
```

### 3.4 Consolidar Resultados de Sección

```javascript
results.sections.push({
  name: section.name,
  url: section.url,
  functionality: {
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    tests: tests
  },
  accessibility: {
    passed: totalA11yChecks - a11yIssues.length,
    failed: a11yIssues.length,
    issues: a11yIssues
  },
  performance: performance
});
```

## Fase 4: Generación de Informe

### 4.1 Calcular Resumen

```javascript
results.summary = {
  totalSections: results.sections.length,
  totalTests: sumTests(results.sections),
  totalPassed: sumPassed(results.sections),
  totalFailed: sumFailed(results.sections),
  passRate: calculatePassRate(results.sections),
  totalA11yIssues: sumA11yIssues(results.sections),
  avgLoadTime: calculateAvgLoadTime(results.sections)
};
```

### 4.2 Generar Archivo JSON

```javascript
// Guardar resultados en JSON
const jsonPath = `docs/e2e-reports/results-${timestamp}.json`;
writeFile(jsonPath, JSON.stringify(results, null, 2));
```

### 4.3 Generar Informe HTML

```javascript
// Usar el script de generación
node scripts/generate-report.js results.json docs/e2e-reports/e2e-report-{timestamp}.html

// O generar manualmente:
// 1. Leer template
// 2. Reemplazar placeholders
// 3. Escribir HTML
```

### 4.4 Generar Archivo Gherkin

```javascript
// Archivo: docs/e2e-reports/gherkin/all-features.feature
let gherkin = `# E2E Test Cases - Copilot Metrics Portal
# Generated: ${timestamp}

`;

results.sections.forEach(section => {
  gherkin += `Feature: ${section.name}\n`;
  gherkin += `  Como usuario del portal\n`;
  gherkin += `  Quiero acceder a ${section.name}\n`;
  gherkin += `  Para ver las métricas correspondientes\n\n`;
  
  section.functionality.tests.forEach(test => {
    gherkin += test.gherkin + '\n\n';
  });
});

writeFile('docs/e2e-reports/gherkin/all-features.feature', gherkin);
```

## Fase 5: Resumen al Usuario

Mostrar al usuario:

```
📊 E2E Test Report - Copilot Metrics Portal
============================================

Secciones testeadas: X
Tests ejecutados: XX
✅ Passed: XX (XX%)
❌ Failed: XX

🔍 Accesibilidad:
   Issues encontrados: X
   - Critical: X
   - Serious: X
   - Moderate: X

⚡ Performance:
   Tiempo promedio de carga: X.XXs
   Secciones lentas (>3s): X

📁 Archivos generados:
   - docs/e2e-reports/e2e-report-{timestamp}.html
   - docs/e2e-reports/gherkin/all-features.feature
   - docs/e2e-reports/results-{timestamp}.json

🔗 Abre el informe HTML para ver detalles completos.
```

## Troubleshooting

### El servidor no está corriendo

```bash
# En otra terminal:
cd copilot-metrics-portal
npm run dev
```

### MCP browser no responde

1. Verificar que Chrome está instalado
2. Reiniciar Cursor
3. Verificar que el MCP está habilitado en settings

### Snapshot vacío

```javascript
// Aumentar tiempo de espera
await browser_wait({ timeout: 3000 });

// Verificar que la URL es correcta
await browser_tabs({ action: 'list' });
```

### Elementos no encontrados

1. Verificar selectores en el snapshot
2. Aumentar tiempo de espera para cargas asíncronas
3. Verificar que el contenido no está en un iframe
