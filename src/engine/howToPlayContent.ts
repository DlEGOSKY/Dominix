/**
 * howToPlayContent — bilingual content registry for the HowToPlayScreen.
 *
 * The tutorial screen carries far more long-form copy (paragraphs, demo
 * captions, tip lists, meta-system blurbs) than the rest of the UI, so
 * keeping it in `i18n.ts` would balloon that file with 150+ keys whose only
 * caller is one screen. We isolate it here with two parallel constants
 * (ES / EN) and a single getter that resolves the active language.
 *
 * Add a new locale by extending the `Lang` type, declaring a new constant
 * with the same shape, and updating `getHowToPlayContent` to map it.
 */
import { getLanguage } from "./i18n";

type Lang = "es" | "en";

export interface HowToPlayContent {
  // Shell
  back: string;
  title: string;
  prev: string;
  next: string;
  startPlay: string;
  sections: { id: string; title: string }[];

  // Section 1: basics
  basics: {
    tilesHeading: string;
    tilesIntro: string;
    tile35Label: string;
    tile35Value: string;
    tile66Label: string;
    tile66Value: string;
    tile11Label: string;
    tile11Value: string;
    connectHeading: string;
    connectIntro: string;
    invalidHint: string;
    demoStart: string;
    demoPlayFirst: string;
    demoConnectFive: string;
    demoConnectTwo: string;
    demoPattern: string;
  };

  // Section 2: gameplay
  gameplay: {
    goalHeading: string;
    goalIntro: string;
    goalNeedMore: string;
    roundDemoHeading: string;
    roundDemoIntro: string;
    roundDemoStep1: string;
    roundDemoStep2: string;
    roundDemoStep3: string;
    roundDemoStep4: string;
    roundDemoStep5: string;
    roundDemoStep6: string;
    progressionHeading: string;
    progressionIntro: string;
  };

  // Section 3: patterns
  patterns: {
    sectionHeading: string;
    sectionIntro: string;
    chainSimpleName: string;
    chainSimpleDesc: string;
    doubleDoubleName: string;
    doubleDoubleDesc: string;
    dominionName: string;
    dominionDesc: string;
    ladderName: string;
    ladderDesc: string;
    comboHeading: string;
    comboBadge: string;
    comboIntro: string;
    combo2: string;
    combo3: string;
    combo4: string;
  };

  // Section 4: advanced
  advanced: {
    specialTilesHeading: string;
    specialTilesIntro: string;
    wildName: string;
    wildDesc: string;
    goldenName: string;
    goldenDesc: string;
    lockedName: string;
    lockedDesc: string;
    mirrorName: string;
    mirrorDesc: string;
    bombName: string;
    bombDesc: string;
    specialDemoHeading: string;
    specialDemoStep1: string;
    specialDemoStep2: string;
    specialDemoStep3: string;
    specialDemoStep4: string;
    relicsHeading: string;
    relicsIntro: string;
    familyPatron: string;
    familyNumero: string;
    familyFuerza: string;
    familyCadena: string;
    familyAccion: string;
    familyPatronBonus: string;
    familyNumeroBonus: string;
    familyFuerzaBonus: string;
    familyCadenaBonus: string;
    familyAccionBonus: string;
    activeMutationsHeading: string;
    activeMutationsIntro: string;
    mut1Name: string;
    mut1Desc: string;
    mut2Name: string;
    mut2Desc: string;
    mut3Name: string;
    mut3Desc: string;
    mut4Name: string;
    mut4Desc: string;
    mut5Name: string;
    mut5Desc: string;
    mut6Name: string;
    mut6Desc: string;
    shopHeading: string;
    shopIntro: string;
    shopRelics: string;
    shopGild: string;
    shopRemove: string;
    shopReduce: string;
    bossesHeading: string;
    bossesIntro: string;
    bossExampleSingleName: string;
    bossExampleSingleDesc: string;
    bossExampleMultiName: string;
    bossExampleMultiDesc: string;
    actionsHeading: string;
    actionsIntro: string;
    actionsBaseLabel: string;
    actionsDiscardLabel: string;
    actionsDrawLabel: string;
    modesHeading: string;
    modeNewName: string;
    modeNewDesc: string;
    modeDailyName: string;
    modeDailyDesc: string;
    modeEndlessName: string;
    modeEndlessDesc: string;
    tipsHeading: string;
    tip1: string;
    tip2: string;
    tip3: string;
    tip4: string;
    tip5: string;
    tip6: string;
  };

