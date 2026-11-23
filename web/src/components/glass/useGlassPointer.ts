import { useEffect } from 'react';

/**
 * Một listener duy nhất cho cả trang: khi con trỏ di trên `.glass--interactive`,
 * cập nhật --mx/--my để vệt sáng (glass::after) đi theo — component không cần tự gắn handler.
 * Gộp theo requestAnimationFrame; tắt với thiết bị cảm ứng và khi giảm chuyển động.
 */
export function useGlassPointer() {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let frame = 0;
    let lastEvent: PointerEvent | null = null;

    const update = () => {
      frame = 0;
      const event = lastEvent;
      if (!event) return;
      const target = (event.target as Element | null)?.closest?.<HTMLElement>('.glass--interactive');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      target.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      lastEvent = event;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
