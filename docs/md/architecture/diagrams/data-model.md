# Modelo de Datos

## Diagrama de Entidades

```mermaid
erDiagram
    DASHBOARD_DATA ||--o{ PROCESSED_SEAT : contiene
    DASHBOARD_DATA ||--o{ PROCESSED_PR : contiene
    DASHBOARD_DATA ||--|| SEATS_STATS : tiene
    DASHBOARD_DATA ||--|| PR_STATS : tiene
    DASHBOARD_DATA ||--o{ LANGUAGE_STATS : incluye
    DASHBOARD_DATA ||--o{ TIMEZONE_ACTIVITY : incluye
    
    PROCESSED_PR }o--o{ PROCESSED_SEAT : asignada_a
    
    DASHBOARD_DATA {
        SeatsStats seats
        ProcessedSeat[] seatsList
        PRStats prs
        ProcessedPR[] prList
        LanguageStats[] languages
        TimezoneActivity[] timezones
        string lastUpdated
        boolean isLiveData
        string dataSource
    }
    
    SEATS_STATS {
        number totalSeats
        number totalUsers
        number withActivity
        number withoutActivity
        number active24h
        number active7d
        number active30d
        array byEditor
        array byPlan
        number adoptionRate
        number activeRate7d
    }
    
    PROCESSED_SEAT {
        string login PK
        string name
        string email
        string planType
        string createdAt
        string lastAuthenticatedAt
        string lastActivityAt
        string lastActivityEditor
        boolean isActive
        string avatarUrl
        number prCount
        number agentUsageCount
    }
    
    PR_STATS {
        number total
        number open
        number closed
        number merged
        number rejected
        number mergeRate
        number rejectionRate
        number pendingRate
        number avgDaysToClose
        array topRepos
        array topAgents
        number uniqueAgents
        array agentEffectiveness
        array repoEffectiveness
    }
    
    PROCESSED_PR {
        number number PK
        string title
        string state
        boolean isMerged
        string repository
        string author
        string createdAt
        string closedAt
        number daysToClose
        string url
        string customAgent
        string labels
        number comments
        array assignees
    }
    
    LANGUAGE_STATS {
        string name PK
        number bytes
        number percentage
        string color
    }
    
    TIMEZONE_ACTIVITY {
        string timezone PK
        number activity
        number users
    }
```

## Entidades de Contribuidores

```mermaid
erDiagram
    REPO_CONTRIBUTORS_DATA ||--o{ REPO_CONTRIBUTOR : contiene
    
    REPO_CONTRIBUTORS_DATA {
        string repository PK
        RepoContributor[] contributors
        number totalCommits
        number totalPRs
    }
    
    REPO_CONTRIBUTOR {
        string login PK
        string name
        string email
        string avatarUrl
        number commits
        number prs
        number total
    }
    
    PR_REVIEWERS_DATA ||--o{ PR_REVIEWER : contiene
    
    PR_REVIEWERS_DATA {
        PRReviewer[] reviewers
        number totalReviews
    }
    
    PR_REVIEWER {
        string login PK
        string name
        string avatarUrl
        number reviewCount
        number approvedCount
        number changesRequestedCount
        number commentedCount
    }
```

## Descripción de Entidades

### DASHBOARD_DATA
Entidad principal que agrupa todos los datos del dashboard.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| seats | SeatsStats | Estadísticas agregadas de licencias |
| seatsList | ProcessedSeat[] | Lista de usuarios con licencia |
| prs | PRStats | Estadísticas agregadas de PRs |
| prList | ProcessedPR[] | Lista de PRs individuales |
| languages | LanguageStats[] | Distribución por lenguajes |
| timezones | TimezoneActivity[] | Actividad por zona horaria |
| lastUpdated | string | Timestamp de última actualización |
| isLiveData | boolean | Si los datos son en tiempo real |
| dataSource | string | Origen de los datos |

### PROCESSED_SEAT
Usuario con licencia de Copilot procesado.

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| login | string | No | Username de GitHub (PK) |
| name | string | Sí | Nombre completo |
| email | string | Sí | Email del usuario |
| planType | string | No | Tipo de plan (business, enterprise) |
| createdAt | string | No | Fecha de asignación de licencia |
| lastActivityAt | string | No | Última actividad con Copilot |
| lastActivityEditor | string | No | Editor usado en última actividad |
| isActive | boolean | No | Si tiene actividad registrada |
| avatarUrl | string | Sí | URL del avatar |
| prCount | number | Sí | PRs de Copilot asignadas |
| agentUsageCount | number | Sí | Uso estimado de agentes |

### PROCESSED_PR
Pull Request creado por Copilot SWE Agent.

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| number | number | No | Número del PR (PK) |
| title | string | No | Título del PR |
| state | 'open' \| 'closed' | No | Estado actual |
| isMerged | boolean | No | Si fue integrado |
| repository | string | No | Repositorio (org/repo) |
| author | string | No | Autor (copilot-swe-agent) |
| createdAt | string | No | Fecha de creación |
| closedAt | string | Sí | Fecha de cierre |
| daysToClose | number | Sí | Días hasta cierre |
| url | string | No | URL del PR |
| customAgent | string | No | Agente personalizado usado |
| assignees | string[] | No | Usuarios asignados |

### PR_STATS
Estadísticas agregadas de Pull Requests.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| total | number | Total de PRs |
| open | number | PRs abiertas |
| closed | number | PRs cerradas |
| merged | number | PRs integradas |
| rejected | number | PRs rechazadas |
| mergeRate | number | % de merge (merged/closed) |
| rejectionRate | number | % de rechazo |
| pendingRate | number | % pendientes (open/total) |
| topRepos | array | Top 10 repositorios |
| topAgents | array | Top 10 agentes |
| agentEffectiveness | array | Efectividad por agente |
| repoEffectiveness | array | Efectividad por repo |

## Flujo de Datos

```mermaid
flowchart LR
    subgraph "GitHub API"
        GH_SEATS[/copilot/billing/seats/]
        GH_SEARCH[/search/issues/]
        GH_USERS[/users/:login/]
        GH_REPOS[/repos/:repo/]
    end
    
    subgraph "Backend Processing"
        FETCH[Fetch Raw Data]
        PROCESS[Process & Transform]
        CALC[Calculate Stats]
        CACHE[Store in Cache]
    end
    
    subgraph "Frontend"
        RQ[React Query]
        STATE[Component State]
        UI[UI Render]
    end
    
    GH_SEATS --> FETCH
    GH_SEARCH --> FETCH
    GH_USERS --> FETCH
    GH_REPOS --> FETCH
    
    FETCH --> PROCESS
    PROCESS --> CALC
    CALC --> CACHE
    
    CACHE -->|WebSocket| RQ
    CACHE -->|REST| RQ
    RQ --> STATE
    STATE --> UI
```

## Índices y Búsquedas

| Búsqueda | Campos | Uso |
|----------|--------|-----|
| PRs por autor | `author = app/copilot-swe-agent` | Filtro principal |
| PRs por org | `org = copilot-full-capacity` | Scope de búsqueda |
| Usuarios activos | `lastActivityAt != '-'` | Filtro de adopción |
| Top repos | `repository` (GROUP BY + COUNT) | Ranking |
| Top agents | `customAgent` (GROUP BY + COUNT) | Ranking |
