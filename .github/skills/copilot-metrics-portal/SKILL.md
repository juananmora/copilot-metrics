---
name: copilot-metrics-portal
description: Guía completa para desarrollar y mantener el Copilot Metrics Portal de BBVA. Incluye sistema de diseño corporativo, patrones de componentes React, animaciones premium, y estética visual elevada. Usar cuando se modifique código del portal, se creen nuevos componentes, se arreglen bugs visuales, o se implementen nuevas funcionalidades del dashboard.
---

# Copilot Metrics Portal - Guía de Desarrollo

Portal de métricas de GitHub Copilot para BBVA con diseño corporativo premium y experiencia visual elevada.

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 3.x | Estilos |
| TanStack Query | 5.x | Data Fetching |
| Recharts | 3.x | Gráficos |
| lucide-react | 0.5x | Iconografía |
| react-router-dom | 7.x | Routing |

## Paleta de Colores BBVA

```typescript
// Colores corporativos - SIEMPRE usar estos
const colors = {
  bbva: {
    primary: '#001891',    // Azul corporativo principal
    navy: '#070E46',       // Azul oscuro (textos)
    blue: '#004481',       // Azul medio
    light: '#1973B8',      // Azul claro
    sky: '#5BBEFF',        // Azul cielo
    cyan: '#85C8FF',       // Azul muy claro
    green: '#04E26A',      // Verde BBVA (accent principal)
    teal: '#0085AE',       // Verde azulado
    coral: '#F35E5E',      // Coral (errores)
  }
};
```

### Uso de Colores

