# Sistema de Diseño - Copilot Metrics Portal

Referencia completa del sistema de diseño visual del portal.

## Paleta de Colores Extendida

### Colores Primarios BBVA

```css
:root {
  --bbva-primary: #001891;    /* Azul corporativo - CTAs, headers */
  --bbva-navy: #070E46;       /* Azul muy oscuro - textos principales */
  --bbva-blue: #004481;       /* Azul medio - secundarios */
  --bbva-light: #1973B8;      /* Azul claro - enlaces, highlights */
  --bbva-sky: #5BBEFF;        /* Azul cielo - gráficos, decorativo */
  --bbva-cyan: #85C8FF;       /* Azul muy claro - fondos sutiles */
  --bbva-green: #04E26A;      /* Verde BBVA - éxito, accents */
  --bbva-teal: #0085AE;       /* Verde azulado - variación */
  --bbva-coral: #F35E5E;      /* Coral - errores, alertas */
}
```

### Escala de Grises

```css
:root {
  --bbva-gray-50: #F7F8F8;    /* Fondo principal del body */
  --bbva-gray-100: #F4F4F4;   /* Fondos de secciones */
  --bbva-gray-200: #E1E1E1;   /* Bordes sutiles */
  --bbva-gray-300: #CDCDCD;   /* Bordes */
  --bbva-gray-400: #808080;   /* Texto secundario */
  --bbva-gray-500: #595959;   /* Texto normal */
  --bbva-gray-600: #565656;   /* Texto medio */
  --bbva-gray-700: #121212;   /* Texto oscuro */
}
```

### Colores Semánticos

| Contexto | Color | Uso |
|----------|-------|-----|
| Éxito | `#04E26A` | Merged, completado, activo |
| Error | `#F35E5E` | Rechazado, cerrado, error |
| Warning | `#f59e0b` (amber-500) | En progreso, pendiente |
| Info | `#5BBEFF` | Informativo, neutral |
| Purple | `#8b5cf6` | Métricas especiales |

## Tipografía

### Fuente Principal

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
```

### Escala Tipográfica

| Clase | Tamaño | Uso |
|-------|--------|-----|
| `text-xs` | 12px | Labels, badges, subtítulos |
| `text-sm` | 14px | Texto secundario, descripciones |
| `text-base` | 16px | Texto de cuerpo |
| `text-lg` | 18px | Texto destacado |
| `text-xl` | 20px | Títulos pequeños |
| `text-2xl` | 24px | Títulos de sección |
| `text-3xl` | 30px | Valores KPI |
| `text-4xl` | 36px | Valores KPI grandes |

### Pesos Tipográficos

```tsx
// Labels y subtítulos
className="font-semibold"  // 600

// Títulos
className="font-bold"      // 700

// Valores numéricos destacados
className="font-extrabold" // 800
```

### Tracking (Letter Spacing)

```tsx
// Labels uppercase
className="uppercase tracking-wider"

// Números grandes
className="tracking-tight"
```

## Gradientes

### Gradientes de Header

```tsx
// Header principal BBVA
className="bg-gradient-to-br from-[#001891] via-[#000d5c] to-[#004481]"

