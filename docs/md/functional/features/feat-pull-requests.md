# F002 - Gestión de Pull Requests

**ID**: F002
**Módulo**: Pull Requests
**Estado**: Activo

## Resumen

La página de Pull Requests permite visualizar, filtrar y analizar todos los PRs creados por GitHub Copilot SWE Agent en la organización.

## Diagrama de la Página

```mermaid
graph TB
    subgraph "Pull Requests Page"
        HEADER[Encabezado con Stats]
        
        subgraph "Filtros"
            F1[Estado]
            F2[Repositorio]
            F3[Custom Agent]
            F4[Búsqueda]
        end
        
        TABLE[Tabla de PRs]
        PAGINATION[Paginación]
    end
    
    HEADER --> F1
    F1 --> F2
    F2 --> F3
    F3 --> F4
    F4 --> TABLE
    TABLE --> PAGINATION
```

## Funcionalidades

### 1. Estadísticas de Cabecera

KPIs rápidos del estado actual de PRs:

| KPI | Descripción |
|-----|-------------|
| Total | Cantidad total de PRs |
| Open | PRs pendientes |
| Merged | PRs fusionados |
| Rejected | PRs rechazados |

### 2. Sistema de Filtros

```mermaid
flowchart LR
    ALL[Todos los PRs] --> F1{Estado?}
    F1 -->|Open| OPEN[PRs Abiertos]
    F1 -->|Merged| MERGED[PRs Merged]
    F1 -->|Rejected| REJECTED[PRs Rechazados]
    
    OPEN --> F2{Repo?}
    MERGED --> F2
    REJECTED --> F2
    
    F2 --> F3{Agent?}
    F3 --> F4{Search?}
    F4 --> RESULT[PRs Filtrados]
```

**Filtros disponibles:**

| Filtro | Tipo | Opciones |
|--------|------|----------|
| Estado | Select | All, Open, Merged, Rejected |
| Repositorio | Select | Lista dinámica de repos |
| Custom Agent | Select | Lista dinámica de agents |
| Búsqueda | Text | Busca en título y número |

### 3. Tabla de PRs

**Columnas:**

| Columna | Descripción | Ordenable |
|---------|-------------|-----------|
| # | Número del PR | Sí |
| Título | Título del PR | Sí |
| Repositorio | Nombre del repo | Sí |
| Estado | Open/Merged/Rejected | Sí |
| Custom Agent | Agente utilizado | Sí |
| Creado | Fecha de creación | Sí |
| Cerrado | Fecha de cierre | Sí |
| Días | Tiempo hasta cierre | Sí |
| Comentarios | Cantidad | Sí |

### 4. Paginación

- Items por página: 10, 25, 50, 100
- Navegación: Primera, Anterior, Siguiente, Última
- Indicador: "Mostrando X-Y de Z"

## Casos de Uso

### CU001 - Listar PRs

**Actor**: Administrador

**Flujo:**
1. Usuario navega a "Pull Requests"
2. Sistema carga lista de PRs
3. Sistema muestra tabla paginada
4. Usuario puede navegar entre páginas

### CU002 - Filtrar por Estado

**Actor**: Administrador

**Flujo:**
1. Usuario selecciona estado "Merged"
2. Sistema filtra PRs
3. Sistema actualiza tabla
4. Sistema actualiza contadores

```mermaid
sequenceDiagram
    actor User
    participant UI as PRTable
    participant State as filterState
    
    User->>UI: Selecciona "Merged"
    UI->>State: setFilter({status: 'merged'})
    State->>UI: filteredPRs
    UI->>UI: Re-render tabla
    UI-->>User: Tabla actualizada
```

### CU003 - Ordenar por columna

**Actor**: Administrador

**Flujo:**
1. Usuario hace clic en encabezado de columna
2. Sistema ordena ascendente
3. Usuario hace clic de nuevo
4. Sistema ordena descendente

### CU004 - Buscar PR específico

**Actor**: Administrador

**Flujo:**
1. Usuario escribe en campo de búsqueda
2. Sistema aplica debounce (300ms)
3. Sistema filtra por título o número
4. Sistema muestra resultados

## Diagrama de Estados de PR

```mermaid
stateDiagram-v2
    [*] --> Open: PR Creado
    Open --> Merged: Aprobado y Fusionado
    Open --> Rejected: Rechazado
    Open --> Open: En Revisión
    Merged --> [*]
    Rejected --> [*]
```

## Modelo de Datos

```mermaid
erDiagram
    PR {
        int number PK
        string title
        string state
        boolean isMerged
        string repository
        string author
        string customAgent
        datetime createdAt
        datetime closedAt
        float daysToClose
        int comments
        string url
    }
    
    REPOSITORY {
        string name PK
        int prCount
    }
    
    AGENT {
        string name PK
        int prCount
        float mergeRate
    }
    
    PR }o--|| REPOSITORY : "pertenece a"
    PR }o--o| AGENT : "usa"
```

## Reglas de Negocio

| ID | Regla | Descripción |
|----|-------|-------------|
| RN001 | Estado derivado | Si closed_at != null y merged_at == null → Rejected |
| RN002 | Días de cierre | Solo calculado si PR está cerrado |
| RN003 | Sin agente | PRs sin custom agent muestran "-" |

## Validaciones

| Campo | Validación |
|-------|------------|
| Búsqueda | Mínimo 2 caracteres para activar |
| Paginación | Página no puede ser < 1 |

## Acciones Disponibles

| Acción | Descripción | Ubicación |
|--------|-------------|-----------|
| Ver PR | Abre PR en GitHub | Click en número |
| Copiar URL | Copia link del PR | Icono en fila |
| Exportar | Descarga CSV (futuro) | Header |

## Mensajes del Sistema

| Código | Tipo | Mensaje |
|--------|------|---------|
| MSG001 | Info | "No se encontraron PRs con los filtros seleccionados" |
| MSG002 | Info | "Mostrando X de Y resultados" |

## Responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| Mobile | Tabla con scroll horizontal |
| Tablet | Columnas reducidas |
| Desktop | Todas las columnas visibles |

## Referencias

- [Servicio GitHub](../../architecture/components/comp-services.md)
- [Tipos de Datos](../../architecture/overview.md)