  // Section 5: meta
  meta: {
    title: string;
    intro: string;
    consumablesTitle: string;
    consumablesTag: string;
    consumablesBody: string;
    editionsTitle: string;
    editionsTag: string;
    editionsBody: string;
    celestialTitle: string;
    celestialTag: string;
    celestialBody: string;
    alignmentsTitle: string;
    alignmentsTag: string;
    alignmentsBody: string;
    pactTitle: string;
    pactTag: string;
    pactBody: string;
    chaosTitle: string;
    chaosTag: string;
    chaosBody: string;
    codexTitle: string;
    codexTag: string;
    codexBody: string;
    legacyTitle: string;
    legacyTag: string;
    legacyBody: string;
    charactersTitle: string;
    charactersTag: string;
    charactersBody: string;
    shortcutsHeading: string;
    shortcutPlay: string;
    shortcutDraw: string;
    shortcutUndo: string;
  };
}

const ES: HowToPlayContent = {
  back: "Volver",
  title: "Como jugar",
  prev: "Anterior",
  next: "Siguiente",
  startPlay: "Empezar a jugar",
  sections: [
    { id: "basics",   title: "Que es el domino" },
    { id: "gameplay", title: "Como se juega" },
    { id: "patterns", title: "Patrones" },
    { id: "advanced", title: "Sistemas avanzados" },
    { id: "meta",     title: "Sistemas meta" },
  ],
  basics: {
    tilesHeading: "La ficha de domino",
    tilesIntro: "Cada ficha tiene **dos mitades** con puntos del 0 al 6. Los puntos representan el **valor** de cada lado.",
    tile35Label: "Ficha 3|5",
    tile35Value: "Valor: 8 puntos",
    tile66Label: "Doble 6",
    tile66Value: "Valor: 12 puntos",
    tile11Label: "Doble 1",
    tile11Value: "Valor: 2 puntos",
    connectHeading: "Como se conectan",
    connectIntro: "Las fichas se conectan cuando **los numeros coinciden**. Mira como se forma una cadena paso a paso:",
    invalidHint: "No se puede conectar: 3|5 no tiene 1",
    demoStart: "Empieza con 4 fichas en la mano",
    demoPlayFirst: "Juega 3|5 para iniciar la cadena (+8 pts)",
    demoConnectFive: "5|2 conecta por el 5 (+7 pts)",
    demoConnectTwo: "2|6 conecta por el 2 (+8 pts)",
    demoPattern: "Patron activado: Cadena Simple (+15 bonus)",
  },
  gameplay: {
    goalHeading: "El objetivo",
    goalIntro: "En cada ronda tienes una **meta de puntos** que debes alcanzar. Si la superas, avanzas a la siguiente ronda. Si no, la run termina.",
    goalNeedMore: "Necesitas 20 puntos mas para superar la ronda",
    roundDemoHeading: "Jugando una ronda",
    roundDemoIntro: "Empiezas con **7 fichas**. Coloca fichas, forma cadenas y trata de superar la meta. Asi se ve:",
    roundDemoStep1: "Ronda 1 — Meta: 80 pts. Tu mano esta lista",
    roundDemoStep2: "Juegas el doble 3 para empezar (+6)",
    roundDemoStep3: "3|5 conecta por el 3 (+8)",
    roundDemoStep4: "5|2 conecta por el 5 (+7). Patron: Cadena Simple",
    roundDemoStep5: "2|6 conecta por el 2 (+8). Cadena crece",
    roundDemoStep6: "6|6 cierra. Score: 86 > Meta 80. Ronda ganada",
    progressionHeading: "Progresion de rondas",
    progressionIntro: "Las metas aumentan cada ronda. Despues de ganar, recibes **oro** y eliges una **mejora** (reliquia o mutacion).",
  },
  patterns: {
    sectionHeading: "Sistema de patrones",
    sectionIntro: "Los patrones son **combinaciones especiales** que otorgan puntos bonus. Detectarlos y activarlos es clave para superar las metas mas altas.",
    chainSimpleName: "Cadena Simple",
    chainSimpleDesc: "3+ fichas en la cadena",
    doubleDoubleName: "Doble Doble",
    doubleDoubleDesc: "2 dobles en la cadena",
    dominionName: "Dominio",
    dominionDesc: "Un numero aparece 3+ veces",
    ladderName: "Escalera",
    ladderDesc: "Secuencia de numeros consecutivos",
    comboHeading: "Sistema de combos",
    comboBadge: "COMBO",
    comboIntro: "Cuando activas **2 o mas patrones** en la misma cadena, obtienes un bonus de combo que multiplica tus puntos.",
    combo2: "2 patrones = x1.15",
    combo3: "3 patrones = x1.35",
    combo4: "4+ = x1.6",
  },
  advanced: {
    specialTilesHeading: "Fichas especiales",
    specialTilesIntro: "Durante la run puedes encontrar fichas con propiedades unicas.",
    wildName: "Wild",
    wildDesc: "Conecta con cualquier numero",
    goldenName: "Dorada",
    goldenDesc: "Duplica su valor base (x2)",
    lockedName: "Bloqueada",
    lockedDesc: "Se desbloquea al activar un patron",
    mirrorName: "Espejo",
    mirrorDesc: "Conecta con cualquier extremo. Copia el valor al que se conecta",
    bombName: "Bomba",
    bombDesc: "+15 puntos extra de base al jugarla en la cadena",
    specialDemoHeading: "Fichas especiales en accion",
    specialDemoStep1: "Tienes fichas especiales en tu mano",
    specialDemoStep2: "Espejo conecta al 5 y copia el valor. Ahora ambos extremos son 5",
    specialDemoStep3: "Bomba da +15 extra al score base. Gran impulso",
    specialDemoStep4: "Wild conecta con cualquier numero sin restriccion",
    relicsHeading: "Reliquias",
    relicsIntro: "Las reliquias son **mejoras permanentes** que modifican las reglas del juego. Cada una pertenece a una **familia** con color y efecto propios. Juntar **3 reliquias de la misma familia** activa un bonus de set permanente.",
    familyPatron: "Patron",
    familyNumero: "Numero",
    familyFuerza: "Fuerza",
    familyCadena: "Cadena",
    familyAccion: "Accion",
    familyPatronBonus: "+25% bonus de patrones",
    familyNumeroBonus: "+30 puntos fijos",
    familyFuerzaBonus: "x1.10 multiplicador global",
    familyCadenaBonus: "+4 pts por ficha en cadena",
    familyAccionBonus: "+1 accion por ronda",
    activeMutationsHeading: "Poderes activos",
    activeMutationsIntro: "Desde la ronda 3 puedes obtener **poderes activos** como recompensa. Se activan durante la partida gastando acciones o puntos.",
    mut1Name: "Barajar mano",
    mut1Desc: "Devuelve fichas al pool y roba nuevas",
    mut2Name: "Toque salvaje",
    mut2Desc: "Tu proxima ficha se vuelve wild",
    mut3Name: "Detonacion",
    mut3Desc: "+25 puntos instantaneos",
    mut4Name: "Segundo aliento",
    mut4Desc: "Recupera 4 acciones extra",
    mut5Name: "Reversa",
    mut5Desc: "Intercambia extremos de la cadena",
    mut6Name: "Ancla",
    mut6Desc: "La proxima ficha no cambia el extremo",
    shopHeading: "Tienda",
    shopIntro: "Cada 3 rondas aparece la tienda donde puedes gastar **oro** en:",
    shopRelics: "Reliquias",
    shopGild: "Dorar ficha",
    shopRemove: "Eliminar ficha",
    shopReduce: "Reducir meta",
    bossesHeading: "Jefes",
    bossesIntro: "Cada 5 rondas enfrentas un **jefe** con restricciones especiales. Algunos tienen **varias fases** con restricciones diferentes. Derrotarlo otorga oro extra y a veces una reliquia.",
    bossExampleSingleName: "El Coleccionista",
    bossExampleSingleDesc: "Restriccion: No puedes usar fichas dobles",
    bossExampleMultiName: "El Inquisidor",
    bossExampleMultiDesc: "Fase 1: Solo dobles. Fase 2: Minimo 4 fichas en cadena",
    actionsHeading: "Acciones",
    actionsIntro: "Cada ronda tienes un **limite de acciones**. Jugar, descartar y robar fichas consume acciones. Cuando se agotan, la ronda termina automaticamente.",
    actionsBaseLabel: "Acciones base por ronda",
    actionsDiscardLabel: "Descartes por ronda",
    actionsDrawLabel: "Robos por ronda",
    modesHeading: "Modos de juego",
    modeNewName: "Nueva Run",
    modeNewDesc: "Modo clasico. Avanza rondas, supera metas, construye tu build.",
    modeDailyName: "Reto Diario",
    modeDailyDesc: "Una run con seed fija. Todos juegan la misma partida. Compara tu score.",
    modeEndlessName: "Endless",
    modeEndlessDesc: "Sin meta. Juega hasta que quieras parar. Score acumulado infinito.",
    tipsHeading: "Consejos para empezar",
    tip1: "Prioriza cadenas largas para activar \"Cadena Simple\" y \"Cadena Larga\"",
    tip2: "Guarda los dobles para activar \"Doble Doble\" o \"Triple Doble\"",
    tip3: "Las reliquias se acumulan - elige las que complementen tu estrategia",
    tip4: "Ahorra oro para la tienda, las reliquias compradas son muy fuertes",
    tip5: "Las fichas espejo y bomba aparecen en rondas avanzadas, usalas estrategicamente",
    tip6: "Los poderes activos cuestan recursos, activalos solo cuando valga la pena",
  },
  meta: {
    title: "Capas meta del juego",
    intro: "Dominix se profundiza con sistemas que se revelan a medida que juegas. No necesitas dominar todos desde el inicio: emerge naturalmente al explorar.",
    consumablesTitle: "Consumibles",
    consumablesTag: "Tarot",
    consumablesBody: "Items de un solo uso que encuentras en tiendas y recompensas. Cambian la mano, revelan fichas, transforman dobles o dan puntos de golpe. Se guardan hasta que los uses.",
    editionsTitle: "Ediciones de ficha",
    editionsTag: "Edicion",
    editionsBody: "Algunas fichas tienen una edicion (Dorada, Holografica, etc) que les da un bonus extra al jugarlas. Se descubren en el codex y se pueden generar mediante eventos o con el Alquimista.",
    celestialTitle: "Cartas celestes",
    celestialTag: "Firmamento",
    celestialBody: "Cartas coleccionables que multiplican tu puntaje segun su firmamento (Solar, Lunar, Estelar, Cometa, Profundo). Cada firmamento potencia un estilo distinto: dobles, cadenas largas, patrones rapidos o pocas fichas.",
    alignmentsTitle: "Alineaciones",
    alignmentsTag: "Set bonus",
    alignmentsBody: "Tener 3 cartas del mismo firmamento activa la Alineacion de ese firmamento con un bonus extra. Si acumulas 5 cartas distintas activas la Alineacion Cosmica: tu jugada mas devastadora.",
    pactTitle: "Pacto Sagrado",
    pactTag: "Modifier",
    pactBody: "Una ficha elegida al empezar la run queda marcada como pactada: +100 al jugarla. Evoluciona si la juegas dentro de un patron o con una edition. Con alineacion cosmica activa su bonus se amplifica un 20%.",
    chaosTitle: "Modo Caos",
    chaosTag: "Modifier",
    chaosBody: "Cada ronda rolea un giro aleatorio: buff (score+, meta-, accion+), nerf (meta+, accion-, patron-) o raro (shuffle, consumible gratis). Activado con el modifier Caos; da +10% score base de compensacion.",
    codexTitle: "Codex",
    codexTag: "Discovery",
    codexBody: "Registra automaticamente cada patron, jefe, carta celeste y giro de caos que descubres. Los no descubiertos se muestran como '???' hasta que los vivas en una run. Accesible desde el menu principal.",
    legacyTitle: "Legado",
    legacyTag: "Herencia",
    legacyBody: "Al terminar cada run se guarda automaticamente 1 carta celeste + 1 consumible. Tu proxima run los hereda al iniciar: un toast te avisa cuando activas el legado. Conecta tus partidas entre si.",
    charactersTitle: "Personajes",
    charactersTag: "Passive",
    charactersBody: "Cada personaje empieza con condiciones distintas: Arquitecto (+5 por patron), Matematica (+score con dobles), Bombardero (bombas), Mercader (+oro), Alquimista (editions), Oraculo (celeste gratis), Cartografo (+score), Ermitaño (pacto gratis).",
    shortcutsHeading: "Atajos de teclado",
    shortcutPlay: "Jugar ficha",
    shortcutDraw: "Robar",
    shortcutUndo: "Deshacer",
  },
};

