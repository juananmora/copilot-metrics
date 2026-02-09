# ADR 001: WebSocket vs Polling para Tiempo Real

**Estado**: Aceptado
**Fecha**: 2026-02
**Autores**: Equipo de Desarrollo

## Contexto

El Copilot Metrics Portal necesita mostrar datos actualizados de GitHub Copilot a los usuarios. Los datos cambian con frecuencia (nuevas PRs, cambios de estado, nuevos usuarios activos) y los usuarios esperan ver información reciente sin necesidad de refrescar manualmente la página.

Se evaluaron dos alternativas principales para mantener los datos sincronizados:
1. **Polling**: Llamadas HTTP periódicas desde el cliente
2. **WebSocket**: Conexión persistente bidireccional

## Decisión

Se decidió implementar **WebSocket** como mecanismo principal de comunicación en tiempo real, con REST API como fallback.

## Alternativas Consideradas

### Alternativa 1: Polling HTTP

**Descripción**: El frontend realiza llamadas GET periódicas (cada 30 segundos) al backend para obtener datos actualizados.

**Pros**:
- Implementación simple
- Compatible con cualquier infraestructura
- Sin necesidad de mantener conexiones persistentes
- Fácil de cachear con CDN

**Contras**:
- Ineficiente: muchas llamadas sin cambios reales
- Latencia: hasta 30 segundos para ver actualizaciones
- Mayor carga en servidor y red
- No escala bien con muchos clientes

### Alternativa 2: WebSocket (Elegida)

**Descripción**: Conexión persistente donde el servidor puede enviar actualizaciones instantáneamente cuando hay cambios.

**Pros**:
- Actualizaciones instantáneas
- Eficiente: solo envía cuando hay cambios
- Menor latencia percibida
- Permite comunicación bidireccional (refresh manual, ping/pong)
- Mejor UX con indicadores de conexión en tiempo real

**Contras**:
- Más complejo de implementar
- Requiere gestión de reconexiones
- Necesita balanceo de carga sticky sessions
- Mayor uso de memoria en servidor por conexiones activas

### Alternativa 3: Server-Sent Events (SSE)

**Descripción**: Stream unidireccional del servidor al cliente.

**Pros**:
- Más simple que WebSocket
- Usa HTTP estándar
- Reconexión automática del navegador

**Contras**:
- Solo unidireccional (servidor → cliente)
- No permite refresh manual desde cliente
- Menos soporte en herramientas de desarrollo

## Justificación

Se eligió WebSocket porque:

1. **Bidireccionalidad necesaria**: El usuario puede solicitar refresh manual, lo cual requiere enviar mensajes del cliente al servidor.

2. **Experiencia de usuario**: Los datos de Copilot son valiosos y los usuarios esperan ver información actualizada. La latencia de polling degradaría la experiencia.

3. **Eficiencia**: Con múltiples usuarios conectados, el modelo de broadcast de WebSocket es más eficiente que cada cliente haciendo polling.

4. **Escalabilidad futura**: WebSocket permite implementar features como notificaciones, alertas, y colaboración en tiempo real.

5. **Indicadores de estado**: WebSocket permite mostrar estado de conexión, clientes conectados, y timestamps de última actualización de forma nativa.

## Consecuencias

### Positivas
- Usuarios ven actualizaciones en tiempo real
- Menor carga de red agregada
- Mejor UX con indicadores de conexión
- Capacidad de broadcast a múltiples clientes
- Base para futuras features en tiempo real

### Negativas
- Mayor complejidad en backend (gestión de conexiones)
- Necesidad de implementar reconexión en frontend
- Logs y debugging más complejos
- Requiere WebSocket-capable infrastructure

### Riesgos
- **Desconexiones**: Mitigado con lógica de reconexión automática y fallback a REST
- **Memoria en servidor**: Mitigado con límite de clientes y cleanup de conexiones inactivas
- **Compatibilidad**: Mitigado con REST API como fallback

## Referencias

- [RFC 6455 - The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [ws npm package](https://www.npmjs.com/package/ws)
- [React Query WebSocket Integration](https://tanstack.com/query/latest)
