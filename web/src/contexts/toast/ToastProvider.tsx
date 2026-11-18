import React, { useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { ToastContext, type ToastApi } from './ToastContext';

/** Cung cấp ToastApi (triển khai bằng sonner) và vùng hiển thị toast cho toàn app */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const api = useMemo<ToastApi>(
    () => ({
      success: (message, options) => void toast.success(message, options),
      error: (message, options) => void toast.error(message, options),
      info: (message, options) => void toast.info(message, options),
      warning: (message, options) => void toast.warning(message, options),
      promise: (promise, messages) => void toast.promise(promise, messages),
      dismiss: (id) => void toast.dismiss(id),
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </ToastContext.Provider>
  );
};
