# Patrones de Diagramas Mermaid

Referencia de diagramas UML con Mermaid para documentación técnica.

## Diagrama de Clases

### Básico con Relaciones

```mermaid
classDiagram
    class Usuario {
        -id: UUID
        -email: String
        -nombre: String
        +validarEmail(): Boolean
        +cambiarPassword(nuevo: String): void
    }
    
    class Pedido {
        -id: UUID
        -fecha: Date
        -total: Decimal
        +calcularTotal(): Decimal
        +agregarProducto(p: Producto): void
    }
    
    class Producto {
        -id: UUID
        -nombre: String
        -precio: Decimal
        +aplicarDescuento(porcentaje: Number): Decimal
    }
    
    Usuario "1" --> "*" Pedido : realiza
    Pedido "*" --> "*" Producto : contiene
```

### Con Herencia e Interfaces

```mermaid
classDiagram
    class IRepositorio {
        <<interface>>
        +buscarPorId(id: UUID): T
        +guardar(entidad: T): void
        +eliminar(id: UUID): void
    }
    
    class RepositorioBase {
        <<abstract>>
        #conexion: Database
        +buscarPorId(id: UUID): T
        +guardar(entidad: T): void
    }
    
    class UsuarioRepositorio {
        +buscarPorEmail(email: String): Usuario
    }
    
    IRepositorio <|.. RepositorioBase : implementa
    RepositorioBase <|-- UsuarioRepositorio : extiende
```

### Tipos de Relaciones

```mermaid
classDiagram
    A --|> B : Herencia
    C ..|> D : Implementación
    E --> F : Asociación
    G --o H : Agregación
    I --* J : Composición
    K ..> L : Dependencia
```

---

## Diagrama de Secuencia

### Flujo con Alternativas

```mermaid
sequenceDiagram
    autonumber
    
    actor Usuario
    participant Frontend
    participant API
    participant Auth
    participant BD
    
    Usuario->>Frontend: Clic en Login
    Frontend->>API: POST /auth/login
    activate API
    
    API->>Auth: Validar credenciales
    activate Auth
    Auth->>BD: Buscar usuario
    BD-->>Auth: Datos usuario
    
    alt Credenciales válidas
        Auth-->>API: Token JWT
        API-->>Frontend: 200 OK + token
        Frontend-->>Usuario: Redirigir a dashboard
    else Credenciales inválidas
        Auth-->>API: Error autenticación
        API-->>Frontend: 401 Unauthorized
        Frontend-->>Usuario: Mostrar error
    end
    
    deactivate Auth
    deactivate API
```

### Flujo con Loops y Notas

```mermaid
sequenceDiagram
    participant C as Cliente
    participant S as Servidor
    participant Q as Cola
    participant W as Worker
    
    C->>S: Enviar trabajo
    S->>Q: Encolar tarea
    
    Note over Q,W: Procesamiento asíncrono
    
    loop Cada 5 segundos
        W->>Q: Obtener tarea
        Q-->>W: Tarea pendiente
        W->>W: Procesar
        W->>S: Notificar resultado
    end
    
    S-->>C: Webhook con resultado
```

### Mensajes Paralelos

```mermaid
sequenceDiagram
    participant A as Servicio A
    participant B as Servicio B
    participant C as Servicio C
    participant D as Agregador
    
    A->>D: Solicitar datos
    
    par Llamadas paralelas
        D->>B: Obtener datos B
    and
        D->>C: Obtener datos C
    end
    
    B-->>D: Respuesta B
    C-->>D: Respuesta C
    
    D->>D: Combinar respuestas
    D-->>A: Datos agregados
```

---

## Diagrama de Componentes

### Arquitectura de Capas

