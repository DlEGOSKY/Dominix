# Dominix · revisión de pendientes y siguiente lote visual

Revisión del 15 de noviembre de 2026, posterior a [la aplicación de prioridades](PRIORITIES_IMPLEMENTATION_2026-11-15.md). Rama `codex/dominix-stability-polish`, HEAD `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`, con el trabajo local anterior conservado.

**Actualización del 17/11:** [lote implementado y verificado](MATERIAL_EXPRESS_2026-11-17.md). Materiales, Expreso, propietario único de celebración y copia con confirmación/error ya están integrados. Este documento conserva el diagnóstico/brief anterior; sus cifras de 30 skins, tres sonidos y cuatro grabados describen aquel estado. El diagnóstico aislado de copia permanece archivado; `qa/reviewAudit.mjs` ahora verifica la corrección contra `clipboard.ts`.

## Estado real

La tanda anterior está terminada dentro del alcance descrito en su informe. El videojuego sigue en desarrollo. Se han vuelto a ejecutar **460 pruebas en 27 archivos**, todas correctas. Los 14 archivos principales incluidos en las huellas de la entrega anterior no han cambiado. Esto permite conservar aquella evidencia con su alcance, sin presentar una nueva prueba de navegador o de rendimiento que no se ha realizado en esta revisión.

Están implementados y comprobados en la entrega anterior: reconciliación de 31 patrones, equivalencia de 2.031 cadenas, correcciones de RNG/guardado del jefe, journal adicional de run, liquidación recuperable ante cuota, práctica básica, reanudación offline y claridad de Endless. No se vuelve a describir ese trabajo como pendiente.

## Pendientes técnicos, clasificados

| Prioridad | Pendiente | Estado de la evidencia | Criterio de cierre |
|---|---|---|---|
| P0 | Durabilidad del perfil y liquidación interrumpida por cierre de proceso | Límite no verificado. El journal protege la run; el rollback síncrono no hace atómicas todas las claves de XP/historial | Interrumpir puntos de la liquidación y garantizar un resultado recuperable, sin duplicar XP/historial |
| P1 | Pico al resolver cadenas grandes | Medido en la entrega anterior: hasta 348 ms en QA, CPU ×4. No es una medición nueva de esta revisión | Perfil JS/React y compositor, menos trabajo en el primer frame; móvil físico modesto |
| P1 | Celebración de jefe invocada dos veces | Demostrado por código: `GameBoard.tsx` llama `celebrateBigEvent` al entregar recompensa y `BossDefeatedOverlay.tsx` vuelve a llamarlo al mostrarse. El helper no deduplica. No se atribuye una cantidad de lag sin medirlo | Un propietario del efecto; una sola celebración por victoria; reanudación/StrictMode sin repetición |
| P1 | Confirmación incorrecta al copiar resumen del historial | Demostrado por código y ejecución aislada de la función real `shareRun`: devuelve éxito si falta Clipboard API o si su promesa rechaza. Su `try/catch` no espera el rechazo asíncrono | Esperar confirmación; mostrar fallo/fallback correcto; comprobar permiso denegado y API ausente en navegador |
| P1 | Copiar semilla desde la mesa sin gestionar fallo | Demostrado por lectura: llamada directa a `navigator.clipboard.writeText`, sin comprobar API/rechazo | Compartir el tratamiento de errores del historial y comprobar teclado/navegador |
| P2 | Compartir/importar una run reproducible | Funcionalidad desconectada: `ShareRunScreen.tsx` conserva `example-seed-123`, cifras de ejemplo y TODO; su importación solo muestra los datos. El historial actual no guarda la semilla de cada registro | Guardar semilla/reglas/configuración suficiente y validar un formato real. No conectar la pantalla de ejemplo como si estuviera terminada |
| P2 | Tutorial contextual | Práctica básica implementada; faltan mapa, compras, eventos, fases y sinergias | Lecciones opcionales en su contexto, sin premiar XP ni modificar la run real |
| P2 | Balance y cobertura de campaña | Hay replays y fixtures; no hay acreditación de todos los personajes/semillas/modificadores/jefes | Recorridos normales con distintas builds, más interludios, decisiones y partidas hasta resultados |
| P2 | Accesibilidad y dispositivos | Táctil de 44 px verificado; puntero fino conserva descarte compacto. Falta lector de pantalla real y móvil físico | Foco/lectura/contraste, objetivos de interacción y orientación comprobados con las herramientas correspondientes |
| Diseño | Avalancha/Crescendo y reglas de Endless | Se conserva el comportamiento actual. Los dos patrones comparten condición; Endless exige cadena no vacía | Decidir cambios de balance explícitos, con ejemplos/migración de reglas si procede |

