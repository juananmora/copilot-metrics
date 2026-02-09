# Patrones de Componentes - Copilot Metrics Portal

Guía detallada para crear componentes nuevos siguiendo los patrones establecidos.

## Estructura de Archivos

```
src/
├── components/
│   ├── index.ts          # Re-exports de todos los componentes
│   ├── ComponentName.tsx # Componente individual
│   └── ...
├── hooks/
│   ├── index.ts          # Re-exports de hooks
│   └── useHookName.tsx   # Hook individual
├── pages/
│   ├── index.ts          # Re-exports de páginas
│   └── PageName.tsx      # Página individual
├── services/
│   └── serviceName.ts    # Servicios de API
└── types/
    └── index.ts          # Definiciones de tipos
```

## Componente Base Template

```tsx
import { ReactNode } from 'react';
import { IconName } from 'lucide-react';

interface ComponentNameProps {
  // Props requeridas
  title: string;
  value: number;
  // Props opcionales con defaults
  color?: 'blue' | 'green' | 'red';
  icon?: ReactNode;
  className?: string;
}

export function ComponentName({ 
  title, 
  value, 
  color = 'blue',
  icon,
  className = ''
}: ComponentNameProps) {
  return (
    <div className={`
      relative bg-white rounded-xl overflow-hidden
      shadow-md hover:shadow-xl
      transition-all duration-300 hover:-translate-y-1
      border border-gray-100
      animate-fade-in
      ${className}
    `}>
      {/* Gradiente superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#001891] to-[#04E26A]" />
      
      {/* Contenido */}
      <div className="relative p-5">
        {/* Tu contenido aquí */}
      </div>
    </div>
  );
}
```

## Patrón: KPI Card

Para métricas numéricas destacadas.

```tsx
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'aqua' | 'orange';
}

const colorConfig = {
  blue: {
    gradient: 'from-[#001891] to-[#000d5c]',
    iconBg: 'bg-[#001891]/10',
    iconColor: 'text-[#001891]',
    valueColor: 'text-[#001891]',
  },
  green: {
    gradient: 'from-[#04E26A] to-[#00a63e]',
    iconBg: 'bg-[#04E26A]/10',
    iconColor: 'text-[#04E26A]',
    valueColor: 'text-[#04E26A]',
  },
  // ... más colores
};

export function KPICard({ 
  title, 
  value, 
  subtitle,
  icon, 
  trend, 
  trendValue,
  color = 'blue'
}: KPICardProps) {
  const colors = colorConfig[color];
  
  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden group 
                    hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                    border border-gray-100">
      {/* Línea superior de gradiente */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
      
      {/* Círculo decorativo */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-5 bg-gradient-to-br ${colors.gradient}`} />
      
      <div className="relative p-5">
        {/* Header con icono y trend */}
        <div className="flex items-start justify-between">
          <div className={`${colors.iconBg} p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110`}>
            <div className={colors.iconColor}>
              {icon}
            </div>
          </div>
          
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
              ${trend === 'up' ? 'bg-[#04E26A]/10 text-[#04E26A]' : ''}
              ${trend === 'down' ? 'bg-red-500/10 text-red-500' : ''}
              ${trend === 'neutral' ? 'bg-gray-100 text-gray-500' : ''}
            `}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        
        {/* Contenido */}
        <div className="mt-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-end gap-2 mt-1">
            <p className={`text-3xl font-extrabold ${colors.valueColor} tracking-tight`}>
              {value}
            </p>
            <ArrowUpRight className={`w-4 h-4 ${colors.iconColor} opacity-50 mb-1`} />
          </div>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Barra inferior en hover */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.gradient} 
                       transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
    </div>
  );
}
```

## Patrón: Panel/Card Grande

Para secciones con múltiple contenido.

```tsx
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PanelProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconGradient?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconGradient = 'from-[#001891] to-[#04E26A]',
  children,
  className = ''
}: PanelProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header del panel */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-r ${iconGradient} p-3 rounded-xl shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#070E46]">{title}</h3>
            {subtitle && (
              <p className="text-gray-500 text-sm">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
```

## Patrón: Stat Card Pequeña

Para métricas dentro de un grid compacto.

```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-white border-gray-100 hover:border-[#001891]/20',
  primary: 'bg-gradient-to-br from-[#001891] to-[#000d5c] text-white',
  success: 'bg-gradient-to-br from-[#04E26A] to-[#00a63e] text-white',
  warning: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
};

export function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
  const isPrimary = variant !== 'default';
  
  return (
    <div className={`
      relative rounded-xl p-4 overflow-hidden
      transition-all duration-300 hover:scale-[1.02]
      border ${variantStyles[variant]}
      ${!isPrimary ? 'hover:shadow-md' : ''}
    `}>
      {/* Círculo decorativo */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center
            ${isPrimary ? 'bg-white/20' : 'bg-[#001891]/10'}
          `}>
            {icon}
          </div>
          <span className={`text-[10px] uppercase tracking-wider font-semibold
            ${isPrimary ? 'text-white/70' : 'text-gray-400'}
          `}>
            {label}
          </span>
        </div>
        <div className={`text-2xl font-extrabold tracking-tight
          ${isPrimary ? 'text-white' : 'text-[#001891]'}
        `}>
          {value}
        </div>
      </div>
    </div>
  );
}
```

## Patrón: Banner Hero

Para secciones destacadas con imagen de fondo.

```tsx
interface HeroBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  children?: ReactNode;
}

