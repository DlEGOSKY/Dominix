import type { Language } from "./i18n";

type CharacterCopy = readonly [name: string, detail: string];
type Character = Record<Language, CharacterCopy>;

/** Portrait identities describe the art, never gameplay abilities or rewards. */
const CAST: Record<string, readonly Character[]> = {
  among_us: [
    { es: ["Fantasma", "Fuera de la nave. Todavía dentro de la partida."], en: ["Ghost", "Out of the ship. Still in the game."] },
    { es: ["Tripulante", "Un brote en el casco. Una coartada por comprobar."], en: ["Crewmate", "A sprout on the helmet. An alibi to check."] },
    { es: ["Científico", "El visor dice ciencia. El silencio dice otra cosa."], en: ["Scientist", "The visor says science. The silence says otherwise."] },
    { es: ["Ingeniero", "Siempre lleva una herramienta. A veces también una excusa."], en: ["Engineer", "Always carries a tool. Sometimes an excuse too."] },
    { es: ["Detective", "Todo el mundo parece sospechoso desde esta mesa."], en: ["Detective", "Everyone looks suspicious from this table."] },
    { es: ["Ángel guardián", "Pequeñas alas. Mucho trabajo pendiente."], en: ["Guardian Angel", "Little wings. Plenty of unfinished business."] },
    { es: ["Impostor", "La sonrisa era demasiado grande para el casco."], en: ["Impostor", "That smile was much too big for the helmet."] },
  ],
  hollow_knight: [
    { es: ["La Sombra", "Dos ojos blancos en el silencio."], en: ["The Shade", "Two white eyes in the silence."] },
    { es: ["El Caballero", "Una máscara pequeña. Un reino inmenso."], en: ["The Knight", "A small mask. An immense kingdom."] },
    { es: ["Hornet", "Aguja firme. Mirada que no retrocede."], en: ["Hornet", "A steady needle. An unwavering gaze."] },
    { es: ["Quirrel", "Los buenos viajeros siempre guardan otra historia."], en: ["Quirrel", "Good travellers always have another story."] },
    { es: ["Zote", "La confianza llega mucho antes que la explicación."], en: ["Zote", "Confidence arrives well before the explanation."] },
    { es: ["Cloth", "Una capucha gastada y el valor de seguir."], en: ["Cloth", "A worn hood and the courage to continue."] },
    { es: ["Grimm", "El telón cae. La ceremonia continúa."], en: ["Grimm", "The curtain falls. The ceremony continues."] },
  ],
  one_piece: [
    { es: ["Brook", "Un esqueleto con una sonrisa que nunca abandona el escenario."], en: ["Brook", "A skeleton whose smile never leaves the stage."] },
    { es: ["Luffy", "Sombrero de paja, sonrisa abierta y otro horizonte."], en: ["Luffy", "A straw hat, a wide smile and another horizon."] },
    { es: ["Zoro", "La mirada basta. El rumbo es otra historia."], en: ["Zoro", "The look says enough. Directions are another story."] },
    { es: ["Nami", "Sabe encontrar el camino y reconocer una buena oportunidad."], en: ["Nami", "Knows the way and recognises a good opportunity."] },
    { es: ["Sanji", "Traje impecable. Cejas inconfundibles."], en: ["Sanji", "An impeccable suit. Unmistakable eyebrows."] },
    { es: ["Chopper", "Pequeño sombrero. Corazón enorme."], en: ["Chopper", "A little hat. An enormous heart."] },
    { es: ["Robin", "Una sonrisa tranquila entre demasiados secretos."], en: ["Robin", "A quiet smile among far too many secrets."] },
  ],
  roma_eterna: [
    { es: ["La Loba", "Antes del mármol y la corona, una leyenda."], en: ["The She-Wolf", "Before marble and crowns, a legend."] },
    { es: ["Legionario", "Hierro, disciplina y otra jornada bajo el estandarte."], en: ["Legionary", "Iron, discipline and another day beneath the standard."] },
    { es: ["Gladiador", "El bronce esconde el rostro. La arena recuerda el nombre."], en: ["Gladiator", "Bronze hides the face. The arena remembers the name."] },
    { es: ["Centurión", "La cresta roja se distingue antes que la orden."], en: ["Centurion", "The red crest is seen before the command is heard."] },
    { es: ["Vestal", "Una llama pequeña que no debe apagarse."], en: ["Vestal", "A small flame that must not go out."] },
    { es: ["Senador", "Cada silencio también forma parte del debate."], en: ["Senator", "Every silence is part of the debate too."] },
    { es: ["Emperador", "El laurel pesa menos que la siguiente decisión."], en: ["Emperor", "The laurel weighs less than the next decision."] },
  ],
  invitados_umbral: [
    { es: ["La Náufraga", "Perdió el rumbo. Encontró una mesa."], en: ["The Castaway", "Lost her way. Found a table."] },
    { es: ["El Ronin", "Una máscara rota y una mirada que no cede."], en: ["The Ronin", "A broken mask and an unyielding gaze."] },
    { es: ["La Sabueso", "Siempre encuentra la pieza que falta."], en: ["The Sleuth", "Always finds the missing piece."] },
    { es: ["La Vidente", "Su sombrero guarda más secretos que su sonrisa."], en: ["The Seer", "Her hat holds more secrets than her smile."] },
    { es: ["El Piloto", "Aterrizó por poco. Se queda por la partida."], en: ["The Pilot", "Barely landed. Staying for the game."] },
    { es: ["La Carmesí", "Tiene toda la noche. Y unas cuantas más."], en: ["The Crimson", "She has all night. And a few more to spare."] },
    { es: ["El Errante", "Un largo camino y ni una sonrisa de menos."], en: ["The Wanderer", "A long road and not one smile lost."] },
  ],
  banda_doble: [
    { es: ["El Ausente", "Una máscara vacía y demasiados secretos."], en: ["The Absent", "A blank mask and too many secrets."] },
    { es: ["Monóculo", "Un ojo para el negocio. El otro nunca apareció."], en: ["Monocle", "One eye for business. The other never showed up."] },
    { es: ["Los Picos", "Dos socios, un abrigo y ninguna coartada."], en: ["The Beaks", "Two partners, one coat, no alibi."] },
    { es: ["Trébol", "Tres puntas en el gorro. Un as bajo la manga."], en: ["Clover", "Three points on the hat. One secret up the sleeve."] },
    { es: ["Cuatro Ojos", "Cuatro lentes. Ninguna pieza pasa desapercibida."], en: ["Four Eyes", "Four lenses. No spare part goes unnoticed."] },
    { es: ["Estrella Invitada", "Su escenario favorito es cualquier mesa."], en: ["Guest Star", "Any table is a stage worth taking."] },
    { es: ["El Portero", "Seis ojos atentos y una pajarita diminuta."], en: ["The Bouncer", "Six watchful eyes and one tiny bow tie."] },
  ],
  chatarra_lujo: [
    { es: ["Apagado", "Nadie sabe si duerme o si está calculando."], en: ["Offline", "Nobody knows if it is sleeping or calculating."] },
    { es: ["Farol", "Un lente enorme y una sonrisa poco fiable."], en: ["Beacon", "One enormous lens and a rather unreliable grin."] },
    { es: ["Pinza", "Siempre tiene dos herramientas a mano."], en: ["Pincer", "Always keeps two tools close at hand."] },
    { es: ["Triciclo", "Tres sensores y una bufanda que vio días mejores."], en: ["Tricycle", "Three sensors and a scarf that has seen better days."] },
    { es: ["Remache", "Cuatro lentes montados con piezas de segunda mano."], en: ["Rivet", "Four lenses assembled from second-hand parts."] },
    { es: ["Dínamo", "Cinco aspas. Energía de sobra."], en: ["Dynamo", "Five blades. Energy to spare."] },
    { es: ["Caldero", "Seis luces encendidas. El taller sigue abierto."], en: ["Boiler", "Six lights on. The workshop is still open."] },
  ],
};

