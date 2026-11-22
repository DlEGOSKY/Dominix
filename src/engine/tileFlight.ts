/** Ephemeral presentation only: game state is committed before a flight starts. */
export interface FlightBounds { x: number; y: number; width: number; height: number }
export function tileFlightFrames(from: FlightBounds, to: FlightBounds, width: number, height: number): Keyframe[] {
  const scale = (r: FlightBounds) => `scale(${r.width / width}, ${r.height / height})`;
  const lift = Math.min(52, Math.abs(to.y - from.y) * .12);
  return [
    { transform: `translate(${from.x}px, ${from.y}px) ${scale(from)}`, offset: 0 },
    { transform: `translate(${from.x + (to.x - from.x) * .55}px, ${from.y + (to.y - from.y) * .55 - lift}px) scale(${(from.width + (to.width - from.width) * .55) / width}, ${(from.height + (to.height - from.height) * .55) / height})`, offset: .55 },
    { transform: `translate(${to.x}px, ${to.y}px) ${scale(to)}`, offset: 1 },
  ];
}

function findTile(root: HTMLElement, id: string, selector: string) {
  return [...root.querySelectorAll<HTMLElement>(selector)].find(el => el.dataset.tileId === id);
}
function valid(rect: FlightBounds) { return [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) && rect.width > 0 && rect.height > 0; }

/** At most one flight. A new play, undo, resize, scroll or unmount can settle it. */
export interface TileArrival { id: string; side: "left" | "right"; animated: boolean }
export class TileFlightController {
  private pending: { id: string; side: "left" | "right"; visual?: { source: HTMLElement; clone: HTMLElement; bounds: DOMRect; width: number; height: number } } | null = null;
  private active: { id: string; settle: () => void } | null = null;
  constructor(private readonly onArrival?: (target: HTMLElement, arrival: TileArrival) => void) {}

  capture(root: HTMLElement | null, id: string, reduced: boolean, side: "left" | "right" = "right") {
    this.cancel();
    this.pending = { id, side };
    if (!root || reduced) return;
    const source = findTile(root, id, '.hand-panel [data-tile-id]');
    if (!source || typeof source.animate !== 'function') return;
    const bounds = source.getBoundingClientRect();
    if (!valid(bounds) || !source.offsetWidth || !source.offsetHeight) return;
    this.pending.visual = { source, clone: source.cloneNode(true) as HTMLElement, bounds, width: source.offsetWidth, height: source.offsetHeight };
  }

  sync(root: HTMLElement | null, reduced: boolean, fast: boolean, placedIds: ReadonlySet<string>) {
    if (!root) { this.cancel(); return; }
    // AnimatePresence may retain a removed tile in the DOM during undo.
    if (this.active && (reduced || !placedIds.has(this.active.id))) this.active.settle();
    const request = this.pending;
    this.pending = null;
    if (!request || !placedIds.has(request.id)) return;
    const target = findTile(root, request.id, '[data-chain-tile] [data-tile-id]');
    if (!target) return;
    const arrive = (animated: boolean) => { if(target.isConnected) this.onArrival?.(target, { id: request.id, side: request.side, animated }); };
    if (!request.visual || reduced) { arrive(false); return; }
    const bounds = target.getBoundingClientRect();
    if (!valid(bounds)) return;
    const { clone, source, width, height } = request.visual;
    clone.setAttribute('aria-hidden', 'true'); clone.setAttribute('inert', ''); clone.setAttribute('tabindex', '-1');
    clone.removeAttribute('aria-describedby'); clone.removeAttribute('data-tile-id'); clone.setAttribute('data-tile-flight', request.id);
    if (clone instanceof HTMLButtonElement) clone.disabled = true;
    Object.assign(clone.style, { position: 'fixed', left: '0px', top: '0px', width: `${width}px`, height: `${height}px`, margin: '0', zIndex: '1000', transformOrigin: '0 0', pointerEvents: 'none', willChange: 'transform', transition: 'none' });
    const sourceVisibility = source.style.visibility, targetVisibility = target.style.visibility;
    const entry = target.closest<HTMLElement>('[data-chain-tile]');
    let animation: Animation | undefined, settled = false;
    const settle = (landed: boolean) => {
      if (settled) return;
      settled = true;
      animation?.cancel(); clone.remove(); source.style.visibility = sourceVisibility; target.style.visibility = targetVisibility;
      entry?.removeAttribute('data-in-flight');
      window.removeEventListener('resize', cancelFlight); window.removeEventListener('scroll', cancelFlight, true);
      if (this.active?.settle === cancelFlight) this.active = null;
      if (landed) arrive(!!animation);
    };
    const cancelFlight = () => settle(false);
    this.active = { id: request.id, settle: cancelFlight };
    try {
      document.body.appendChild(clone);
      animation = clone.animate(tileFlightFrames(request.visual.bounds, bounds, width, height), { duration: fast ? 180 : 380, easing: 'cubic-bezier(.22,.7,.25,1)', fill: 'both' });
      animation.id = 'dominix-placement';
      source.style.visibility = 'hidden'; target.style.visibility = 'hidden'; entry?.setAttribute('data-in-flight', '');
      window.addEventListener('resize', cancelFlight); window.addEventListener('scroll', cancelFlight, true);
      void animation.finished.then(() => settle(true), cancelFlight);
    } catch { settle(true); }
  }

  cancel() { this.pending = null; this.active?.settle(); }
}