```mermaid
graph TB
    subgraph "Capa de Presentación"
        UI[Interfaz de Usuario]
        API_GW[API Gateway]
    end
    
    subgraph "Capa de Negocio"
        SVC1[Servicio Usuarios]
        SVC2[Servicio Pedidos]
        SVC3[Servicio Productos]
    end
    
    subgraph "Capa de Datos"
        DB1[(PostgreSQL)]
        DB2[(Redis Cache)]
        MQ[RabbitMQ]
    end
    
    UI --> API_GW
    API_GW --> SVC1
    API_GW --> SVC2
    API_GW --> SVC3
    
    SVC1 --> DB1
    SVC1 --> DB2
    SVC2 --> DB1
    SVC2 --> MQ
    SVC3 --> DB1
```

### Microservicios

```mermaid
graph LR
    subgraph "Frontend"
        WEB[Web App]
        MOBILE[Mobile App]
    end
    
    subgraph "API Gateway"
        GW[Kong/Nginx]
    end
    
    subgraph "Servicios"
        AUTH[Auth Service]
        USER[User Service]
        ORDER[Order Service]
        NOTIFY[Notification Service]
    end
    
    subgraph "Infraestructura"
        DB[(Database)]
        CACHE[(Cache)]
        QUEUE[Message Queue]
    end
    
    WEB --> GW
    MOBILE --> GW
    
    GW --> AUTH
    GW --> USER
    GW --> ORDER
    
    AUTH --> CACHE
    USER --> DB
    ORDER --> DB
    ORDER --> QUEUE
    QUEUE --> NOTIFY
```

---

## Diagrama de Flujo

### Proceso con Decisiones

```mermaid
flowchart TD
    A([Inicio]) --> B[Recibir solicitud]
    B --> C{¿Usuario autenticado?}
    
    C -->|No| D[Redirigir a login]
    D --> E([Fin])
    
    C -->|Sí| F{¿Tiene permisos?}
    
    F -->|No| G[Mostrar error 403]
    G --> E
    
    F -->|Sí| H[Procesar solicitud]
    H --> I{¿Éxito?}
    
    I -->|Sí| J[Retornar respuesta]
    I -->|No| K[Registrar error]
    K --> L[Retornar error]
    
    J --> E
    L --> E
```

### Subgrafos para Módulos

```mermaid
flowchart TB
    subgraph "Módulo de Validación"
        V1[Validar formato]
        V2[Validar reglas negocio]
        V3[Validar permisos]
    end
    
    subgraph "Módulo de Procesamiento"
        P1[Transformar datos]
        P2[Aplicar lógica]
        P3[Persistir]
    end
    
    subgraph "Módulo de Notificación"
        N1[Preparar mensaje]
        N2[Enviar notificación]
    end
    
    Input[Entrada] --> V1
    V1 --> V2 --> V3
    V3 --> P1
    P1 --> P2 --> P3
    P3 --> N1
    N1 --> N2
    N2 --> Output[Salida]
```

---

## Diagrama Entidad-Relación

### Modelo Completo

```mermaid
erDiagram
    USUARIO ||--o{ SESION : tiene
    USUARIO ||--o{ PEDIDO : realiza
    USUARIO }o--o{ ROL : asignado
    
    PEDIDO ||--|{ LINEA_PEDIDO : contiene
    PEDIDO ||--|| DIRECCION_ENVIO : tiene
    
    PRODUCTO ||--o{ LINEA_PEDIDO : incluido
    PRODUCTO }o--|| CATEGORIA : pertenece
    PRODUCTO ||--o{ IMAGEN : tiene
    
    USUARIO {
        uuid id PK "Identificador único"
        varchar email UK "Email único"
        varchar password_hash "Hash de contraseña"
        varchar nombre "Nombre completo"
        boolean activo "Estado del usuario"
        timestamp creado_en "Fecha creación"
        timestamp actualizado_en "Última actualización"
    }
    
    PEDIDO {
        uuid id PK
        uuid usuario_id FK
        uuid direccion_id FK
        decimal subtotal
        decimal impuestos
        decimal total
        enum estado "pendiente, pagado, enviado, entregado"
        timestamp fecha
    }
    
    PRODUCTO {
        uuid id PK
        uuid categoria_id FK
        varchar sku UK
        varchar nombre
        text descripcion
        decimal precio
        int stock
        boolean disponible
    }
    
    LINEA_PEDIDO {
        uuid id PK
        uuid pedido_id FK
        uuid producto_id FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
    }
```