El botón de compartir resumen de Stats, la exportación/importación **del perfil completo** en Opciones y la pantalla incompleta de compartir runs son tres cosas distintas. La existencia del ejemplo desconectado no invalida las pruebas del exportador de guardados real. El ranking disponible sigue siendo local.

`MotionConfig` ya existe en `App.tsx`, por lo que no se declara rota toda la preferencia de movimiento reducido por no encontrar un hook en cada componente. Sí queda por armonizar la cadencia de victoria de jefe: overlay de 2.600 ms, animación rápida y capas decorativas. Su impacto concreto requiere una comprobación específica.

## Base visual disponible

- **30 skins** registradas, probador, filtros, favoritos y muestras de mano/cadena.
- **Seis materiales** con WebP reales de 96 × 192 px: marfil, esmeralda, rubí, diamante, obsidiana y romano. Total actual: **7.768 bytes**. Son recursos existentes con procedencia documentada; no hace falta sustituirlos por texturas enormes para aportar detalle.
- Grabados/acabados periféricos propios para marfil, esmeralda, diamante y romano. Rubí y obsidiana tienen su textura, pero todavía no un acabado equivalente en `MaterialTooling`.
- Contacto de colocación con tres familias de sonido: piedra, vidrio y metal. El movimiento de impacto actual es el mismo entre materiales; existe margen para diferenciarlos sin cambiar las reglas.
- **80 reliquias con componentes de icono distintos**, de los cuales **37 emblemas son dibujos propios** y los demás usan la biblioteca atribuida. Las pruebas de identidad no garantizan que todas las siluetas se distingan perceptivamente a 16 px.
- Cinco mundos de dominó contable: vidriera, reactor, templo, forja y gabinete alquímico, además de las colecciones ilustradas anteriores.

## Siguiente lote: materiales y movimiento

La dirección conserva el azul tinta/violeta, oro de acciones, marco y tamaño de ficha. Cada material debe reconocerse por su superficie y borde, manteniendo un centro tranquilo para los puntos y las señales de tipo/edición. Son propuestas de producción, todavía no nuevos acabados integrados.

| Material | Acabado propuesto | Movimiento puntual |
|---|---|---|
| Marfil | Grano fino, pequeños desgastes periféricos y grabado de marquetería; conservar puntos oscuros | Asentamiento firme y corto, con brillo satinado discreto |
| Esmeralda | Vetas internas y planos de talla distinguibles a tamaño de juego; borde translúcido ilustrado | Una luz breve en el bisel al conectar |
| Diamante | Facetas con direcciones coherentes, puntos oscuros y separación clara del fondo | Un reflejo especular corto sobre el borde |
| Obsidiana | Fracturas curvas propias de la piedra, aristas pulidas y centro negro legible | Un destello frío muy localizado |
| Rubí | Profundidad de cristal y montura propia, evitando parecer una Esmeralda recoloreada | Reflejo rojizo breve, distinto del pulso de la ficha bomba |
| Imperium | Pátina de bronce y desgaste fino del grabado material | Contacto seco; conservar numerales y la colección Roma Eterna aprobada |

La superficie actual es 2D; estos acabados no se presentan como iluminación/refracción física de un motor 3D. SVG/CSS resuelven borde, grabado, valor y señales exactas; una nueva imagen solo se justifica si mejora la materia visible. El generador integrado está disponible para esa parte. El lote propuesto no requiere instalar un plugin ni consumir créditos de Higgsfield.

