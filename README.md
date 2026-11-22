# Dominix — un roguelike de dominó basado en cadenas, patrones y builds

Dominix toma la lógica reconocible del dominó y la transforma en un juego de runs, scoring, reliquias y decisiones tácticas.

## Jugar

```bash
npm install
npm run dev
```

Abre http://localhost:5173 en tu navegador.

## Estado del proyecto: en desarrollo y verificación

La candidata se [organiza en commits por funcionalidades](docs/COMMIT_HISTORY_2026-11-22.md), con comprobación de sus etapas y trazabilidad de las revisiones. La publicación de la web se distingue de la preparación del historial.

La [evaluación de salida 0.2.0](docs/RELEASE_READINESS_2026-11-22.md) prepara una candidata sin publicar. Corrige un cierre de navegador que duplicaba XP/historial al reintentar una entrega, añade recuperación del perfil antes del arranque y comprueba la actualización desde los recursos reales publicados en `/Dominix/`. **491 pruebas** correctas, cierres del proceso en tres puntos, cuota real llena y continuidad offline. Véanse [notas de la candidata](CHANGELOG.md), límites y pasos pendientes de CI/despliegue; la versión pública todavía no se ha cambiado.

La [entrega de materiales y Expreso](docs/MATERIAL_EXPRESS_2026-11-17.md) añade una colección original con ventanas contables del 0 al 6, acabados para seis materiales y contactos breves diferenciados. Corrige la celebración duplicada del jefe, el paso accidental de Enter al botón inferior y la falsa confirmación de copia del historial/semilla. **478 pruebas**, revisión ES/EN en cuatro ventanas y continuidad offline. Conserva la UI y el arte anteriores, sin créditos ni dependencias nuevas. Persisten tareas largas en cadenas extensas; véase el informe para evidencia y límites.

La [aplicación de prioridades](docs/PRIORITIES_IMPLEMENTATION_2026-11-15.md) reconcilia los 31 patrones, corrige RNG en StrictMode y el guardado posterior al jefe, añade recuperación de run en IndexedDB y protege la liquidación ante cuota llena. Clarifica Endless y separa el descarte táctil de 44 px. **460 pruebas**, replay con compras hasta ronda 13, jefe de tres fases, cierre forzado y regresiones de tutorial/acciones/offline. El rendimiento mejora parcialmente; persisten tareas de hasta 348 ms en el estrés a CPU ×4.

El [cierre y la práctica guiada](docs/TUTORIAL_RESOLUTION_2026-11-15.md) muestran total y acciones sin esperas escalonadas y sustituyen las tarjetas por una práctica con el motor real. Su medición histórica de ~70 ms usaba una marca rAF que no acredita latencia real y queda sustituida por las trazas de la revisión posterior. Véanse [prioridades actuales](docs/NEXT_PRIORITIES_2026-11-15.md).

El [feedback de acciones](docs/ACTION_MOTION_2026-11-15.md) diferencia robo, descarte y deshacer, confirma la última acción y conecta los cinco mundos con sus materiales de contacto. Corrige un fallo reproducido de atajos que jugaban detrás del diálogo de puntuación. **407 pruebas**, 40 comprobaciones de acciones ES/EN/normal/rápido/reducido y 16 de colocación, con clips reales y continuidad offline. Conserva menú, skins, reglas y guardados.

El [probador y los mundos de dominó](docs/WORLDS_WARDROBE_2026-11-15.md) organizan las 30 skins con búsqueda, filtros y favoritos exportables; permiten comparar mano/cadena y acabados sin equipar. Incluyen cinco mundos originales con valores contables, corrigen seis avisos de nivel y amplían el desglose de score. **394 pruebas**, revisión ES/EN en cuatro ventanas y partidas offline con las cinco skins nuevas y las cuatro colecciones anteriores. Arte vectorial integrado, sin créditos ni dependencias nuevas.

La [reorganización del menú](docs/HOME_HIERARCHY_2026-11-15.md) prioriza continuar/jugar, agrupa los modos y despliega progreso y navegación bajo demanda. Conserva fondo, título y recursos; Apariencia entra directamente a Skins. **340 pruebas**, revisión ES/EN en cinco tamaños, teclado, cancelación segura y continuación offline. Sin imágenes nuevas o créditos consumidos.

La [revisión de arte y contacto](docs/AMONG_ENAMEL_CONTACT_2026-11-15.md) compara una lámina real de Higgsfield con una nueva dirección integrada de Among Us; añade golpe de llegada por material y pulso en la unión correcta. **331 pruebas**, muestras visuales/audio y continuidad offline. Consumo Higgsfield confirmado: 2 créditos; GPT high fue rechazado por el plan, no se contrató otro.

