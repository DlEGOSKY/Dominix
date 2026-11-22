# Escenario manual de jefe multifase

Desde la raíz del repositorio:

```sh
node node_modules/vite/bin/vite.js --config qa/vite.config.mjs --host 127.0.0.1 --port 5178 --strictPort
```

Abrir `http://127.0.0.1:5178/qa/`. El servidor usa el GameBoard real y sus handlers; únicamente sustituye el estado inicial, el jefe inicial y la pantalla inicial de tutorial mediante un plugin de desarrollo explícito. Los marcadores deben ser únicos o la preparación falla. No modifica el código fuente en disco ni se activa con `npm run dev`.

La fixture sitúa al Inquisidor en ronda 65 (su primera aparición en la rotación real), con nueve fichas preparadas, dos fases, set persistente, Ritmo Acelerado y Táctico, mano +2 y acciones +3. Reduce las metas ×0,001 para comprobar transición, restricciones y pago sin jugar 64 rondas. No acredita dificultad, balance ni una victoria natural.

Comprobar: comodín desactivado en fase 1; superar la meta y cerrar; texto Fase superada, sin premio todavía; continuar; nueve fichas y presupuesto inicial en fase 2; mínimo de cuatro fichas; cierre, total acumulado y pago único; después continuar, cerrar la siguiente ronda vacía y revisar estadísticas QA. Este origen es independiente del servidor de producción local. El host solo muestra el callback de resultados; no ejecuta el guardado de App.

`npm run build` solo usa `index.html`, y no incluye este host ni el plugin. El modo QA no es una función del producto y nunca debe publicarse como partida de ejemplo real.

El control Movimiento reducido (QA) permite verificar BossIntro y efectos sin alterar las preferencias del origen de producción local. El host utiliza MotionConfig igual que App y limpia su raíz durante HMR. Comprobación adicional: `node node_modules/typescript/bin/tsc --project qa/tsconfig.json --noEmit`.

## Vista puntual de UI

La Mesa táctica permite abrir la explicación de puntuación desde el delta de ficha. `scoreExplanation.browser.mjs` prueba ES/EN en escritorio/móvil, total 501, inspección sin jugar y retorno del foco. Usa los mismos tres argumentos que los otros scripts. [Informe y comprobación separada de recompensas en producción](../docs/SCORE_EXPLANATION_REWARDS_2026-11-14.md).

`http://127.0.0.1:5178/qa/longChain.html` prepara 28 fichas repetidas y permite añadir por cada extremo, deshacer QA y activar un contador de patrón visual. No representa una run natural. `longChain.browser.mjs` verifica ambos extremos y dos activaciones consecutivas con movimiento normal/reducido; recibe los mismos tres argumentos que los otros scripts de navegador. [Resultado y límites](../docs/LONG_CHAINS_2026-11-14.md).

**Acabados** compara textura sola con la capa SVG actual en cuatro materiales y dos tamaños, más estados de Imperium. Es una comparación de capas del componente actual, no dos versiones completas. `materialCraft.browser.mjs` (mismos argumentos que el script de recursos) captura la galería y verifica un único pulso de colocación, su final y su ausencia con movimiento reducido. [Informe](../docs/MATERIAL_CRAFT_2026-11-14.md).

La Mesa táctica incluye ahora MobileInfoBar real a anchura móvil. Preparar consumible QA añade una muestra y registra el uso sin aplicar efectos a la partida. `resourcePanels.browser.mjs` prueba cierre, foco, Escape, cambio de tamaño y ayudas ES/EN. Ejecución con una instalación existente de Playwright: `node --preserve-symlinks qa/resourcePanels.browser.mjs <URL-del-modulo-Playwright> <ruta-Chrome> <carpeta-capturas>`. No instala dependencias. El servidor QA debe estar activo; `DOMINIX_QA_URL` permite indicar otra URL. [Alcance y evidencias](../docs/RESOURCE_PANELS_2026-11-13.md).

**Mesa táctica** (`http://127.0.0.1:5178/qa/ui.html?scene=tactical`) compara seis skins con Hand/Chain reales sobre un estado preparado. Incluye puntuación por extremo, pacto/ediciones, fichas bloqueadas, una ficha sin conexión, restricción de comodín, descarte y restauración local de estados. Colocar/descartar/puntuar usan el motor del juego; este deshacer QA no comprueba el de GameBoard. No escribe progreso ni resultados. Los controles globales de idioma/movimiento reducido afectan a este origen de pruebas. [Cambios y protocolo manual pendiente](../docs/TACTICAL_READABILITY_2026-11-13.md).

La pestaña **Materiales A/B** compara GPT Image 2.6 alta (A, texturas de producto) y Recraft Utility (B, solo QA) con el mismo TileView, valores 1/6 y dos tamaños. La variable CSS de comparación solo sustituye el material de fondo. Añade los siete valores de Imperium y seis tipos con ediciones/pacto. Las fuentes grandes no se importan. [Criterios de selección, costes y pruebas naturales](../docs/MATERIALS_IMPERIUM_2026-11-10.md).

La pestaña Iconos y skins contiene **37 emblemas propios en tres tamaños**, La Banda del Doble, Chatarra de Lujo e Invitados del Umbral con TileView real: valores 0–6 en tamaños pequeño y mediano, tipos especiales y combinaciones de edición/pacto. SkinShowcase y su sección plegable SkinTilePreview son componentes de producto. Equipar solo cambia un estado de muestra dentro de la galería, sin escribir guardados; los controles de tipo/acabado/pacto también son locales. Los atlas son los mismos del producto; las láminas conceptuales no se importan en QA. Los datos son ejemplos artificiales de presentación, sin efectos ni callbacks de partida. [Integración y pruebas reales más recientes](../docs/HIGGSFIELD_INVITADOS_2026-11-10.md).

En el mismo servidor, `http://127.0.0.1:5178/qa/ui.html` ofrece tienda, santuario y un evento con elección. Usa los componentes reales con datos de ejemplo y callbacks de muestra; su cabecera lo indica. No es una partida ni verifica los efectos/economía de GameBoard. Tiene cambio de idioma, movimiento reducido y reinicio de la oferta para comparar escritorio, móvil, fondos y estados de compra. No modifica el progreso del origen local de producción. Esta entrada tampoco se incluye en la build de publicación.

También ofrece Recompensas (seis opciones, familia a 2/3 y aviso de reemplazo de Recarga) y Resultados (normal, cero y 80 rondas). `uiFixtures.ts` contiene los datos artificiales. Abrir Resultados prepara 493 XP/nivel 3 **solo en el almacenamiento del origen QA 5178**, para comprobar la barra; no simula el guardado de App ni escribe en el origen de producción 5176. El caso largo es una prueba de distribución y consulta, no de balance ni progreso real. Movimiento reducido permite saltar las presentaciones o, desactivado, verificar que no hay botones de resultados expuestos durante el resumen. Las elecciones llaman callbacks de muestra; Saltar recompensa vuelve a la tienda de pruebas.
