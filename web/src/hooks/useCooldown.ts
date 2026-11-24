import { useCallback, useEffect, useState } from 'react';

/**
 * Đếm ngược theo giây (vd: thời gian chờ trước khi được gửi lại OTP).
 * Đặt ở component cha để không bị đếm lại khi component con unmount/mount lại.
 */
export function useCooldown(seconds: number, startActive = true) {
  const [secondsLeft, setSecondsLeft] = useState(startActive ? seconds : 0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  /** Bắt đầu lại; truyền số giây khi backend báo thời gian chờ cụ thể (`retryAfter`) */
  const restart = useCallback((override?: number) => setSecondsLeft(override ?? seconds), [seconds]);

  return { secondsLeft, restart };
}

export type Cooldown = ReturnType<typeof useCooldown>;
