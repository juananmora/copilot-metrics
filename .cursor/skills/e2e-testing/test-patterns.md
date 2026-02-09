# Patrones de Test E2E

Referencia de patrones comunes para pruebas end-to-end del portal.

## Patrones de Funcionalidad

### 1. Carga de Página

```gherkin
Scenario: Carga correcta de {sección}
  Given que el servidor está corriendo
  When navego a "{url}"
  Then la página carga sin errores
  And el título contiene "{texto_esperado}"
  And no hay errores en consola
```

**Implementación MCP:**
```javascript
// 1. Navegar
await browser_navigate({ url: baseUrl + path });
await browser_lock();
await browser_wait({ timeout: 2000 });

// 2. Snapshot y verificar
const snapshot = await browser_snapshot();

// 3. Buscar elementos esperados en el snapshot
// - Verificar título de página
// - Verificar header visible
// - Verificar contenido principal
```

### 2. Navegación entre Secciones

```gherkin
Scenario: Navegación desde {origen} a {destino}
  Given que estoy en "{origen_url}"
  When hago click en el link "{texto_link}"
  Then la URL cambia a "{destino_url}"
  And la sección "{destino}" se muestra correctamente
```

**Implementación MCP:**
```javascript
// 1. Snapshot para obtener refs de links
const snapshot = await browser_snapshot();

// 2. Encontrar el elemento del menú
const menuItem = findElementByText(snapshot, 'Teams');

// 3. Click en el elemento
await browser_click({ ref: menuItem.ref });
await browser_wait({ timeout: 1500 });

// 4. Verificar nueva página
const newSnapshot = await browser_snapshot();
// Verificar URL y contenido
```

### 3. Carga de Datos API

```gherkin
Scenario: Datos del dashboard se cargan correctamente
  Given que estoy en el dashboard
  When la página termina de cargar
  Then las KPI cards muestran valores numéricos
  And los gráficos renderizan datos
  And no hay mensajes de error de API
```

**Verificaciones:**
- Cards muestran números (no "Loading..." o "Error")
- Gráficos tienen contenido SVG válido
- No hay elementos con clase "error" o "failed"

### 4. Interacción con Filtros

```gherkin
Scenario: Filtro de fechas funciona correctamente
  Given que estoy en "{sección}" con datos
  When selecciono rango de fechas "{rango}"
  Then los datos se actualizan
  And los valores reflejan el período seleccionado
```

### 5. Responsive Layout

```gherkin
Scenario: Layout responsive en {breakpoint}
  Given que el viewport es de {width}x{height}
  When navego a "{url}"
  Then el menú {se colapsa/se expande}
  And los elementos se reorganizan correctamente
  And no hay overflow horizontal
```

## Patrones de Accesibilidad

### 1. Estructura de Headings

```gherkin
Scenario: Jerarquía de headings correcta
  Given que estoy en "{sección}"
  Then existe exactamente un h1
  And los headings siguen orden jerárquico (h1 > h2 > h3)
  And no hay saltos de nivel (ej: h1 a h3 sin h2)
```

**Verificaciones:**
```javascript
// Extraer todos los headings del snapshot
const headings = extractHeadings(snapshot);

// Verificar:
// - Solo un h1
// - Secuencia correcta
// - Texto descriptivo en cada heading
```

### 2. Contraste de Color

```gherkin
Scenario: Contraste WCAG AA cumplido
  Given que estoy en "{sección}"
  Then el texto principal tiene ratio >= 4.5:1
  And el texto grande tiene ratio >= 3:1
  And los elementos interactivos son distinguibles
```

### 3. Etiquetas ARIA

```gherkin
Scenario: Elementos interactivos tienen labels accesibles
  Given que estoy en "{sección}"
  Then todos los botones tienen aria-label o texto visible
  And todos los inputs tienen labels asociados
  And las imágenes tienen alt text descriptivo
```

### 4. Navegación por Teclado

```gherkin
Scenario: Navegación completa por teclado
  Given que estoy en "{sección}"
  When navego usando Tab
  Then todos los elementos interactivos reciben foco
  And el orden de foco es lógico
  And el foco es visualmente distinguible
```

## Patrones de Performance

### 1. Tiempo de Carga

```gherkin
Scenario: Carga inicial rápida
  Given que el cache está limpio
  When navego a "{url}"
  Then la página es interactiva en < 3 segundos
  And el contenido principal es visible en < 2 segundos
```

**Medición:**
```javascript
const startTime = Date.now();
await browser_navigate({ url });
await browser_wait({ timeout: 500 });

// Verificar contenido visible
const snapshot = await browser_snapshot();
const loadTime = Date.now() - startTime;

// Criterios:
// - < 1.5s: Excelente (verde)
// - 1.5-3s: Aceptable (amarillo)
// - > 3s: Lento (rojo)
```

### 2. Lazy Loading

```gherkin
Scenario: Componentes cargan de forma diferida
  Given que estoy en una página con muchos gráficos
  When hago scroll hacia abajo
  Then los gráficos fuera de vista no se renderizan inicialmente
  And se cargan al entrar en el viewport
```

### 3. Re-renders Innecesarios

```gherkin
Scenario: Sin re-renders excesivos
  Given que la página está cargada
  When no hay interacción del usuario
  Then los componentes no se re-renderizan
  And el CPU permanece estable
```

## Patrones de Estado

### 1. Estado de Loading

```gherkin
Scenario: Loading state apropiado
  Given que los datos están cargando
  Then se muestra un indicador de carga
  And el indicador tiene accesibilidad (aria-busy, sr-only text)
  And desaparece cuando los datos cargan
```

### 2. Estado de Error

```gherkin
Scenario: Manejo de errores de API
  Given que la API devuelve un error
  Then se muestra un mensaje de error amigable
  And hay opción de reintentar
  And el error es accesible
```

### 3. Estado Vacío

```gherkin
Scenario: Estado sin datos
  Given que no hay datos para mostrar
  Then se muestra un mensaje explicativo
  And hay call-to-action si aplica
```

## Estructura de Test Suite

```gherkin
Feature: {Nombre de Sección}
  Como usuario del portal
  Quiero {objetivo}
  Para {beneficio}

  Background:
    Given el servidor de desarrollo está corriendo
    And el navegador está abierto

  @smoke
  Scenario: Carga básica
    ...

  @functionality
  Scenario: Interacción principal
    ...

  @accessibility
  Scenario: Cumplimiento WCAG
    ...

  @performance
  Scenario: Métricas de rendimiento
    ...
```

## Tags Recomendados

| Tag | Uso |
|-----|-----|
| `@smoke` | Tests críticos mínimos |
| `@functionality` | Tests funcionales completos |
| `@accessibility` | Tests de accesibilidad |
| `@performance` | Tests de rendimiento |
| `@regression` | Tests de regresión |
| `@wip` | Tests en desarrollo |