Reglas de movimiento del lote:

1. Un impacto por colocación y un único pulso de unión. Mantener la cancelación segura de vuelo/deshacer/redimensionado.
2. Variaciones pequeñas por material, con duración normal/rápida definida; reducido muestra el estado final sin desplazamiento/destello.
3. Nada de animación permanente por punto, bucles de brillo en todas las fichas o filtros animados sobre toda la cadena.
4. Variaciones de desgaste estables por ficha; no sortear la apariencia en cada render ni consumir el RNG jugable.
5. Una sola celebración de jefe. Revisar fin de fase, recompensa y desbloqueo para que comuniquen sucesos distintos y los controles permanezcan disponibles.

## Colección nueva prioritaria: Expreso de Medianoche

Una ficha completa como panel/vagón de un tren nocturno: madera oscura barnizada, herrajes de latón, placas de esmalte y vidrio ámbar. Cada mitad corresponde a un compartimento distinto. La separación entre mitades es parte del ensamblaje del vagón.

- **Valores 1–6:** exactamente esa cantidad de ventanas encendidas, en posiciones de lectura de dominó. Las ventanas activas tienen forma/luz inequívoca; el marco decorativo no añade ventanas que puedan contarse por error.
- **Cero:** compartimento apagado, con una marca vacía discreta; no seis ventanas oscuras que parezcan seis puntos.
- **Dobles:** dos compartimentos con la misma cantidad; ningún personaje sirve como rango numérico.
- **Colocación:** reflejo breve que cruza el marco, ligero asentamiento de madera/metal y una unión semejante a un acople. Sin tren moviéndose continuamente detrás de los valores.
- **Fichas especiales:** conservar señales de comodín, bomba, espejo, bloqueo, edición y pacto por encima del material. Los valores accesibles permanecen numéricos.

Esta colección tiene prioridad sobre añadir otro panel de reactor espacial: el registro ya incluye `orbital_reactor`. Una futura lectura de nave para Among Us debe aportar estructura de escotilla/portillos y conteo claro, sin sustituir la versión aprobada automáticamente. Observatorio y Taller de Autómatas necesitan diferenciarse mejor de las colecciones astrales/reactor/forja existentes antes de entrar al mismo lote.

## Iconos: coherencia además de variedad

Preparar una lámina de las 80 reliquias a tamaño de HUD y revisar familias propensas a confundirse: relojes, coronas y cadenas. Sustituir primero las siluetas que fallen la lectura, respetando nombre/efecto y manteniendo una gramática común de trazos. No tratar los 80 componentes distintos como prueba de 80 dibujos inequívocos, ni sustituir todos por retratos.

## Criterios de entrega del lote visual

Comparar las seis superficies y la colección nueva en las caras reales de 36/48 px; cero a seis, dobles, mano/cadena y todos los estados especiales. Capturas de escritorio, 390 px, 320 px y horizontal; movimiento normal/rápido/reducido. Medir carga/peso y cadenas de 7/15/30 fichas. Ningún cambio de puntuación, desbloqueos existentes, semilla o guardados por equipar una skin. Documentar procedencia de los recursos realmente creados y enseñar capturas de lo integrado.

Orden propuesto del trabajo: corregir propietarios de celebración y confirmación de copia; entregar el lote de materiales más Expreso con contacto propio; continuar tutorial contextual y pruebas de durabilidad/perfil. El perfil del pico de resolución permanece abierto y limita el presupuesto de efectos nuevos.

## Evidencia de esta revisión

`qa/reviewAudit.mjs` ejecuta de forma aislada la función real de compartir y mide los archivos de textura, sin escribir en el perfil del jugador. Resultado: `outputs/dominix-review/review-art-backlog-2026-11-15/review-evidence.json`. Las 460 pruebas se volvieron a ejecutar en esta revisión. No se han cambiado fichas, materiales, escenas o reglas del producto en este documento de planificación.
