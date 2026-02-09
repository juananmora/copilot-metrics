# Diagrama de Arquitectura del Sistema

## Diagrama de Contexto (C4 Level 1)

```mermaid
C4Context
    title Diagrama de Contexto - Copilot Metrics Portal

    Person(admin, "Administrador", "Gestiona y monitorea métricas de Copilot")
    Person(exec, "Ejecutivo", "Consulta dashboards de alto nivel")
    Person(user, "Usuario", "Visualiza métricas generales")
    
    System(portal, "Copilot Metrics Portal", "Aplicación web React para visualización de métricas de GitHub Copilot")
    
    System_Ext(ghapi, "GitHub Enterprise API", "API REST de GitHub Enterprise")
    System_Ext(browser, "Browser Storage", "localStorage / IndexedDB")
    
    Rel(admin, portal, "Administra", "HTTPS")
    Rel(exec, portal, "Consulta", "HTTPS")
    Rel(user, portal, "Visualiza", "HTTPS")
    Rel(portal, ghapi, "Consume datos", "REST/HTTPS")
    Rel(portal, browser, "Cachea datos", "Web APIs")
```

## Diagrama de Contenedores (C4 Level 2)

```mermaid
graph TB
    subgraph Browser["Browser"]
        subgraph Portal["Copilot Metrics Portal"]
            UI[React Application]
            SW[Service Worker]
            LS[(localStorage)]
        end
    end
    
    subgraph GitHub["GitHub Enterprise"]
        API[GitHub API v3]
        SEATS["Endpoint: copilot/billing/seats"]
        SEARCH["Endpoint: search/issues"]
    end
    
    subgraph Dev["Dev Environment"]
        VITE[Vite Dev Server]
        PROXY[Proxy Server]
    end
    
    UI --> SW
    UI --> LS
    SW --> LS
    
    UI --> VITE
    VITE --> PROXY
    PROXY --> API
    
    API --> SEATS
    API --> SEARCH
```

## Diagrama de Componentes (C4 Level 3)

```mermaid
graph TB
    subgraph "React Application"
        subgraph "Pages Layer"
            OVER[OverviewPage]
            PRS[PullRequestsPage]
            AGENTS[AgentsPage]
            USERS[UsersPage]
            EXEC[ExecutiveDashboard]
            SETTINGS[SettingsPage]
        end
        
        subgraph "Components Layer"
            LAYOUT[Layout]
            HEADER[Header]
            NAVBAR[NavBar]
            CHARTS[Charts]
            TABLES[Tables]
            KPIS[KPICards]
        end
        
        subgraph "Hooks Layer"
            RQ[React Query Hooks]
            CUSTOM[Custom Hooks]
        end
        
        subgraph "Services Layer"
            GH[github.ts]
            TOKEN[tokenService.ts]
            CACHE[offlineCache.ts]
        end
    end
    
    OVER --> LAYOUT
    PRS --> LAYOUT
    AGENTS --> LAYOUT
    USERS --> LAYOUT
    
    LAYOUT --> HEADER
    LAYOUT --> NAVBAR
    
    OVER --> CHARTS
    OVER --> KPIS
    PRS --> TABLES
    AGENTS --> CHARTS
    USERS --> TABLES
    
    CHARTS --> RQ
    TABLES --> RQ
    KPIS --> RQ
    
    RQ --> GH
    GH --> TOKEN
    GH --> CACHE
```

## Flujo de Datos

```mermaid
sequenceDiagram
    autonumber
    participant U as Usuario
    participant R as React App
    participant RQ as React Query
    participant GH as github.ts
    participant API as GitHub API
    participant LS as localStorage

    U->>R: Accede a la aplicación
    R->>RQ: useQuery('dashboard')
    
    alt Datos en cache válidos
        RQ->>LS: Verificar cache
        LS-->>RQ: Datos cacheados
        RQ-->>R: Datos inmediatos
    end
    
    RQ->>GH: fetchDashboardData()
    GH->>API: GET /copilot/billing/seats
    API-->>GH: SeatsData
    GH->>API: GET /search/issues
    API-->>GH: PRsData
    
    GH->>GH: calculateStats()
    GH->>LS: Guardar en cache
    GH-->>RQ: DashboardData
    RQ-->>R: Actualizar UI
    R-->>U: Mostrar métricas
```

## Modelo de Datos Consolidado

```mermaid
erDiagram
    DASHBOARD_DATA ||--|{ SEATS_DATA : contiene
    DASHBOARD_DATA ||--|{ PR_STATS : contiene
    DASHBOARD_DATA ||--|{ PROCESSED_PR : tiene
    
    SEATS_DATA ||--|{ PROCESSED_SEAT : contiene
    PR_STATS ||--|{ AGENT_STATS : contiene
    PR_STATS ||--|{ REPO_RANKING : contiene
    
    PROCESSED_SEAT }o--o| PROCESSED_PR : asignado
    
    DASHBOARD_DATA {
        string lastUpdated
        boolean isLiveData
        string dataSource
    }
    
    SEATS_DATA {
        int totalSeats
        int withActivity
        int withoutActivity
        float adoptionRate
        int active24h
        int active7d
    }
    
    PR_STATS {
        int total
        int open
        int merged
        int rejected
        float mergeRate
        float rejectionRate
        float avgDaysToClose
    }
    
    PROCESSED_SEAT {
        string login PK
        string name
        string email
        string planType
        datetime lastActivityAt
        string lastActivityEditor
        boolean isActive
        int prCount
    }
    
    PROCESSED_PR {
        int number PK
        string title
        string state
        boolean isMerged
        string repository
        string customAgent
        datetime createdAt
        datetime closedAt
        float daysToClose
        int comments
    }
    
    AGENT_STATS {
        string agent PK
        int total
        int open
        int merged
        int rejected
        float mergeRate
    }
    
    REPO_RANKING {
        string name PK
        int count
    }
```

## Diagrama de Estados de la Aplicación

```mermaid
stateDiagram-v2
    [*] --> Loading: Iniciar App
    
    Loading --> FetchingData: Inicializar React Query
    
    FetchingData --> Online: API Responde OK
    FetchingData --> UsingCache: API Falla + Cache Existe
    FetchingData --> MockMode: API Falla + Sin Cache
    
    Online --> Refreshing: Usuario solicita refresh
    Online --> Offline: Pierde conexión
    
    UsingCache --> Online: Conexión restaurada
    UsingCache --> Offline: Pierde conexión
    
    MockMode --> Online: API disponible
    
    Refreshing --> Online: Datos actualizados
    Refreshing --> Error: Fallo en refresh
    
    Offline --> Online: Conexión restaurada
    
    Error --> Refreshing: Reintentar
    Error --> UsingCache: Usar cache
    
    state Online {
        [*] --> Idle
        Idle --> UserInteraction: Navegar/Filtrar
        UserInteraction --> Idle: Completado
    }
```

## Referencias

- [Documentación de Arquitectura](../overview.md)
- [Componentes](../components/comp-overview.md)
- [Servicios](../components/comp-services.md)
- [ADR-001: Stack Tecnológico](../decisions/adr-001-stack-tecnologico.md)
