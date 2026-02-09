# Servicios - Capa de Datos

## Visión General

La capa de servicios gestiona toda la comunicación con APIs externas y el almacenamiento local. Está compuesta por tres módulos principales:

```mermaid
graph LR
    subgraph "Services Layer"
        GH[github.ts]
        TOKEN[tokenService.ts]
        CACHE[offlineCache.ts]
    end
    
    subgraph "External"
        API[GitHub Enterprise API]
    end
    
    subgraph "Storage"
        LS[(localStorage)]
    end
    
    GH --> TOKEN
    GH --> CACHE
    GH --> API
    TOKEN --> LS
    CACHE --> LS
```

## github.ts - Servicio Principal

### Descripción

Servicio central que maneja todas las operaciones con la API de GitHub Enterprise. Implementa:
- Fetching de datos de Copilot Seats
- Búsqueda de Pull Requests
- Procesamiento y cálculo de estadísticas
- Fallback a datos mock cuando la API no está disponible

### Diagrama de Clases

```mermaid
classDiagram
    class GitHubService {
        -API_BASE_URL: string
        -ORGANIZATION: string
        -useMockData: boolean
        +fetchCopilotSeats() Promise~SeatsData~
        +fetchCopilotPRs() Promise~ProcessedPR[]~
        +fetchDashboardData() Promise~DashboardData~
        +calculateSeatsStats() SeatsStats
        +calculatePRStats() PRStats
    }
    
    class CopilotSeatsResponse {
        +total_seats: number
        +seats: CopilotSeat[]
    }
    
    class ProcessedSeat {
        +login: string
        +name: string
        +email: string
        +planType: string
        +lastActivityAt: string
        +lastActivityEditor: string
        +isActive: boolean
        +prCount: number
    }
    
    class ProcessedPR {
        +number: number
        +title: string
        +state: string
        +isMerged: boolean
        +repository: string
        +customAgent: string
        +daysToClose: number
    }
    
    GitHubService --> CopilotSeatsResponse
    GitHubService --> ProcessedSeat
    GitHubService --> ProcessedPR
```

### Flujo de Datos

```mermaid
sequenceDiagram
    autonumber
    participant Page
    participant RQ as React Query
    participant GH as github.ts
    participant API as GitHub API
    participant Cache as offlineCache
    
    Page->>RQ: useQuery('dashboard')
    RQ->>GH: fetchDashboardData()
    
    alt Online
        GH->>API: GET /orgs/{org}/copilot/billing/seats
        API-->>GH: CopilotSeatsResponse
        GH->>GH: calculateSeatsStats()
        
        GH->>API: GET /search/issues?q=author:copilot-swe-agent
        API-->>GH: SearchResponse
        GH->>GH: calculatePRStats()
        
        GH->>Cache: saveToCache(data)
        GH-->>RQ: DashboardData
    else Offline o Error
        GH->>Cache: getFromCache()
        Cache-->>GH: cachedData
        GH-->>RQ: DashboardData (cached)
    end
    
    RQ-->>Page: data
```

### Funciones Principales

#### fetchCopilotSeats()

```typescript
async function fetchCopilotSeats(): Promise<{
  totalSeats: number;
  seats: ProcessedSeat[];
}>
```

**Proceso:**
1. Consulta paginada a `/orgs/{org}/copilot/billing/seats`
2. Procesa cada seat extrayendo información relevante
3. Calcula `agentUsageCount` basado en actividad reciente
4. Retorna lista de usuarios con licencia Copilot

#### fetchCopilotPRs()

```typescript
async function fetchCopilotPRs(): Promise<ProcessedPR[]>
```

**Proceso:**
1. Búsqueda de PRs con `author:app/copilot-swe-agent`
2. Extrae Custom Agent del body del PR
3. Calcula métricas de tiempo (daysToClose)
4. Identifica assignees

#### calculatePRStats()

Calcula estadísticas agregadas:
- Totales: open, closed, merged, rejected
- Rates: mergeRate, rejectionRate, pendingRate
- Tiempo: avgDaysToClose, min, max
- Rankings: topRepos, topAgents
- Efectividad por agente y repositorio

### Manejo de Errores

