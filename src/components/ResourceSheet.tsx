import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "@/engine/i18n";

/** Native modal supplies focus containment and makes the game behind it inert. */
export default function ResourceSheet({ title, onClose, children, mobileOnly = true }: { title: string; onClose: () => void; children: ReactNode; mobileOnly?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const heading = useId();
  const { t } = useTranslation();
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const backdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeRef.current();
    };
    dialog.addEventListener("click", backdropClick);
    const cycleFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;
      const controls = [...dialog.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, summary, [tabindex], [contenteditable="true"]')]
        .filter(el => el.tabIndex >= 0 && !el.matches(':disabled') && !el.closest('[inert]') && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden");
      const first = controls[0], last = controls[controls.length - 1];
      if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
      if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last) || !dialog.contains(document.activeElement)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      }
    };
    dialog.addEventListener("keydown", cycleFocus);
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const wide = window.matchMedia("(min-width: 640px)");
    const resized = () => { if (mobileOnly && wide.matches) closeRef.current(); };
    wide.addEventListener("change", resized);
    resized();
    return () => {
      wide.removeEventListener("change", resized);
      dialog.removeEventListener("click", backdropClick);
      dialog.removeEventListener("keydown", cycleFocus);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected && opener.getClientRects().length) opener.focus({ preventScroll: true });
    };
  }, [mobileOnly]);
  return createPortal(<dialog ref={ref} aria-modal="true" aria-labelledby={heading} className="resource-sheet" data-desktop={!mobileOnly || undefined}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="sticky top-0 z-10 bg-surface-900 border-b border-surface-700/60 px-4 py-2 flex items-center justify-between gap-3">
      <h2 id={heading} className="text-xs font-bold uppercase tracking-widest text-accent-silver">{title}</h2>
      <button type="button" onClick={onClose} className="min-h-11 px-3 text-accent-silver hover:text-white text-xs uppercase tracking-widest">{t("btn.close")}</button>
    </header>
    <div className="p-4">{children}</div>
  </dialog>, document.body);
}