La [revisión de colocación y skins](docs/TILE_PLACEMENT_SKINS_2026-11-15.md) añade el recorrido real mano–mesa (380/180 ms), cancelación segura y movimiento reducido. Incluye un ensayo ilustrado de Among Us para revisar, conservando el arte de Roma, Hollow Knight y One Piece. **321 pruebas**, regresión de navegador, clip y una colocación/continuación offline en producción local.

La [revisión de referencias por valor](docs/SKIN_REFERENCES_2026-11-14.md) da a Among Us seis roles visuales y a Hollow Knight seis máscaras distintas; One Piece alterna los retratos de su tripulación. Conserva el conteo y Roma Eterna. **321 pruebas**, capturas nuevas y siete caras romanas idénticas a la versión aprobada.

La [corrección de identidad numérica](docs/NUMERIC_SKINS_2026-11-14.md) sustituye las asociaciones arbitrarias personaje/valor del último lote por tripulantes, luces y monedas contables, y numerales romanos principales. Conserva los 28 retratos en una galería sin rangos. **317 pruebas**, verificación de colisiones en tres anchos y continuidad offline de las cuatro skins.

El [lote de cuatro colecciones ilustradas](docs/FOUR_COLLECTIONS_2026-11-14.md) añade Among Us, Hollow Knight, One Piece y Roma Eterna: **28 retratos**, cuatro skins equipables y **305 pruebas**. Atlas reales optimizados, nombres ES/EN y equipamiento/recarga offline comprobados. Las colecciones de franquicias son reinterpretaciones generadas, no colaboraciones oficiales confirmadas.

La [revisión offline y entre pestañas](docs/OFFLINE_TABS_2026-11-14.md) protege las escrituras simultáneas, prepara las pantallas para usarlas sin conexión e integra los iconos de instalación que faltaban. Corrige avisos superpuestos y el historial que invadía la cabecera. **291 pruebas**, navegación offline y recuperación comprobadas en raíz y `/Dominix/`.

El [guardado y continuidad de partidas](docs/RUN_CONTINUITY_2026-11-14.md) añade autoguardado, «Guardar y salir», «Continuar partida» y recuperación desde una copia anterior. **276 pruebas**, flujo real de recarga/recompensa/finalización y once estados preparados de encuentros. También corrige los temporizadores de transición. Conserva la UI actual.

La [explicación de puntuación y recibos](docs/SCORE_EXPLANATION_REWARDS_2026-11-14.md) permite consultar los puntos previstos de una ficha y confirma recompensas después de observar la entrega. **264 pruebas**, revisión ES/EN y una recompensa verificada en la compilación real. Mantiene las reglas y documenta los efectos que aún aparecen agrupados.

La [revisión de cadenas largas](docs/LONG_CHAINS_2026-11-14.md) añade orden visual y extremos junto a las fichas, acorta los destellos y corrige su repetición en patrones consecutivos. **248 pruebas correctas**, escenario de 28–30 fichas y capturas QA diferenciadas de una run natural.

La [pasada de acabados del 14 de noviembre](docs/MATERIAL_CRAFT_2026-11-14.md) añade grabados/biseles nativos a Imperium, Marfil, Esmeralda y Diamante, y feedback de colocación de 340 ms. **245 pruebas correctas**, regresión de movimiento reducido y capturas QA/partida diferenciadas. Conserva UI, materiales y desbloqueos.

Los [paneles de recursos](docs/RESOURCE_PANELS_2026-11-13.md) conservan su aspecto e incorporan diálogo nativo, Escape, devolución del foco y bloqueo del fondo. Incluye regresión de navegador ES/EN, capturas QA y límites de verificación explícitos.

La [pasada de detalle de UI](docs/UI_DETAILS_2026-11-13.md) mejora contraste, etiquetas ES/EN, controles de móvil y cuatro insignias SVG de edición. **241 pruebas correctas**, capturas nuevas y revisión de distribución a 320, 390, 844 y 1440 px; conserva la composición y los materiales actuales.

La [continuación del 13 de noviembre](docs/TACTICAL_READABILITY_2026-11-13.md) añade puntuación visible por extremo, consulta de fichas colocadas y ayudas compartidas ES/EN, y corrige movimiento reducido en mano/cadena. **227 pruebas correctas**. Incluye una verificación posterior con capturas reales de escritorio/móvil, clics en ambos extremos y tres colocaciones naturales en producción mediante un navegador de prueba aislado. El informe distingue esa revisión parcial de las comprobaciones todavía pendientes.

