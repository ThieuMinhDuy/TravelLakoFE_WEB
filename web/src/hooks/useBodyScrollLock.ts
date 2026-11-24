import { useEffect } from 'react';

/** Số lớp đang khóa cuộn — cho phép nhiều modal lồng nhau mà không mở khóa sớm */
let lockCount = 0;
let saved = { overflow: '', paddingRight: '' };

/** Khóa cuộn trang phía sau khi `active`, bù độ rộng thanh cuộn để layout không bị giật */
export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;

    if (lockCount === 0) {
      saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
      const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
      body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        body.style.overflow = saved.overflow;
        body.style.paddingRight = saved.paddingRight;
      }
    };
  }, [active]);
}