const EN: HowToPlayContent = {
  back: "Back",
  title: "How to play",
  prev: "Previous",
  next: "Next",
  startPlay: "Start playing",
  sections: [
    { id: "basics",   title: "What is domino" },
    { id: "gameplay", title: "How to play" },
    { id: "patterns", title: "Patterns" },
    { id: "advanced", title: "Advanced systems" },
    { id: "meta",     title: "Meta systems" },
  ],
  basics: {
    tilesHeading: "The domino tile",
    tilesIntro: "Each tile has **two halves** with pips from 0 to 6. The pips represent the **value** of each side.",
    tile35Label: "Tile 3|5",
    tile35Value: "Value: 8 points",
    tile66Label: "Double 6",
    tile66Value: "Value: 12 points",
    tile11Label: "Double 1",
    tile11Value: "Value: 2 points",
    connectHeading: "How they connect",
    connectIntro: "Tiles connect when **the numbers match**. Watch how a chain forms step by step:",
    invalidHint: "Cannot connect: 3|5 has no 1",
    demoStart: "Start with 4 tiles in your hand",
    demoPlayFirst: "Play 3|5 to start the chain (+8 pts)",
    demoConnectFive: "5|2 connects via the 5 (+7 pts)",
    demoConnectTwo: "2|6 connects via the 2 (+8 pts)",
    demoPattern: "Pattern triggered: Simple Chain (+15 bonus)",
  },
  gameplay: {
    goalHeading: "The goal",
    goalIntro: "Each round has a **score target** you must beat. If you exceed it, you advance. If not, the run ends.",
    goalNeedMore: "You need 20 more points to clear the round",
    roundDemoHeading: "Playing a round",
    roundDemoIntro: "You start with **7 tiles**. Place tiles, build chains and try to beat the target. It looks like this:",
    roundDemoStep1: "Round 1 — Target: 80 pts. Your hand is ready",
    roundDemoStep2: "You play double 3 to open (+6)",
    roundDemoStep3: "3|5 connects via the 3 (+8)",
    roundDemoStep4: "5|2 connects via the 5 (+7). Pattern: Simple Chain",
    roundDemoStep5: "2|6 connects via the 2 (+8). Chain grows",
    roundDemoStep6: "6|6 closes. Score: 86 > Target 80. Round won",
    progressionHeading: "Round progression",
    progressionIntro: "Targets grow every round. After winning, you receive **gold** and pick an **upgrade** (relic or mutation).",
  },
  patterns: {
    sectionHeading: "Pattern system",
    sectionIntro: "Patterns are **special combinations** that grant bonus points. Recognizing and triggering them is key to clearing higher targets.",
    chainSimpleName: "Simple Chain",
    chainSimpleDesc: "3+ tiles in the chain",
    doubleDoubleName: "Double Double",
    doubleDoubleDesc: "2 doubles in the chain",
    dominionName: "Dominion",
    dominionDesc: "A number appears 3+ times",
    ladderName: "Ladder",
    ladderDesc: "Sequence of consecutive numbers",
    comboHeading: "Combo system",
    comboBadge: "COMBO",
    comboIntro: "When you trigger **2 or more patterns** in the same chain, you earn a combo bonus that multiplies your points.",
    combo2: "2 patterns = x1.15",
    combo3: "3 patterns = x1.35",
    combo4: "4+ = x1.6",
  },
  advanced: {
    specialTilesHeading: "Special tiles",
    specialTilesIntro: "During a run you can find tiles with unique properties.",
    wildName: "Wild",
    wildDesc: "Connects to any number",
    goldenName: "Golden",
    goldenDesc: "Doubles its base value (x2)",
    lockedName: "Locked",
    lockedDesc: "Unlocks when a pattern triggers",
    mirrorName: "Mirror",
    mirrorDesc: "Connects to any end. Copies the value it connects to",
    bombName: "Bomb",
    bombDesc: "+15 extra base points when played in the chain",
    specialDemoHeading: "Special tiles in action",
    specialDemoStep1: "You have special tiles in your hand",
    specialDemoStep2: "Mirror connects to the 5 and copies the value. Both ends are now 5",
    specialDemoStep3: "Bomb adds +15 to the base score. Big swing",
    specialDemoStep4: "Wild connects to any number with no restriction",
    relicsHeading: "Relics",
    relicsIntro: "Relics are **permanent upgrades** that change the rules. Each belongs to a **family** with its own color and effect. Gathering **3 relics from the same family** activates a permanent set bonus.",
    familyPatron: "Pattern",
    familyNumero: "Number",
    familyFuerza: "Force",
    familyCadena: "Chain",
    familyAccion: "Action",
    familyPatronBonus: "+25% pattern bonus",
    familyNumeroBonus: "+30 flat points",
    familyFuerzaBonus: "x1.10 global multiplier",
    familyCadenaBonus: "+4 pts per chain tile",
    familyAccionBonus: "+1 action per round",
    activeMutationsHeading: "Active powers",
    activeMutationsIntro: "From round 3 onward you can earn **active powers** as rewards. They trigger during a round, costing actions or points.",
    mut1Name: "Shuffle hand",
    mut1Desc: "Returns tiles to the pool and draws new ones",
    mut2Name: "Wild touch",
    mut2Desc: "Your next tile becomes wild",
    mut3Name: "Detonation",
    mut3Desc: "+25 instant points",
    mut4Name: "Second wind",
    mut4Desc: "Recover 4 extra actions",
    mut5Name: "Reverse",
    mut5Desc: "Swap the chain's ends",
    mut6Name: "Anchor",
    mut6Desc: "The next tile does not change the open end",
    shopHeading: "Shop",
    shopIntro: "Every 3 rounds the shop opens, where you can spend **gold** on:",
    shopRelics: "Relics",
    shopGild: "Gild a tile",
    shopRemove: "Remove a tile",
    shopReduce: "Reduce target",
    bossesHeading: "Bosses",
    bossesIntro: "Every 5 rounds you face a **boss** with special restrictions. Some bosses have **multiple phases** with different rules. Defeating them grants extra gold and sometimes a relic.",
    bossExampleSingleName: "The Collector",
    bossExampleSingleDesc: "Restriction: You cannot use double tiles",
    bossExampleMultiName: "The Inquisitor",
    bossExampleMultiDesc: "Phase 1: Doubles only. Phase 2: At least 4 tiles in the chain",
    actionsHeading: "Actions",
    actionsIntro: "Each round you have an **action limit**. Playing, discarding, and drawing tiles all spend actions. When they run out, the round ends.",
    actionsBaseLabel: "Base actions per round",
    actionsDiscardLabel: "Discards per round",
    actionsDrawLabel: "Draws per round",
    modesHeading: "Game modes",
    modeNewName: "New Run",
    modeNewDesc: "Classic mode. Advance rounds, beat targets, build your run.",
    modeDailyName: "Daily Challenge",
    modeDailyDesc: "A run with a fixed seed. Everyone plays the same setup. Compare your score.",
    modeEndlessName: "Endless",
    modeEndlessDesc: "No target. Play as long as you like. Score keeps accumulating.",
    tipsHeading: "Tips to start",
    tip1: "Prioritize long chains to trigger \"Simple Chain\" and \"Long Chain\"",
    tip2: "Save doubles to trigger \"Double Double\" or \"Triple Double\"",
    tip3: "Relics stack - pick ones that complement your strategy",
    tip4: "Save gold for the shop; bought relics are very strong",
    tip5: "Mirror and bomb tiles appear in later rounds, use them strategically",
    tip6: "Active powers cost resources, only fire them when worth it",
  },
  meta: {
    title: "Meta systems",
    intro: "Dominix deepens with systems that reveal themselves as you play. You don't need to master all of them at once: they emerge naturally as you explore.",
    consumablesTitle: "Consumables",
    consumablesTag: "Tarot",
    consumablesBody: "Single-use items found in shops and rewards. They change your hand, reveal tiles, transform doubles, or grant instant points. They are kept until used.",
    editionsTitle: "Tile editions",
    editionsTag: "Edition",
    editionsBody: "Some tiles carry an edition (Golden, Holographic, etc.) that grants an extra bonus when played. Discovered in the codex and generable via events or the Alchemist.",
    celestialTitle: "Celestial cards",
    celestialTag: "Firmament",
    celestialBody: "Collectible cards that multiply your score by their firmament (Solar, Lunar, Stellar, Comet, Deep). Each firmament empowers a different style: doubles, long chains, fast patterns, or few tiles.",
    alignmentsTitle: "Alignments",
    alignmentsTag: "Set bonus",
    alignmentsBody: "Holding 3 cards of the same firmament activates that firmament's Alignment with an extra bonus. Five distinct cards activate the Cosmic Alignment: your most devastating play.",
    pactTitle: "Sacred Pact",
    pactTag: "Modifier",
    pactBody: "A tile chosen at run start gets pacted: +100 when played. It evolves if played inside a pattern or with an edition. With the Cosmic Alignment active, its bonus is amplified by 20%.",
    chaosTitle: "Chaos Mode",
    chaosTag: "Modifier",
    chaosBody: "Each round rolls a random twist: buff (score+, target-, action+), nerf (target+, action-, pattern-), or weird (shuffle, free consumable). Toggled with the Chaos modifier; grants +10% base score as compensation.",
    codexTitle: "Codex",
    codexTag: "Discovery",
    codexBody: "Automatically logs every pattern, boss, celestial card, and chaos twist you discover. Undiscovered entries appear as '???' until you live them in a run. Accessible from the main menu.",
    legacyTitle: "Legacy",
    legacyTag: "Heritage",
    legacyBody: "When a run ends, 1 celestial card + 1 consumable are saved automatically. Your next run inherits them at start: a toast confirms when the legacy fires. It connects your runs together.",
    charactersTitle: "Characters",
    charactersTag: "Passive",
    charactersBody: "Each character starts with different conditions: Architect (+5 per pattern), Mathematician (+score with doubles), Bomber (bombs), Merchant (+gold), Alchemist (editions), Oracle (free celestial), Cartographer (+score), Hermit (free pact).",
    shortcutsHeading: "Keyboard shortcuts",
    shortcutPlay: "Play tile",
    shortcutDraw: "Draw",
    shortcutUndo: "Undo",
  },
};

const ALL: Record<Lang, HowToPlayContent> = { es: ES, en: EN };

export function getHowToPlayContent(): HowToPlayContent {
  return ALL[getLanguage()] ?? ES;
}