export function HeroBanner({ 
  title, 
  subtitle, 
  description, 
  backgroundImage,
  children 
}: HeroBannerProps) {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Imagen de fondo */}
      {backgroundImage && (
        <div className="absolute right-0 top-0 w-2/3 h-full opacity-60">
          <img 
            src={backgroundImage} 
            alt="" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent" />
        </div>
      )}
      
      {/* Barra de accent superior */}
      <div className="relative h-1.5 bg-gradient-to-r from-[#001891] via-[#04E26A] to-[#001891]" />
      
      <div className="relative p-8">
        {/* Badge */}
        {subtitle && (
          <span className="text-[#001891] text-xs font-bold tracking-wider uppercase 
                          bg-gradient-to-r from-[#001891]/10 to-[#04E26A]/10 
                          px-3 py-1.5 rounded-full border border-[#001891]/20">
            {subtitle}
          </span>
        )}
        
        {/* Título */}
        <h2 className="text-2xl font-bold text-[#001891] mt-3 mb-2">
          {title}
        </h2>
        
        {/* Descripción */}
        {description && (
          <p className="text-gray-600 text-sm max-w-md">
            {description}
          </p>
        )}
        
        {/* Contenido adicional */}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Patrón: Tabla de Datos

```tsx
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  onRowClick 
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={String(col.key)}
                className={`
                  bg-[#001891] text-white font-semibold py-3 px-4 text-left
                  ${idx === 0 ? 'rounded-tl-xl' : ''}
                  ${idx === columns.length - 1 ? 'rounded-tr-xl' : ''}
                  ${col.className || ''}
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr 
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`
                border-b border-gray-100
                hover:bg-[#001891]/[0.03]
                ${onRowClick ? 'cursor-pointer' : ''}
                transition-colors duration-150
              `}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className={`py-3 px-4 ${col.className || ''}`}>
                  {col.render 
                    ? col.render(row[col.key], row)
                    : String(row[col.key])
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Patrón: Progress Bar

```tsx
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'red';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const colorGradients = {
  blue: 'from-[#001891] to-[#004481]',
  green: 'from-[#04E26A] to-[#00a63e]',
  red: 'from-red-500 to-red-600',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({ 
  value, 
  max = 100, 
  color = 'green',
  showLabel = false,
  size = 'md'
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{value}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200`}>
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${colorGradients[color]} 
                      transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

## Patrón: Badge/Pill

```tsx
type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#04E26A]/15 text-[#028a44]',
  error: 'bg-[#F35E5E]/15 text-[#c23030]',
  warning: 'bg-amber-500/15 text-amber-700',
  info: 'bg-[#5BBEFF]/15 text-[#0085AE]',
  neutral: 'bg-gray-100 text-gray-600',
};

export function Badge({ children, variant = 'neutral', icon }: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5
      px-3 py-1 rounded-full
      text-xs font-semibold
      ${variantStyles[variant]}
    `}>
      {icon}
      {children}
    </span>
  );
}
```

## Patrón: Loading State

```tsx
export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`
      animate-pulse rounded-lg bg-gradient-to-r 
      from-gray-100 via-gray-200 to-gray-100
      bg-[length:200%_100%]
      ${className}
    `} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
      <LoadingSkeleton className="h-10 w-10 rounded-xl mb-4" />
      <LoadingSkeleton className="h-4 w-24 mb-2" />
      <LoadingSkeleton className="h-8 w-16" />
    </div>
  );
}
```

## Patrón: Empty State

```tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#001891]/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#001891]" />
      </div>
      <h3 className="text-lg font-semibold text-[#070E46] mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
```

## Exportación de Componentes

Siempre agregar al archivo `src/components/index.ts`:

```typescript
// Al crear un nuevo componente, agregar:
export { NuevoComponente } from './NuevoComponente';

// Si el componente tiene múltiples exports:
export { ComponentePrincipal, ComponenteSecundario } from './ComponenteMultiple';
```

## Hooks Personalizados

### Patrón de Hook

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseCustomHookOptions {
  initialValue?: number;
  onComplete?: () => void;
}

interface UseCustomHookReturn {
  value: number;
  isActive: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useCustomHook(options: UseCustomHookOptions = {}): UseCustomHookReturn {
  const { initialValue = 0, onComplete } = options;
  
  const [value, setValue] = useState(initialValue);
  const [isActive, setIsActive] = useState(false);
  
  const start = useCallback(() => {
    setIsActive(true);
  }, []);
  
  const stop = useCallback(() => {
    setIsActive(false);
  }, []);
  
  const reset = useCallback(() => {
    setValue(initialValue);
    setIsActive(false);
  }, [initialValue]);
  
  useEffect(() => {
    if (!isActive) return;
    
    // Lógica del hook...
    
    return () => {
      // Cleanup
    };
  }, [isActive, onComplete]);
  
  return { value, isActive, start, stop, reset };
}
```

## Checklist de Nuevo Componente

Al crear cualquier componente nuevo, verificar:

- [ ] Interface de props definida con TypeScript
- [ ] Props opcionales tienen valores default
- [ ] Usa colores de la paleta BBVA
- [ ] Tiene `animate-fade-in` o animación de entrada
- [ ] Tiene efectos hover (translate, shadow, scale)
- [ ] Incluye gradiente decorativo si es card
- [ ] Es responsive (`md:`, `lg:` breakpoints)
- [ ] Usa iconos de lucide-react
- [ ] Exportado desde `components/index.ts`
- [ ] Sin errores de TypeScript
- [ ] Accessibility: roles ARIA si es interactivo