const FACE_NAMES: Record<string, Record<Language, readonly string[]>> = {
  among_us: {
    es: ["Vacío", "Un punto", "Dos puntos", "Tres puntos", "Cuatro puntos", "Cinco puntos", "Seis puntos"],
    en: ["Empty", "One pip", "Two pips", "Three pips", "Four pips", "Five pips", "Six pips"],
  },
  hollow_knight: {
    es: ["Vacío", "Máscara del Caballero", "Dos máscaras de Hornet", "Tres máscaras de Quirrel", "Cuatro máscaras de Zote", "Cinco máscaras de Cloth", "Seis máscaras de Grimm"],
    en: ["Void", "The Knight's mask", "Two Hornet masks", "Three Quirrel masks", "Four Zote masks", "Five Cloth masks", "Six Grimm masks"],
  },
  one_piece: {
    es: ["Bolsa vacía", "Una moneda", "Dos monedas", "Tres monedas", "Cuatro monedas", "Cinco monedas", "Seis monedas"],
    en: ["Empty purse", "One coin", "Two coins", "Three coins", "Four coins", "Five coins", "Six coins"],
  },
  roma_eterna: {
    es: ["Sello vacío", "Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis"],
    en: ["Empty seal", "One", "Two", "Three", "Four", "Five", "Six"],
  },
};

/** Value names describe the playing face; guest portraits do not assign ranks. */
export function getSkinCharacters(skinId: string, lang: Language) {
  const names = FACE_NAMES[skinId]?.[lang];
  if (names) return names.map((name, value) => {
    const meaning = lang === "es" ? `Valor ${value}. ${name}.` : `Value ${value}. ${name}.`;
    const reference = skinId === "one_piece" || skinId === "among_us" ? CAST[skinId]?.[value]?.[lang][0] : undefined;
    return { value, name, detail: reference ? `${meaning} ${lang === "es" ? "Retrato" : "Portrait"}: ${reference}.` : meaning };
  });
  return (CAST[skinId] ?? []).map((character, value) => ({ value, name: character[lang][0], detail: character[lang][1] }));
}

/** Gallery frame order is not a gameplay value. */
export function getCollectionCast(skinId: string, lang: Language) {
  if (!FACE_NAMES[skinId]) return [];
  return (CAST[skinId] ?? []).map((character, frame) => ({ frame, name: character[lang][0], detail: character[lang][1] }));
}
