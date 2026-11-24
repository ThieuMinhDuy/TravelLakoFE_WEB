import type { StateStorage } from 'zustand/middleware';

const REMEMBER_KEY = 'tripmate_remember';

/** localStorage/sessionStorage có thể ném lỗi (private mode, bị chặn site data) */
function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export const storage = {
  /** "Ghi nhớ đăng nhập": true → localStorage (giữ sau khi tắt trình duyệt), false → sessionStorage */
  isRemembered: (): boolean =>
    safe(() => localStorage.getItem(REMEMBER_KEY) !== '0', true),

  setRemembered: (remember: boolean): void =>
    safe(() => localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0'), undefined),
};

/**
 * Storage adapter cho zustand persist.
 * Ghi vào localStorage hoặc sessionStorage tùy lựa chọn "Ghi nhớ đăng nhập",
 * đồng thời xóa bản ở nơi còn lại để không bị lưu trùng.
 */
export const authStorage: StateStorage = {
  getItem: (name) =>
    safe(() => sessionStorage.getItem(name) ?? localStorage.getItem(name), null),

  setItem: (name, value) =>
    safe(() => {
      const [keep, drop] = storage.isRemembered()
        ? [localStorage, sessionStorage]
        : [sessionStorage, localStorage];
      keep.setItem(name, value);
      drop.removeItem(name);
    }, undefined),

  removeItem: (name) =>
    safe(() => {
      localStorage.removeItem(name);
      sessionStorage.removeItem(name);
    }, undefined),
};
