import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusable = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest('[aria-hidden="true"]') && el.getClientRects().length > 0
  );

/**
 * Giữ focus bàn phím bên trong hộp thoại khi `active`:
 * - Focus vào phần tử đầu tiên (nếu chưa có phần tử nào bên trong được autoFocus)
 * - Tab / Shift+Tab chạy vòng trong hộp thoại
 * - Khi đóng, trả focus về phần tử đã mở hộp thoại
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (!container.contains(document.activeElement)) {
      (getFocusable(container)[0] ?? container).focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = getFocusable(container);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (e.shiftKey && (current === first || !container.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !container.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [containerRef, active]);
}
