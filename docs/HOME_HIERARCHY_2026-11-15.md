# Menú: jerarquía y acceso al contenido · 15 de noviembre de 2026

Rama `codex/dominix-stability-polish`; base `f2a8677d54ffdfa9c97cb55db0f12081c1369db2`. Reorganización local de la portada solicitada por el usuario, conservando la identidad visual. Sin publicación, dependencias, recursos generados o consumo de créditos.

## Diagnóstico y alcance

La captura y el código mostraban una jerarquía plana: diez accesos en la cabecera; hasta cinco acciones de partida; cuatro estadísticas; nivel/XP; una fila creciente de skins; desbloqueos, fecha y frase de ambientación. El problema señalado era de organización y prioridad visual, no del contenido o las reglas del juego.

Se conserva el fondo oscuro azul/violeta, DOMINIX centrado con su tratamiento metálico, tipografía sans, acento dorado y lenguaje de botones. Se mantiene el color azul/verde/violeta de los modos, dentro de su selector. No se introduce una nueva dirección editorial, ilustración de portada o paleta verde.

| Antes | Ahora | Información / función conservada |
| --- | --- | --- |
| Continuar compitiendo con cuatro grandes botones de modos | Continuar como acción principal si existe checkpoint; Nueva Run como principal si no existe | Mismo callback y ronda guardada. La nueva partida sigue pasando por configuración, personaje y confirmación antes de sustituir un guardado. |
| Diario, semanal, Endless y Caos dispersos en cabecera/botones | «Otros modos»: cuatro opciones descritas y con sus colores | Mismos destinos/reglas; diario completado continúa deshabilitado. La fecha aparece junto a los retos. |
| Cabecera de diez botones | Cómo jugar, Colección y Menú | Menú agrupa Preparación (Personajes/Talentos), Biblioteca (Colección/Codex), Historial (Estadísticas/Ranking/Logros), modos y Opciones. |
| Estadísticas grandes, XP y desbloqueos siempre expuestos | Resumen compacto «Tu progreso»; detalle bajo demanda | Cuatro estadísticas, barra de nivel, siguiente recompensa y dos próximos desbloqueos; enlace a estadísticas/historial completo. |
| Selector de todas las skins en portada | Apariencia actual y acceso directo a skins | El selector completo permanece en Colección. Apariencia abre directamente su pestaña Skins; el acceso general a Colección conserva Reliquias como destino inicial. |

El coste de esta organización es una acción adicional para ver modos y datos secundarios. La portada inicial muestra siete controles; con un guardado, ocho. La acción de partida está diferenciada del resto. No se crean cuentas o sincronización: «Tu progreso» sigue mostrando los datos locales reales.

## Interacción y ajustes

Se reutiliza `ResourceSheet` y su diálogo nativo para Menú, Modos y Progreso: fondo inerte, Escape, cierre y devolución del foco. En navegador se reprodujo una salida momentánea del foco al body al tabular después del último botón del panel Progreso. Se añade un ciclo explícito entre controles habilitados/visibles, con limpieza del listener al cerrar. El controlador contempla Tab y Shift+Tab; la regresión de navegador descrita comprueba Tab y el retorno al disparador, además del comportamiento existente de los diálogos de recursos.

Se conserva un único landmark principal, perteneciente a App. El contenido de Home no monta otro `main`. El botón Continuar presenta título y ronda en dos líneas deliberadas para evitar un número huérfano a 320 px; su nombre accesible mantiene el anuncio completo. Los objetivos interactivos de portada tienen al menos 44 px de alto. El pie narrativo pasa a flujo normal, sin depender de posición absoluta y espacio de reserva.

Los textos nuevos tienen ES/EN. Se corrigen «Cómo jugar», «Colección», «Estadísticas» y «Próximos desbloqueos» en la navegación española. La siguiente recompensa y los requisitos de desbloqueo se expresan por tipo/condición con textos localizados, en lugar de reutilizar descripciones españolas en la vista inglesa.

La entrada del título dura 350 ms y respeta movimiento reducido; la barra compacta aparece con su valor real, sin la animación de relleno anterior. Se conservan las mejoras de llegada/sonido de la ficha. No se alteran motor, puntuación, RNG, XP, inventario o formato de guardado; la pestaña inicial de Colección es estado efímero de interfaz.

## Herramientas y verificación

Para esta tarea se eligieron React/CSS, terminal y Chrome con Playwright: permiten probar el menú real, sus recorridos, teclado y tamaños. No se usó generación de imágenes, Higgsfield ni un constructor de sitios; no había un recurso raster nuevo que producir. Los recursos gráficos existentes se conservan.