- **Primario (#001891)**: Headers, botones principales, textos destacados
- **Verde (#04E26A)**: Accents, indicadores positivos, elementos interactivos
- **Sky (#5BBEFF)**: Elementos secundarios, gráficos, badges
- **Gray-50 (#F7F8F8)**: Fondos principales
- **Navy (#070E46)**: Textos de cuerpo

## Principios de Diseño Visual

### 1. Gradientes Premium

```tsx
// Gradiente header corporativo
className="bg-gradient-to-br from-[#001891] via-[#000d5c] to-[#004481]"

// Gradiente accent
className="bg-gradient-to-r from-[#001891] via-[#04E26A] to-[#001891]"

// Gradiente de tarjetas según color
const gradients = {
  blue: 'from-[#001891] to-[#000d5c]',
  green: 'from-[#04E26A] to-[#00a63e]',
  sky: 'from-[#5BBEFF] to-[#2a9fd6]',
};
```

### 2. Efectos Glass Morphism

```tsx
// Efecto glass estándar
className="bg-white/10 backdrop-blur-sm border border-white/10"

// Glass con más opacidad
className="bg-white/80 backdrop-blur-md border border-gray-200"
```

### 3. Sombras Corporativas

```tsx
// Sombra estándar para cards
className="shadow-md"  // o custom: "shadow-[0_10px_40px_rgba(0,24,145,0.12)]"

// Sombra elevada en hover
className="hover:shadow-xl"  // o: "hover:shadow-[0_20px_60px_rgba(0,24,145,0.18)]"

// Sombra glow verde
className="shadow-[0_0_30px_rgba(4,226,106,0.3)]"
```

### 4. Animaciones Requeridas

```tsx
// Fade in al cargar secciones
className="animate-fade-in"
style={{ animationDelay: '0.1s' }}

// Hover en cards
className="hover:-translate-y-1 transition-all duration-300"

// Pulse para indicadores activos
className="animate-pulse"

// Float para elementos decorativos
className="animate-float"
```

## Estructura de Componentes

### Patrón de Card Premium

```tsx
function PremiumCard({ children, color = 'blue' }) {
  return (
    <div className={`
      relative bg-white rounded-xl overflow-hidden
      shadow-md hover:shadow-xl
      transition-all duration-300 hover:-translate-y-1
      border border-gray-100
    `}>
      {/* Línea superior de gradiente */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[color]}`} />
      
      {/* Círculo decorativo */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-5 bg-gradient-to-br ${gradients[color]}`} />
      
      {/* Contenido */}
      <div className="relative p-5">
        {children}
      </div>
      
      {/* Barra inferior en hover */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-0.5 
        bg-gradient-to-r ${gradients[color]}
        transform scale-x-0 group-hover:scale-x-100 
        transition-transform duration-500 origin-left
      `} />
    </div>
  );
}
```

### Patrón de KPI Card

Estructura obligatoria para métricas:

1. Icono en contenedor con fondo semi-transparente del color
2. Título en `text-xs uppercase tracking-wider text-gray-400`
3. Valor en `text-3xl font-extrabold` con color principal
4. Subtítulo opcional en `text-xs text-gray-400`
5. Indicador de tendencia si aplica

### Patrón de Sección

```tsx
<section className="animate-fade-in" style={{ animationDelay: '0.Xs' }}>
  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
    <IconComponent className="w-7 h-7 text-bbva-blue" />
    Título de Sección
  </h2>
  {/* Contenido */}
</section>
```

## Reglas de Código

### TypeScript Estricto

```typescript
// SIEMPRE definir interfaces para props
interface ComponentProps {
  title: string;
  value: number;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'aqua' | 'orange';
}

// SIEMPRE usar tipos explícitos
const [data, setData] = useState<DashboardData | null>(null);
```

### Organización de Imports

```typescript
// 1. React y hooks
import { useState, useEffect, ReactNode } from 'react';

// 2. Librerías externas
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

// 3. Iconos (lucide-react)
import { Bot, Sparkles, TrendingUp } from 'lucide-react';

// 4. Componentes locales
import { KPICard, SectionDivider } from './components';

// 5. Servicios y utilidades
import { fetchDashboardData } from './services/github';

// 6. Tipos
import type { DashboardData } from './types';

// 7. Assets
import copilotLogo from './assets/images/copilot.jpg';
```

### Convenciones de Nomenclatura

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `KPICard`, `AIBanner` |
| Hooks | camelCase con `use` | `useCountUp`, `useOnlineStatus` |
| Funciones | camelCase | `fetchDashboardData` |
| Constantes | SCREAMING_SNAKE | `API_BASE_URL` |
| Tipos/Interfaces | PascalCase | `DashboardData`, `KPICardProps` |
| Archivos componente | PascalCase.tsx | `KPICard.tsx` |
| Archivos utilidad | camelCase.ts | `tokenService.ts` |

## Iconografía

SIEMPRE usar `lucide-react`. Iconos frecuentes:

```tsx
import { 
  Bot,           // Agentes/AI
  Sparkles,      // Innovación
  TrendingUp,    // Métricas positivas
  GitPullRequest,// PRs
  GitMerge,      // Merged
  GitBranch,     // Branches
  Users,         // Usuarios
  Clock,         // Tiempo
  Target,        // Objetivos
  Zap,           // Velocidad
  CheckCircle,   // Éxito
  AlertTriangle, // Advertencias
  RefreshCw,     // Actualizar
} from 'lucide-react';

// Tamaños estándar
// Pequeño: w-4 h-4
// Normal: w-5 h-5 o w-6 h-6
// Grande: w-7 h-7
// Hero: w-10 h-10 o más
```

## Divisores de Sección

Usar `SectionDivider` entre secciones principales:

```tsx
<SectionDivider variant="tech" icon="sparkles" text="Adopción" />
<SectionDivider variant="gradient" />
<SectionDivider variant="dots" icon="zap" />
<SectionDivider variant="wave" icon="trending" />
```

Variantes: `default`, `wave`, `dots`, `gradient`, `tech`, `minimal`

## Data Fetching

```tsx
// SIEMPRE usar TanStack Query
const { data, isLoading, error, refetch, isFetching } = useQuery({
  queryKey: ['dashboard'],
  queryFn: fetchDashboardData,
  staleTime: 5 * 60 * 1000, // 5 minutos
});

// Manejar estados
if (isLoading) return <Loading />;
if (error) return <ErrorState message={error.message} onRetry={refetch} />;
if (!data) return <Loading />;
```

## Anti-Patrones a Evitar

1. **NO usar colores fuera de la paleta BBVA**
2. **NO crear componentes sin animaciones de entrada**
3. **NO omitir el gradiente superior en cards**
4. **NO usar sombras genéricas** - usar las sombras BBVA
5. **NO mezclar estilos inline con Tailwind**
6. **NO crear archivos sin tipado TypeScript estricto**
7. **NO usar `any` - siempre tipos específicos**
8. **NO ignorar estados de loading/error**

## Referencias Adicionales

- Sistema de diseño detallado: [design-system.md](design-system.md)
- Patrones de componentes: [component-patterns.md](component-patterns.md)

## Checklist para Nuevos Componentes

- [ ] Usar colores de paleta BBVA
- [ ] Incluir animación `animate-fade-in`
- [ ] Agregar hover effects (translate, shadow)
- [ ] Incluir gradiente decorativo
- [ ] Definir interface TypeScript para props
- [ ] Exportar desde `components/index.ts`
- [ ] Usar iconos de lucide-react
- [ ] Responsive con breakpoints `md:` y `lg:`