La auditoría del 8 de noviembre de 2026 corrige persistencia del set, puntuación, guardados, eventos y progresión. La portada, la tipografía y la paleta originales se conservan. Consulta [la revisión y sus límites](docs/AUDIT_2026-11-08.md) antes de dar por validado un sistema.

La [continuación de UI del 9 de noviembre](docs/UI_POLISH_2026-11-09.md) documenta mejoras acotadas de contraste, compras, fichas y fondos de encuentros, con pruebas y capturas diferenciadas de los escenarios QA.

La [entrega visual más reciente](docs/MATERIALS_IMPERIUM_2026-11-10.md) mejora Marfil, Esmeralda, Rubí y Obsidiana con materiales propios, añade Diamante e **Imperium con numerales romanos**, y separa materiales/personajes en el visor. Incluye comparación real entre modelos de Higgsfield y **216 pruebas correctas**. Se conservan los **37 emblemas propios** y las tres colecciones de siete personajes de la [dirección artística](docs/ART_DIRECTION_2026-11-09.md). Colección permite explorar valores y probar tipos, ediciones y pacto sin equipar ni desbloquear contenido.

El progreso y una partida activa se guardan localmente en este navegador/origen. Tras recargar, usa «Continuar partida»; una nueva partida pide confirmar antes de reemplazar la anterior. La exportación incluye la partida activa. No hay clasificación global ni sincronización automática entre dispositivos. Diario y semanal fijan condiciones iniciales sin ventajas de progresión personal; la reproducción requiere la misma versión y las mismas decisiones. Un reto reanudado fuera de su fecha se puede terminar, pero no acredita el reto del período actual.

Solo una pestaña/ventana de la aplicación escribe a la vez; otra espera hasta que se cierre la propietaria. Requiere HTTPS o localhost y Web Locks. Tras completar la primera instalación con red, el service worker prepara también las pantallas sin visitar y las fuentes para el uso offline. No se garantiza la última acción ante un cierre forzoso o si falla el almacenamiento; las recargas ofrecidas por la app se cancelan cuando no pueden guardar.

## Características

### Sistemas de juego
- **31 patrones** detectables con bonus y multiplicadores
- **80 reliquias** con efectos variados y desbloqueo progresivo
- **3 tipos de mutaciones**: eliminar, duplicar, convertir fichas
- **5 tipos de fichas especiales** además de la normal: comodín, dorada, bloqueada, espejo y bomba; cuatro ediciones superpuestas
- **Sistema de eventos** aleatorios entre rondas (bendiciones, maldiciones, elecciones)
- **Sistema de tienda** cada 3 rondas con oro ganado por rendimiento
- **Sistema de jefes** cada 5 rondas con restricciones y recompensas extra
- **Modo diario** con seed fija para comparar runs

### Meta-progresión
- **52 logros** desbloqueables con notificaciones
- **13 modificadores de run** de dificultad, variantes y desafíos
- **Estadísticas persistentes**: mejor ronda, mejor score, runs totales
- **Sistema de desbloqueo** progresivo de reliquias

### UI/UX
- **Animaciones fluidas** con Framer Motion
- **Efectos de partículas** al activar patrones
- **Score popups** animados al ganar puntos
- **Audio sintético** con Web Audio API (sin archivos externos)
- **Tutorial interactivo** para nuevos jugadores
- **Ajustes de accesibilidad y adaptación responsiva** en revisión; los formatos pequeños pueden requerir desplazamiento

## Stack técnico

- Vite + React 18
- TypeScript estricto
- Tailwind CSS
- Framer Motion
- Web Audio API
- localStorage para persistencia

## Estructura del código