- **340 pruebas correctas en 22 archivos**, nueve casos nuevos de Home: prioridad con/sin checkpoint, ausencia de escrituras durante render ES/EN, contenido secundario fuera de portada, avisos de recuperación y ausencia de un landmark principal anidado.
- TypeScript/compilación de producción, lint, TypeScript de QA y `git diff --check`: correctos. Sigue el aviso previo de Browserslist antiguo. No se cambian dependencias o lockfile.
- Build final: entrada 57,66 kB / 18,69 gzip; App 482,18 / 136,62; Colección 26,38 / 8,85. CSS de Home/App 7.487 bytes y CSS global 130.568 bytes; ambos entran en el precache generado. Son tamaños de archivos, no medidas de FPS o memoria.
- Chrome, producción local 5176, perfiles temporales: ES/EN × primera visita/con progreso y checkpoint × cinco tamaños = **20 estados visuales**. Tamaños 1280×900, 390×844, 320×568, 844×390 y 1920×1080. Acción principal visible sin desplazamiento, sin desbordamiento horizontal y controles de al menos 44 px.
- **60 ciclos de paneles** (Menú/Modos/Progreso en esos estados), con Tab, Escape, contenido, cierre y foco de retorno. Se comprueban los valores 193/200 XP del perfil preparado y los datos vacíos del perfil nuevo.
- **34 comprobaciones agregadas** del script de menú: incluyen abrir y volver desde once destinos, Apariencia directamente en Skins, cancelación de configuración y de reemplazo desde personaje/Endless conservando el checkpoint, diario completado deshabilitado y continuar offline desde el nuevo botón principal en ambos idiomas. Durante la preparación se corrigió un fixture diario que había usado un índice de mes distinto al del motor; no se cambió la semilla del juego.
- Regresión compartida `resourcePanels.browser.mjs` ES/EN: usar/cerrar recursos, backdrop, Escape, resize, teclado y retorno de foco correctos, sin errores. Comprobación de acceso ES/EN: Web Locks no disponible impide abrir el juego; al reintentar con soporte se obtiene acceso.
- Prueba adicional de producción: entrar a Endless desde Otros modos, colocar con teclado usando Among Us, guardar/salir, recargar y continuar offline con estado/RNG conservados; sin reproducir el vuelo al reanudar. Las animaciones y el arte de la entrega anterior se mantienen.
- Cero errores de consola/pageerror en los recorridos finales descritos. Las capturas se inspeccionan visualmente; son del producto real y perfiles de prueba, no maquetas generadas.

Se prepararon estadísticas/nivel para reproducir la densidad de la captura del usuario y se creó un checkpoint inicial real de Endless, ronda 1. Esto no representa el guardado personal del usuario ni una campaña completada. No se usaron los datos personales del navegador. Se archiva el componente previo y capturas de referencia antes de modificarlo.

Límites: no se prueba un móvil físico, lector de pantalla real o una campaña prolongada en esta entrega. El selector de modificadores y la selección de personajes conservan su interfaz anterior; el ciclo de foco descrito corresponde a los paneles ResourceSheet. La prueba offline se realiza en raíz local, no en una nueva publicación remota o subruta. La valoración de la jerarquía y del clic adicional sigue abierta al usuario.

## Criterio de skins recogido del usuario

Se conserva el arte actual. La identidad de una skin puede proceder del entorno/material, además del personaje. Para una futura variante de Among Us se pueden estudiar cubierta de nave, paneles de comunicaciones, escotillas o luces de consola, integrando cantidades contables en esos elementos. Esto evita necesitar una jerarquía arbitraria de personajes para explicar los números. La lectura debe seguir siendo rápida y distinguir cero/valores/tipos especiales. Son ideas documentadas, no recursos nuevos generados o implementados ahora.

## Archivos y evidencias

Producto: `src/components/HomeScreen.tsx`, nuevo `HomeScreen.css`, `ResourceSheet.tsx`, `CollectionScreen.tsx`, `src/App.tsx`, `src/engine/i18n.ts`. Regresión: nuevo `HomeScreen.test.tsx`; `qa/homeNavigation.mjs`, `homeBefore.browser.mjs`, `homeHierarchy.browser.mjs`; scripts existentes adaptados a la entrada por Otros modos en vez de un botón Endless siempre visible.

Evidencias en `outputs/dominix-review/home-hierarchy-2026-11-15/`: `HomeScreen-before.tsx`, `menu-antes-{1280,390}.jpg`, veinte capturas `menu-{fresh,returning}-{es,en}-{ancho}x{alto}.jpg`, paneles de escritorio/móvil, `menu-verificacion.json`, regresiones de recursos/acceso y captura/prueba de colocación real. Los recursos y capturas anteriores se conservan.

Siguiente paso lógico: validar esta jerarquía con el usuario antes de extenderla a la configuración de partida y las pantallas de progresión. No se rediseñan esas pantallas en esta entrega.