```mermaid
flowchart TD
    A[Fetch Data] --> B{Success?}
    B -->|Yes| C[Return Data]
    B -->|No| D{Network Error?}
    D -->|Yes| E[Switch to Mock]
    D -->|No| F{Empty Response?}
    F -->|Yes| E
    F -->|No| G[Throw Error]
    E --> H[Return Mock Data]
```

---

## tokenService.ts - Gestión de Tokens

### Descripción

Gestiona el token de autenticación para GitHub API de forma segura.

### Funciones

```typescript
// Obtener token efectivo (custom o default)
function getEffectiveToken(): string

// Establecer token personalizado
function setCustomToken(token: string): void

// Limpiar token personalizado
function clearCustomToken(): void

// Verificar si hay token custom
function hasCustomToken(): boolean
```

### Flujo de Token

```mermaid
flowchart LR
    REQ[API Request] --> CHECK{Custom Token?}
    CHECK -->|Yes| CUSTOM[Use Custom Token]
    CHECK -->|No| DEFAULT[Use Default Token]
    CUSTOM --> API[GitHub API]
    DEFAULT --> API
```

---

## offlineCache.ts - Cache Offline

### Descripción

Implementa persistencia local para soporte offline usando localStorage.

### Estructura del Cache

```typescript
interface CachedData {
  data: DashboardData;
  timestamp: number;
  version: string;
}
```

### Funciones

```typescript
// Guardar datos en cache
function saveToCache(data: DashboardData): void

// Obtener datos del cache
function getFromCache(): CachedData | null

// Verificar si cache es válido
function isCacheValid(cached: CachedData): boolean

// Limpiar cache
function clearCache(): void
```

### Política de Expiración

```mermaid
flowchart TD
    A[Get from Cache] --> B{Cache Exists?}
    B -->|No| C[Return null]
    B -->|Yes| D{Age < 24h?}
    D -->|No| C
    D -->|Yes| E{Version Match?}
    E -->|No| C
    E -->|Yes| F[Return Cached Data]
```

---

## Configuración del Proxy

### vite.config.ts

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/github-api': {
        target: 'https://bbva.ghe.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/github-api/, ''),
        secure: false
      }
    }
  }
})
```

### Diagrama de Proxy

```mermaid
sequenceDiagram
    participant Browser
    participant Vite as Vite Dev Server
    participant GHE as GitHub Enterprise
    
    Browser->>Vite: GET /github-api/orgs/org/...
    Note over Vite: Rewrite path
    Vite->>GHE: GET /api/v3/orgs/org/...
    GHE-->>Vite: Response
    Vite-->>Browser: Response (CORS OK)
```

---

## Tipos de Datos

### Tipos de Entrada (API)

```typescript
interface CopilotSeat {
  assignee: {
    login: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  plan_type: string;
  created_at: string;
  last_activity_at: string | null;
  last_activity_editor: string | null;
}

interface PullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  closed_at: string | null;
  body: string | null;
  comments: number;
  pull_request?: { merged_at: string | null };
}
```

### Tipos de Salida (Procesados)

```typescript
interface DashboardData {
  seats: SeatsStats | null;
  seatsList: ProcessedSeat[];
  prs: PRStats;
  prList: ProcessedPR[];
  lastUpdated: string;
  isLiveData: boolean;
  dataSource: string;
}

interface PRStats {
  total: number;
  open: number;
  merged: number;
  rejected: number;
  mergeRate: number;
  topRepos: Array<{ name: string; count: number }>;
  topAgents: Array<{ name: string; count: number }>;
  agentEffectiveness: AgentStats[];
  // ... más campos
}
```

---

## Consideraciones de Rendimiento

1. **Paginación**: Las llamadas a API usan paginación (100 items/página)
2. **Rate Limiting**: Delays de 300-500ms entre páginas
3. **Caching**: React Query con staleTime de 5 minutos
4. **Memoization**: Cálculos pesados solo cuando cambian datos

## Seguridad

1. **Tokens**: Nunca se exponen en código
2. **CORS**: Proxy evita problemas de cross-origin
3. **HTTPS**: Todas las comunicaciones cifradas
4. **Sanitización**: Datos de entrada validados