```text
src/
├── types/           # Tipos TypeScript
│   ├── domino.ts    # Tile, TileType, GameState, RunStats
│   ├── relic.ts     # Relic, RelicEffect
│   └── reward.ts    # RewardOption
├── engine/          # Lógica del juego
│   ├── tiles.ts     # Generación de fichas + fichas especiales
│   ├── chain.ts     # Validación de cadena (wild, locked)
│   ├── score.ts     # Cálculo de puntuación (golden bonus)
│   ├── patterns.ts  # 31 patrones detectables
│   ├── relics.ts    # 80 reliquias
│   ├── rewards.ts   # Sistema de recompensas
│   ├── round.ts     # Metas de ronda
│   ├── storage.ts   # Persistencia localStorage
│   ├── audio.ts     # Sistema de sonido
│   ├── daily.ts     # Modo diario con seed
│   ├── unlocks.ts   # Desbloqueo de reliquias
│   ├── achievements.ts  # Sistema de logros
│   ├── modifiers.ts # Modificadores de run
│   ├── events.ts    # Eventos aleatorios
│   ├── tutorial.ts  # Tutorial interactivo
│   ├── shop.ts      # Tienda entre rondas
│   └── boss.ts      # Sistema de jefes
├── components/      # Componentes React
│   ├── HomeScreen.tsx
│   ├── GameBoard.tsx
│   ├── GameOverScreen.tsx
│   ├── AchievementsScreen.tsx
│   ├── TileView.tsx
│   ├── Hand.tsx
│   ├── Chain.tsx
│   ├── ScoreBar.tsx
│   ├── PatternDisplay.tsx
│   ├── RelicBar.tsx
│   ├── RewardScreen.tsx
│   ├── TileSelector.tsx
│   ├── NumberConverter.tsx
│   ├── ModifierSelect.tsx
│   ├── EventScreen.tsx
│   ├── ShopScreen.tsx
│   ├── BossIntro.tsx
│   ├── ScorePopup.tsx
│   ├── ParticleEffect.tsx
│   ├── AchievementToast.tsx
│   └── TutorialOverlay.tsx
└── App.tsx          # Flujo principal
```

## Ejemplos de patrones (catálogo completo en `src/engine/patterns.ts`)

| Patrón | Condición | Bonus |
|--------|-----------|-------|
| Cadena Simple | 3+ fichas | +20 pts |
| Cadena Larga | 5+ fichas | x1.5 |
| Cadena Maxima | 7+ fichas | +60 pts, x1.8 |
| Doble Doble | 2+ dobles | +30 pts |
| Triple Doble | 3+ dobles | +50 pts, x1.2 |
| Dominio | Cadena de 3+; un número aparece en 4+ caras efectivas | +25 pts |
| Cierre Exacto | 3+ fichas y extremos iguales | x2 |
| Escalera | 4+ fichas; al menos 3 subidas o 3 bajadas entre caras efectivas | +35 pts |
| Parejas | 4+ fichas; 2+ pares adyacentes de igual suma | +30 pts, x1.15 |
| Racha Alta | Al menos 3 fichas con suma >= 9 | +40 pts |
| Racha Baja | Al menos 4 fichas con suma <= 4 | x1.4 |
| Alternancia | 4+ fichas; dobles y no-dobles alternados | +35 pts, x1.1 |
| Suma Exacta | Suma = 21, 42 o 63 | x1.5 |
| Puente 0-6 | Extremos 0 y 6 | +45 pts |

## Fichas especiales

| Tipo | Aparece | Efecto |
|------|---------|--------|
| Comodin (wild) | Ronda 3+ | Conecta con cualquier número |
| Dorada (golden) | Ronda 2+ | x2 puntos base |
| Bloqueada (locked) | Ronda 5+ | No se puede jugar |
| Espejo (mirror) | Ronda 4+ | Conecta con cualquier extremo y conserva su valor |
| Bomba (bomb) | Ronda 6+ | +15 puntos base |

## Jefes (cada 5 rondas)

| Jefe | Restricción | Recompensa |
|------|-------------|------------|
| Guardian de la Cadena | No dobles | 50 oro |
| Coloso | Sin restricción, meta x2 | 40 oro + reliquia |
| El Minimalista | Max 5 fichas | 45 oro |
| Maestro de Patrones | Min 2 patrones | 55 oro + reliquia |
| El Purificador | Sin comodines, meta x1.8 | 60 oro |

## Metas de ronda

- Ronda 1: 80 pts
- Ronda 2: 120 pts
- Ronda 3: 170 pts
- Ronda 4: 240 pts
- Rondas 5–10: 330, 420, 510, 610, 720 y 850 pts
- Ronda 11+: `850 + (ronda - 10) * 150 + (ronda - 10)² * 22`

## Build de producción

```bash
npm run build
npm run preview
```

Los archivos se generan en `/dist`. La compilación informa del tamaño real de cada fragmento.

Para validar cambios: `npm test`, `npm run lint` y `npm run build`. La CI ejecuta las tres comprobaciones.

El inventario anterior de funciones y las tablas describen sistemas y ejemplos; no equivalen a pruebas de todas sus combinaciones. Véase el informe de auditoría para lo verificado y lo pendiente.
