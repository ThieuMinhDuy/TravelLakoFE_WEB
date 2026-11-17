import { useEffect, useState } from 'react';

/** Trả về true nếu một request chạy quá `delay` ms (để báo máy chủ đang khởi động) */
export function useSlowHint(active: boolean, delay = 8000) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) {
      setSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), delay);
    return () => window.clearTimeout(timer);
  }, [active, delay]);

  return slow;
}
