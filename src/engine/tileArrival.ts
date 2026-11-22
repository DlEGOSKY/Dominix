import { audio, type ContactMaterial } from "./audio";
import type { TileArrival } from "./tileFlight";

export function contactMaterial(skin: string): ContactMaterial {
  if (skin === "midnight_express") return "wood";
  if (["among_us", "mecanico", "chatarra_lujo", "orbital_reactor", "dragon_forge"].includes(skin)) return "metal";
  if (["diamond", "emerald", "ruby", "eclipse_glass", "alchemist_cabinet"].includes(skin)) return "glass";
  return "stone";
}

interface ContactProfile { ms: number; lift: number; x: number; y: number; tilt: number; sheen: number }
const DEFAULT_CONTACT: ContactProfile = { ms: 190, lift: 1, x: 1.035, y: .975, tilt: 0, sheen: 0 };
const CONTACTS: Record<string, ContactProfile> = {
  ivory: { ms: 170, lift: .6, x: 1.02, y: .987, tilt: 0, sheen: .16 },
  emerald: { ms: 200, lift: .4, x: 1.018, y: .992, tilt: 0, sheen: .4 },
  diamond: { ms: 150, lift: .3, x: 1.012, y: .994, tilt: 0, sheen: .65 },
  ruby: { ms: 190, lift: .5, x: 1.02, y: .99, tilt: 0, sheen: .32 },
  obsidian: { ms: 140, lift: .2, x: 1.016, y: .993, tilt: 0, sheen: .22 },
  imperium: { ms: 160, lift: .2, x: 1.015, y: .995, tilt: 0, sheen: .18 },
  midnight_express: { ms: 180, lift: .6, x: 1.015, y: .99, tilt: .18, sheen: .3 },
};

/** One contact, one sound and one neighbouring link. Never schedules gameplay. */
export function playTileArrival(target: HTMLElement, arrival: TileArrival, settings: { skin: string; reduced: boolean; fast: boolean }) {
  audio.playTileContact(contactMaterial(settings.skin));
  if (settings.reduced || typeof target.animate !== "function") return () => {};
  const entry = target.closest<HTMLElement>("[data-chain-tile]");
  const piece = entry?.closest<HTMLElement>("[data-chain-piece]");
  const link = arrival.side === "left" ? piece?.querySelector<HTMLElement>("[data-chain-link]") : piece?.previousElementSibling?.querySelector<HTMLElement>("[data-chain-link]");
  const animations: Animation[] = [];
  const profile = CONTACTS[settings.skin] ?? DEFAULT_CONTACT;
  let cleaned = false;
  const cleanup = () => { if (cleaned) return; cleaned = true; entry?.removeAttribute("data-contact"); animations.forEach(a => a.cancel()); };
  try {
    entry?.setAttribute("data-contact", "");
    const impact = target.animate([{ transform: `translateY(-${profile.lift}px) rotate(${profile.tilt}deg) scale(${profile.x},${profile.y})` }, { transform: "translateY(0) rotate(0deg) scale(1,1)" }], { duration: settings.fast ? Math.round(profile.ms * .55) : profile.ms, easing: "cubic-bezier(.2,.8,.2,1)" });
    impact.id = "dominix-contact"; animations.push(impact);
    const reflection = target.querySelector<HTMLElement>("[data-material-reflection]");
    if (reflection && profile.sheen > 0) {
      const sheen = reflection.animate([{ opacity: 0, transform: "translateX(-28%)" }, { opacity: profile.sheen, transform: "translateX(0)" }, { opacity: 0, transform: "translateX(28%)" }], { duration: settings.fast ? 120 : 240, easing: "ease-out" });
      sheen.id = "dominix-reflection"; animations.push(sheen);
    }
    if (link) {
      const connection = link.animate([{ backgroundColor: "#d4a853", transform: "scaleX(1.5)", opacity: 1 }, { backgroundColor: "#a8b2c133", transform: "scaleX(1)", opacity: 1 }], { duration: settings.fast ? 160 : 300, easing: "ease-out" });
      connection.id = "dominix-connection"; animations.push(connection);
    }
    void Promise.all(animations.map(a => a.finished.catch(() => {}))).then(cleanup);
  } catch { cleanup(); }
  return cleanup;
}
