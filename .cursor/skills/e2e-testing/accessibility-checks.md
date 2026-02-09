# Checklist de Accesibilidad - WCAG 2.1

Referencia de verificaciones de accesibilidad para el portal Copilot Metrics.

## Niveles de Severidad

| Nivel | Descripción | Acción |
|-------|-------------|--------|
| **CRITICAL** | Bloquea acceso a funcionalidad | Debe corregirse antes de deploy |
| **SERIOUS** | Dificulta significativamente el uso | Prioridad alta |
| **MODERATE** | Impacta experiencia pero hay alternativas | Prioridad media |
| **MINOR** | Mejora recomendada | Backlog |

## 1. Perceptibilidad

### 1.1 Alternativas de Texto

| Check | Criterio WCAG | Severidad | Cómo Verificar |
|-------|---------------|-----------|----------------|
| Imágenes con alt | 1.1.1 | CRITICAL | `<img>` debe tener `alt` descriptivo |
| Iconos decorativos | 1.1.1 | MODERATE | `aria-hidden="true"` si decorativo |
| SVGs accesibles | 1.1.1 | SERIOUS | `<title>` o `aria-label` en SVG |
| Gráficos con descripción | 1.1.1 | SERIOUS | Recharts debe tener labels accesibles |

**Verificación en Snapshot:**
```javascript
// Buscar imágenes sin alt
const imagesWithoutAlt = findElements(snapshot, 'img:not([alt])');

// Buscar iconos sin aria-hidden
const iconosNoOcultos = findElements(snapshot, 'svg:not([aria-hidden])');
```

### 1.2 Contenido Temporal

| Check | Criterio WCAG | Severidad | Cómo Verificar |
|-------|---------------|-----------|----------------|
| Animaciones pausables | 2.2.2 | MODERATE | `prefers-reduced-motion` respetado |
| Sin parpadeo excesivo | 2.3.1 | CRITICAL | No más de 3 flashes/segundo |
| Carousels controlables | 2.2.2 | SERIOUS | Controles de pausa visibles |

### 1.3 Contraste de Color

| Check | Criterio WCAG | Severidad | Ratio Mínimo |
|-------|---------------|-----------|--------------|
| Texto normal | 1.4.3 | SERIOUS | 4.5:1 |
| Texto grande (>18px bold) | 1.4.3 | SERIOUS | 3:1 |
| Componentes UI | 1.4.11 | SERIOUS | 3:1 |
| Texto sobre gradientes | 1.4.3 | SERIOUS | 4.5:1 en punto más bajo |

**Colores BBVA a Verificar:**
```
✅ #001891 sobre #FFFFFF → 11.2:1 (Excelente)
✅ #070E46 sobre #FFFFFF → 16.4:1 (Excelente)
✅ #04E26A sobre #001891 → 6.8:1 (AA)
⚠️ #5BBEFF sobre #FFFFFF → 2.5:1 (Insuficiente para texto pequeño)
✅ #FFFFFF sobre #001891 → 11.2:1 (Excelente)
```

## 2. Operabilidad

### 2.1 Teclado

| Check | Criterio WCAG | Severidad | Cómo Verificar |
|-------|---------------|-----------|----------------|
| Todo accesible por teclado | 2.1.1 | CRITICAL | Tab navega todos los elementos |
| Sin trampas de teclado | 2.1.2 | CRITICAL | Esc cierra modales |
| Orden de foco lógico | 2.4.3 | SERIOUS | Tab sigue orden visual |
| Indicador de foco visible | 2.4.7 | SERIOUS | Outline visible en :focus |
| Skip links | 2.4.1 | MODERATE | Link para saltar al contenido |

**Verificación de Foco:**
```javascript
// Verificar orden de tabulación
await browser_press_key({ key: 'Tab' });
const snapshot1 = await browser_snapshot();
// Verificar que el primer elemento interactivo tiene foco

// Verificar escape en modales
await browser_press_key({ key: 'Escape' });
// Modal debe cerrarse
```

### 2.2 Tiempo Suficiente

| Check | Criterio WCAG | Severidad | Cómo Verificar |
|-------|---------------|-----------|----------------|
| Sin timeouts forzados | 2.2.1 | SERIOUS | Sesión no expira sin aviso |
| Contenido que se mueve | 2.2.2 | MODERATE | Pausable, detener posible |

### 2.3 Navegación

