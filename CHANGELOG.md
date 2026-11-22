# Cambios de Dominix

## 0.2.0 · candidata, sin publicar · 22 de noviembre de 2026

Actualización del juego en desarrollo. Reúne el trabajo local posterior a `f2a8677`; no es una versión 1.0 ni únicamente una tanda de skins. [Evaluación de salida y evidencia](docs/RELEASE_READINESS_2026-11-22.md).

### Juego y continuidad

- Correcciones de persistencia del set entre rondas, puntuación y efectos; catálogo reconciliado de 31 patrones y explicador de puntos.
- Autoguardado, continuar partida, guardar y salir, copia de recuperación de run y exportación/importación compatible de progreso.
- Liquidación de XP, historial, maestría y desbloqueos protegida por un registro recuperable. Un cierre a mitad de la entrega permite recuperarla sin duplicar la partida; el resultado se revela después de confirmar el guardado.
- Correcciones de semillas, retos, recursos de ronda y guardado posterior a jefes. Las pruebas de replay no garantizan todas las combinaciones de campaña.

### Presentación y aprendizaje

- Menú agrupado, conservando identidad, paleta, título y fondos de Dominix.
- Práctica guiada con el motor real, explicación de puntuación y recibos de recompensa.
- Catálogo de 31 skins con probador, tamaños de mano/mesa, búsqueda, familias y favoritos.
- Seis mundos originales con valores contables, incluido Expreso de medianoche; acabados de marfil, esmeralda, diamante, obsidiana, rubí e Imperium.
- Recorrido mano–mesa, contactos por material y feedback de robo, descarte y deshacer; modos rápido y reducido.
- Correcciones de celebración duplicada del jefe, atajos tras modales y confirmaciones falsas al copiar.

### Instalación y desarrollo

- Fuentes locales, iconos de instalación y preparación offline de pantallas todavía no visitadas.
- Protección de escritura entre pestañas y caché versionada para `/Dominix/`.
- Comprobaciones de reglas antes del despliegue y ejecutor de pruebas consistente entre Windows y CI.
- 491 pruebas automatizadas; pruebas nuevas de actualización desde los recursos públicos, cierres del proceso y errores de almacenamiento. Detalle y límites en el informe de salida.

### Limitaciones conocidas

- Persisten tirones en cadenas extensas; falta validar rendimiento en móvil físico y otros navegadores.
- Tutorial contextual de mapa, tienda y jefes pendiente. Compartir/importar una run reproducible sigue desconectado; ranking local, sin sincronización automática entre dispositivos.
- Las colecciones inspiradas en franquicias son reinterpretaciones, sin anunciar colaboraciones oficiales. Procedencia y condiciones de recursos en [ASSET_PROVENANCE.md](docs/ASSET_PROVENANCE.md).
- La versión publicada anterior no guardaba la partida activa: el perfil persistido se conserva al actualizar, pero no se migra una partida antigua que solo existiese en memoria.

No se ha publicado esta candidata ni creado un tag. El despliegue público requiere subir el código completo, pasar CI y verificar la web desplegada.
