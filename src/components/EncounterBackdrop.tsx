import shop from "@/assets/shop-ambient-v1.webp";
import shopMobile from "@/assets/shop-ambient-mobile-v1.webp";
import sanctuary from "@/assets/sanctuary-ambient-v1.webp";
import sanctuaryMobile from "@/assets/sanctuary-ambient-mobile-v1.webp";
import event from "@/assets/event-ambient-v1.webp";
import eventMobile from "@/assets/event-ambient-mobile-v1.webp";

const scenes = {
  shop: [shop, shopMobile],
  sanctuary: [sanctuary, sanctuaryMobile],
  event: [event, eventMobile],
} as const;

/** Decorative only: the screen's layout, controls and semantic colours stay intact. */
export default function EncounterBackdrop({ scene }: { scene: keyof typeof scenes }) {
  const [desktop, mobile] = scenes[scene];
  return <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
    <picture>
      <source media="(max-width: 640px)" srcSet={mobile} />
      <img src={desktop} alt="" width={1280} height={716} decoding="async" className="h-full w-full object-cover" />
    </picture>
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,15,0.38), rgba(10,10,15,0.72) 48%, rgba(10,10,15,0.42))" }} />
  </div>;
}