| Check | Criterio WCAG | Severidad | Cómo Verificar |
|-------|---------------|-----------|----------------|
| Múltiples formas de navegar | 2.4.5 | MODERATE | Menú + breadcrumbs + search |
| Títulos descriptivos | 2.4.2 | SERIOUS | `<title>` único por página |
| Propósito de links claro | 2.4.4 | SERIOUS | Texto del link es descriptivo |
| Headings descriptivos | 2.4.6 | SERIOUS | Headings describen contenido |

## 3. Comprensibilidad

### 3.1 Legibilidad

| Check | Criterio WCAG | Severidad | Cómo Verificar |
|-------|---------------|-----------|----------------|
| Idioma de página | 3.1.1 | SERIOUS | `<html lang="es">` |
| Idioma de partes | 3.1.2 | MODERATE | `lang` en secciones en otro idioma |

### 3.2 Predecibilidad

| Check | Criterio WCAG | Severidad | Cómo Verificar |
|-------|---------------|-----------|----------------|
| Sin cambios inesperados | 3.2.1 | SERIOUS | Focus no cambia contexto |
| Navegación consistente | 3.2.3 | MODERATE | Menú igual en todas las páginas |
| Identificación consistente | 3.2.4 | MODERATE | Mismos iconos = misma función |

### 3.3 Asistencia de Entrada

| Check | Criterio WCAG | Severidad | Cómo Verificar |
|-------|---------------|-----------|----------------|
| Identificación de errores | 3.3.1 | SERIOUS | Errores claros y específicos |
| Labels de inputs | 3.3.2 | CRITICAL | Todos los inputs tienen label |
| Sugerencias de error | 3.3.3 | MODERATE | Ayuda para corregir errores |
| Prevención de errores | 3.3.4 | MODERATE | Confirmación en acciones destructivas |

## 4. Robustez

### 4.1 Compatible

| Check | Criterio WCAG | Severidad | Cómo Verificar |
|-------|---------------|-----------|----------------|
| HTML válido | 4.1.1 | MODERATE | Sin errores de parsing |
| Name, Role, Value | 4.1.2 | CRITICAL | Componentes tienen ARIA correctos |

**Roles ARIA Comunes:**
```html
<!-- Navegación -->
<nav role="navigation" aria-label="Principal">

<!-- Regiones -->
<main role="main">
<aside role="complementary">

<!-- Widgets -->
<button role="button" aria-pressed="false">
<div role="tablist">
<div role="tab" aria-selected="true">

<!-- Estados -->
aria-expanded="true|false"
aria-hidden="true|false"
aria-disabled="true|false"
aria-busy="true|false"
```

## Checklist Rápido por Sección

### Para cada página verificar:

```
□ Título de página único y descriptivo
□ Un solo h1 que describe la página
□ Headings en orden jerárquico
□ Imágenes/iconos con alt o aria-hidden
□ Links con texto descriptivo
□ Botones con texto o aria-label
□ Formularios con labels
□ Contraste de texto suficiente
□ Navegable por teclado
□ Indicador de foco visible
□ Sin contenido que parpadea
□ Errores descriptivos
□ Idioma declarado
```

## Herramientas de Verificación

### Durante E2E Tests:

1. **Snapshot Analysis**: Verificar atributos ARIA en el DOM
2. **Contrast Check**: Validar ratios de color
3. **Heading Structure**: Extraer y validar jerarquía
4. **Interactive Elements**: Listar y verificar accesibilidad

### Post-Test:

1. **axe-core**: Automated accessibility testing
2. **WAVE**: Web accessibility evaluation
3. **Lighthouse**: Accessibility audit

## Formato de Issue de Accesibilidad

```json
{
  "id": "a11y-001",
  "severity": "SERIOUS",
  "criterion": "1.4.3",
  "description": "Texto con contraste insuficiente",
  "element": "<span class=\"text-bbva-sky\">...</span>",
  "context": "KPI Card subtitle en Dashboard",
  "recommendation": "Usar color más oscuro o fondo más claro",
  "impact": "Usuarios con baja visión no pueden leer el texto"
}
```

## Integración con Gherkin

```gherkin
@accessibility @wcag-aa
Scenario: Contraste de colores cumple WCAG AA
  Given que estoy en el Dashboard
  Then todos los textos tienen contraste >= 4.5:1
  And los elementos interactivos tienen contraste >= 3:1

@accessibility @wcag-aa
Scenario: Navegación por teclado completa
  Given que estoy en el Dashboard
  When navego usando solo el teclado (Tab, Enter, Escape)
  Then puedo acceder a todas las funcionalidades
  And el foco es siempre visible
  And puedo cerrar modales con Escape
```
