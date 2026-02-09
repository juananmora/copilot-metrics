---
name: project-documentation
description: Genera documentación funcional y de arquitectura para proyectos. Soporta ingeniería inversa de código existente y documentación de nuevas funcionalidades. Incluye diagramas UML con Mermaid. Genera salida en Markdown y HTML en carpetas separadas. Usar cuando el usuario pida documentar, crear documentación técnica, diagramas de arquitectura, documentación funcional, o hacer ingeniería inversa.
---

# Documentación de Proyecto

Skill para generar documentación funcional y de arquitectura de proyectos software, tanto para ingeniería inversa como para documentar nuevas funcionalidades.

## Estructura de Salida

```
docs/
├── md/                    # Documentación en Markdown
│   ├── functional/        # Documentación funcional
│   │   ├── overview.md
│   │   ├── features/
│   │   └── user-flows/
│   └── architecture/      # Documentación de arquitectura
│       ├── overview.md
│       ├── components/
│       ├── diagrams/
│       └── decisions/
└── html/                  # Documentación en HTML
    ├── functional/
    └── architecture/
```

## Flujo de Trabajo

### Paso 1: Análisis del Código

Antes de documentar, analiza el proyecto:

1. **Estructura de directorios**: Identifica la organización del código
2. **Dependencias**: Revisa package.json, requirements.txt, etc.
3. **Puntos de entrada**: Localiza main, index, app principal
4. **Patrones**: Detecta arquitectura (MVC, Clean Architecture, etc.)
5. **Componentes clave**: Identifica servicios, controladores, modelos

### Paso 2: Elegir Tipo de Documentación

**¿Documentación funcional?** → Sigue [templates/functional-doc.md](templates/functional-doc.md)
**¿Documentación de arquitectura?** → Sigue [templates/architecture-doc.md](templates/architecture-doc.md)
**¿Ambas?** → Genera primero arquitectura, luego funcional

### Paso 3: Generar Diagramas

Incluye diagramas Mermaid según el contexto. Ver [diagrams/diagram-patterns.md](diagrams/diagram-patterns.md) para patrones.

**Diagramas obligatorios según tipo:**

| Tipo de Doc | Diagramas Requeridos |
|-------------|---------------------|
| Funcional | Flujos de usuario, casos de uso |
| Arquitectura | Componentes, clases, secuencia |
| API/Servicios | Secuencia, ER (si hay BD) |

### Paso 4: Generar Documentación

1. **Crear carpetas** si no existen:
   ```bash
   mkdir -p docs/md/functional docs/md/architecture docs/html/functional docs/html/architecture
   ```

2. **Escribir Markdown** en `docs/md/`

3. **Convertir a HTML** ejecutando:
   ```bash
   # Primera vez: instalar dependencias
   cd .cursor/skills/project-documentation/scripts && npm install && cd -
   
   # Convertir
   node .cursor/skills/project-documentation/scripts/md-to-html.js docs/md docs/html
   ```

### Paso 5: Verificar Salida

- [ ] Todos los diagramas Mermaid renderizados correctamente
- [ ] HTML generado con estilos aplicados
- [ ] Enlaces internos funcionando
- [ ] Índice/navegación incluidos

## Convenciones de Documentación

### Nombres de Archivo

- Usar kebab-case: `user-authentication.md`
- Prefijos por tipo:
  - `feat-` para funcionalidades
  - `comp-` para componentes
  - `api-` para endpoints
  - `adr-` para decisiones de arquitectura

### Estructura de Cada Documento

```markdown
# [Título]

## Resumen
Descripción breve (2-3 líneas)

## Contexto
Por qué existe este componente/funcionalidad

## Detalles
Explicación técnica con diagramas

## Referencias
Links a código, otros docs, recursos externos
```

### Idioma

Toda la documentación se genera en **español**. Mantener:
- Términos técnicos en inglés cuando sea estándar (API, endpoint, etc.)
- Explicaciones y descripciones en español
- Comentarios en diagramas en español

## Recursos Adicionales

- [Plantilla de Documentación Funcional](templates/functional-doc.md)
- [Plantilla de Documentación de Arquitectura](templates/architecture-doc.md)
- [Patrones de Diagramas Mermaid](diagrams/diagram-patterns.md)
- [Script de Conversión MD a HTML](scripts/md-to-html.js)

## Checklist de Calidad

Antes de finalizar la documentación:

- [ ] Overview general del proyecto incluido
- [ ] Diagramas de alto nivel presentes
- [ ] Cada componente mayor documentado
- [ ] Flujos principales con diagramas de secuencia
- [ ] Modelo de datos con diagrama ER (si aplica)
- [ ] Decisiones de arquitectura documentadas (ADR)
- [ ] HTML generado y verificado
- [ ] Navegación/índice funcional
