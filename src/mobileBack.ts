/** Called by the Android activity. True means the current UI consumed Back. */
export function handleMobileBack(): boolean {
  const input = document.activeElement;
  const editing = input instanceof HTMLElement && input.matches('input, textarea, [contenteditable="true"]');
  const overlays = Array.from(document.querySelectorAll<HTMLElement>(
    '.modal-scrim, .library-modal-backdrop, .mobile-drawer-backdrop',
  )).filter(element => element.getClientRects().length > 0);
  const overlay = overlays.at(-1);
  if (overlay) {
    if (editing) input.blur();
    // These backdrops already own the corresponding React close callback.
    overlay.dispatchEvent(new MouseEvent(overlay.classList.contains('mobile-drawer-backdrop') ? 'mousedown' : 'click', { bubbles: true }));
    return true;
  }
  if (editing) {
    input.blur();
    return true;
  }
  return false;
}

declare global {
  interface Window { __epic7HandleBack?: () => boolean; }
}
