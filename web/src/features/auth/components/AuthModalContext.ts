import { createContext, useContext } from 'react';

export interface AuthModalContextValue {
  /** Đóng popup và quay về trang phía sau */
  close: () => void;
  /** Rung card để báo lỗi */
  shake: () => void;
}

export const AuthModalContext = createContext<AuthModalContextValue>({
  close: () => undefined,
  shake: () => undefined,
});

export const useAuthModal = () => useContext(AuthModalContext);
