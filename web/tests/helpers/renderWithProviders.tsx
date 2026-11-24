import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LocaleProvider } from '@/contexts/locale/LocaleProvider';
import { ToastProvider } from '@/contexts/toast/ToastProvider';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** URL ban đầu của router */
  route?: string;
  /** Pattern route để component đọc được params (mặc định khớp mọi đường dẫn) */
  path?: string;
}

/** Hiển thị URL hiện tại để test kiểm tra điều hướng / search params */
export const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname + location.search}</output>;
};

/**
 * Render component kèm đủ provider của app: React Query (không retry, cache riêng mỗi test),
 * Router, Locale, Toast.
 */
export function renderWithProviders(ui: React.ReactElement, { route = '/', path = '*', ...options }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route
                path={path}
                element={
                  <>
                    {ui}
                    <LocationDisplay />
                  </>
                }
              />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </LocaleProvider>
    </QueryClientProvider>,
    options
  );

  return { ...result, queryClient };
}