### Relaciones Especiales

```mermaid
erDiagram
    A ||--|| B : "uno a uno"
    C ||--o{ D : "uno a muchos"
    E }o--o{ F : "muchos a muchos"
    G |o--o| H : "cero o uno a cero o uno"
```

---

## Diagrama de Estados

### Máquina de Estados

```mermaid
stateDiagram-v2
    [*] --> Borrador
    
    Borrador --> Pendiente: Enviar
    Pendiente --> EnRevision: Asignar revisor
    
    EnRevision --> Aprobado: Aprobar
    EnRevision --> Rechazado: Rechazar
    EnRevision --> Pendiente: Devolver
    
    Rechazado --> Borrador: Editar
    Aprobado --> Publicado: Publicar
    
    Publicado --> Archivado: Archivar
    Publicado --> [*]: Eliminar
    Archivado --> [*]
```

### Con Acciones

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Procesando: iniciar()
    
    state Procesando {
        [*] --> Validando
        Validando --> Ejecutando: validacionOK()
        Validando --> Error: validacionFallo()
        Ejecutando --> Completado: exito()
        Ejecutando --> Error: fallo()
    }
    
    Procesando --> Idle: cancelar()
    Error --> Idle: reintentar()
    Completado --> [*]
```

---

## Diagrama de Journey

### Experiencia de Usuario

```mermaid
journey
    title Proceso de Compra
    section Descubrimiento
      Visitar tienda: 5: Usuario
      Buscar producto: 4: Usuario
      Ver detalles: 4: Usuario
    section Decisión
      Comparar precios: 3: Usuario
      Leer reseñas: 4: Usuario
      Agregar al carrito: 5: Usuario
    section Compra
      Ir al checkout: 4: Usuario
      Ingresar datos: 2: Usuario
      Pagar: 3: Usuario, Sistema
    section Post-compra
      Recibir confirmación: 5: Sistema
      Rastrear envío: 4: Usuario
      Recibir producto: 5: Usuario
```

---

## Diagrama C4

### Contexto

```mermaid
C4Context
    title Diagrama de Contexto del Sistema
    
    Person(admin, "Administrador", "Gestiona el sistema")
    Person(user, "Usuario Final", "Usa la aplicación")
    
    System(sistema, "Sistema Principal", "Aplicación web para gestión")
    
    System_Ext(email, "Servicio Email", "SendGrid")
    System_Ext(pago, "Pasarela Pago", "Stripe")
    System_Ext(storage, "Almacenamiento", "AWS S3")
    
    Rel(admin, sistema, "Administra")
    Rel(user, sistema, "Usa")
    Rel(sistema, email, "Envía emails", "SMTP")
    Rel(sistema, pago, "Procesa pagos", "REST API")
    Rel(sistema, storage, "Almacena archivos", "S3 API")
```

---

## Consejos de Uso

### Cuándo Usar Cada Diagrama

| Diagrama | Usar Para |
|----------|-----------|
| Clases | Estructura de código, modelos de dominio |
| Secuencia | Flujos de comunicación, APIs |
| Componentes | Arquitectura de alto nivel, módulos |
| Flujo | Procesos, algoritmos, decisiones |
| ER | Modelo de base de datos |
| Estados | Ciclos de vida de entidades |
| Journey | UX, procesos de negocio |
| C4 | Documentación arquitectónica formal |

### Buenas Prácticas

1. **Simplicidad**: Máximo 10-15 elementos por diagrama
2. **Consistencia**: Usar mismos nombres que en código
3. **Contexto**: Incluir leyenda si hay convenciones especiales
4. **Legibilidad**: Usar colores y agrupaciones con moderación