// Header con animación
.bbva-header-gradient {
  background: linear-gradient(135deg, #001891 0%, #070E46 50%, #004481 100%);
}
```

### Gradientes de Accent

```tsx
// Línea superior de cards
className="bg-gradient-to-r from-[#001891] via-[#04E26A] to-[#001891]"

// Accent horizontal
className="bg-gradient-to-r from-[#001891] to-[#04E26A]"

// Divisor premium
className="bg-gradient-to-r from-[#001891] via-[#04E26A] to-[#5BBEFF]"
```

### Gradientes por Color de Card

```typescript
const cardGradients = {
  blue: 'from-[#001891] to-[#000d5c]',
  green: 'from-[#04E26A] to-[#00a63e]',
  sky: 'from-[#5BBEFF] to-[#2a9fd6]',
  purple: 'from-purple-500 to-purple-600',
  red: 'from-red-500 to-red-600',
  orange: 'from-amber-500 to-amber-600',
};
```

### Texto con Gradiente

```tsx
// Texto con gradiente (gradient-text class)
className="bg-gradient-to-r from-[#001891] to-[#04E26A] bg-clip-text text-transparent"
```

## Sombras

### Sombras Base

```tsx
// Card estándar
className="shadow-md"
// Equivale a: box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)

// Card elevada
className="shadow-lg"

// Card premium
className="shadow-xl"
```

### Sombras BBVA Personalizadas

```css
/* Sombra corporativa */
.shadow-bbva {
  box-shadow: 0 10px 40px rgba(0, 24, 145, 0.12);
}

/* Sombra grande */
.shadow-bbva-lg {
  box-shadow: 0 20px 60px rgba(0, 24, 145, 0.18);
}

/* Sombra glow verde */
.shadow-bbva-glow {
  box-shadow: 0 0 30px rgba(4, 226, 106, 0.3);
}
```

### Sombras en Hover

```tsx
// Transición de sombra
className="shadow-md hover:shadow-xl transition-shadow duration-300"

// Con sombra personalizada
style={{
  boxShadow: isHovered 
    ? '0 20px 50px rgba(0, 24, 145, 0.12)' 
    : '0 10px 40px rgba(0, 24, 145, 0.08)'
}}
```

## Bordes y Esquinas

### Border Radius

```tsx
// Cards principales
className="rounded-xl"    // 12px

// Cards grandes, banners
className="rounded-2xl"   // 16px

// Badges, pills
className="rounded-full"  // 9999px

// Botones
className="rounded-lg"    // 8px
```

### Bordes

```tsx
// Borde sutil
className="border border-gray-100"

// Borde con color corporativo
className="border border-[#001891]/10"

// Borde en hover
className="border border-transparent hover:border-[#04E26A]/30"
```

## Animaciones

### Keyframes Definidos

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Float (elementos decorativos) */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Glow */
@keyframes glow {
  0% { box-shadow: 0 0 20px rgba(0, 24, 145, 0.3); }
  100% { box-shadow: 0 0 40px rgba(4, 226, 106, 0.4); }
}

/* Loading bar */
@keyframes loading-bar {
  0% { width: 0%; margin-left: 0%; }
  50% { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}
```

### Clases de Animación

```tsx
// Fade in con delay
className="animate-fade-in"
style={{ animationDelay: '0.1s' }}

// Pulse lento
className="animate-pulse"  // o animate-pulse-slow

// Float
className="animate-float"

// Slide up
className="animate-slide-up"
```

### Transiciones de Hover

```tsx
// Transición completa
className="transition-all duration-300"

// Solo transform
className="transition-transform duration-300"

// Con easing personalizado
className="transition-all duration-300 ease-out"
// O: cubic-bezier(0.4, 0, 0.2, 1)
```

### Efectos de Hover Standard

```tsx
// Elevación
className="hover:-translate-y-1"
className="hover:-translate-y-2"  // más pronunciado

// Escala
className="hover:scale-[1.02]"
className="hover:scale-105"

// Opacidad
className="hover:opacity-80"
```

## Espaciado

### Padding de Componentes

| Componente | Padding |
|------------|---------|
| Card pequeña | `p-4` o `p-5` |
| Card mediana | `p-6` |
| Card grande/banner | `p-8` |
| Sección | `py-8` |
| Header | `py-6 md:py-8 px-6` |

### Gap en Grids

```tsx
// Grid de KPIs
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"

// Grid de charts
className="grid md:grid-cols-2 gap-6"

// Flex items
className="flex items-center gap-2"  // pequeño
className="flex items-center gap-4"  // mediano
className="flex items-center gap-6"  // grande
```

## Efectos Especiales

### Glass Morphism

```tsx
// Glass básico
className="bg-white/10 backdrop-blur-sm"

// Glass con borde
className="bg-white/10 backdrop-blur-sm border border-white/10"

// Glass más sólido
className="bg-white/80 backdrop-blur-md border border-gray-200"
```

### Glow Effect

```tsx
// Glow verde para elementos activos
<div className="relative">
  <div className="absolute inset-0 bg-[#04E26A] rounded-xl blur-lg opacity-30 animate-pulse" />
  <div className="relative">
    {/* Contenido */}
  </div>
</div>
```

### Elementos Decorativos

```tsx
// Círculo decorativo en esquina
<div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-5 bg-gradient-to-br from-[#001891] to-[#04E26A]" />

// Puntos decorativos
<div className="w-2 h-2 rounded-full bg-[#04E26A] animate-pulse" />

// Línea de conexión
<div className="h-px w-24 bg-gradient-to-r from-transparent to-[#001891]/30" />
```

## Breakpoints Responsive

```tsx
// Mobile first
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Ocultar/mostrar
className="hidden md:block"
className="flex md:hidden"
```

## Badges y Pills

### Estados de PR

```css
.badge-open {
  background: rgba(4, 226, 106, 0.15);
  color: #028a44;
}

.badge-closed {
  background: rgba(243, 94, 94, 0.15);
  color: #c23030;
}

.badge-merged {
  background: rgba(0, 24, 145, 0.1);
  color: #001891;
}
```

### Badge Genérico

```tsx
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#04E26A]/15 text-[#04E26A]">
  Activo
</span>
```

## Tablas

```css
.data-table th {
  background: #001891;
  color: white;
  font-weight: 600;
  padding: 12px 16px;
}

.data-table th:first-child {
  border-radius: 8px 0 0 0;
}

.data-table th:last-child {
  border-radius: 0 8px 0 0;
}

.data-table tr:hover td {
  background: rgba(0, 24, 145, 0.03);
}
```

## Botones

### Botón Primario

```tsx
<button className="
  bg-[#001891] text-white
  px-6 py-3 rounded-lg font-semibold
  transition-all duration-300
  hover:bg-[#070E46] hover:-translate-y-0.5
  hover:shadow-[0_8px_25px_rgba(0,24,145,0.25)]
">
  Acción
</button>
```

### Botón Secundario (Verde)

```tsx
<button className="
  bg-[#04E26A] text-[#070E46]
  px-6 py-3 rounded-lg font-semibold
  transition-all duration-300
  hover:brightness-110 hover:-translate-y-0.5
">
  Acción Secundaria
</button>
```

### Botón Ghost

```tsx
<button className="
  bg-white/10 hover:bg-white/20
  backdrop-blur-sm
  rounded-xl px-4 py-2
  border border-white/10 hover:border-white/20
  transition-all duration-300
">
  Acción Terciaria
</button>
```
