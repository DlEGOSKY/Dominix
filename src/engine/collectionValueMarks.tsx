export const MASK_REFERENCES = ["shade", "knight", "hornet", "quirrel", "zote", "cloth", "grimm"] as const;

/** Interpretive mask emblems, drawn to remain distinct without a colour cue. */
export function HallownestMark({ value }: { value: number }) {
  return <svg data-mark-reference={MASK_REFERENCES[value]} viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true" stroke="#142130" strokeWidth="1.5" strokeLinejoin="round">
    {value === 1 && <><path d="M9 15C3 12 4 5 5 2l7 9h8l7-9c1 5 2 11-4 13v10l-7 5-7-5Z" fill="#f2efdb"/><path d="M11 16h4v7h-4Zm7 0h4v7h-4Z" fill="#172231" stroke="none"/></>}
    {value === 2 && <><path d="m10 23 6 7 6-7" fill="#cd6d76"/><path d="M7 3 16 12 25 3l-3 21-6 4-6-4Z" fill="#fff1df"/><path d="m10 15 4 3-1 5-3-3Zm12 0-4 3 1 5 3-3Z" fill="#18202b" stroke="none"/></>}
    {value === 3 && <><path d="m8 24 8 6 8-6" fill="#8bbacb"/><path d="M5 14c0-8 22-8 22 0v8c-4 9-18 9-22 0Z" fill="#e2e6cf"/><path d="M7 12 9 4l7-2 8 5 1 7-9-5Z" fill="#6e9bb2"/><path d="M10 17h4v6h-4Zm9-1h3v7h-3Z" fill="#152131" stroke="none"/><path d="m12 4 5 4" stroke="#d4e6d8"/></>}
    {value === 4 && <><path d="M8 14 3 6l9 5L11 2l7 9 8-8-3 12 5 4-4 9H8l-4-9Z" fill="#e9dfc6"/><path d="m8 17 7 2-2 4H9Zm16 0-7 2 2 4h4Z" fill="#142130" stroke="none"/><path d="M12 26h9" fill="none" strokeWidth="2"/></>}
    {value === 5 && <><path d="M2 17C2 6 9 2 16 2s14 4 14 15l-5 12H7Z" fill="#cf9d70"/><path d="M6 17c0-6 20-6 20 0l-4 9H10Z" fill="#f2e5c8"/><path d="M10 17h4v6h-4Zm9 0h3v6h-3Z" fill="#192132" stroke="none"/><path d="M9 7h14M6 10h20" stroke="#e9c18e" strokeWidth="2"/></>}
    {value === 6 && <><path d="m9 24-4 5 11-2 11 2-4-5" fill="#c8667b"/><path d="m4 2 10 10h4L28 2l-5 21-7 6-7-6Z" fill="#363544" stroke="#e1d9d0"/><path d="m9 15 6 3-2 5-3-2Zm14 0-6 3 2 5 3-2Z" fill="#f18b99" stroke="none"/></>}
  </svg>;
}
