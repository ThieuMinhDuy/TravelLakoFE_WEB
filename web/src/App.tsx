import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes/AppRoutes';
import { queryClient } from './lib/queryClient';
import { reduxStore } from './store/reduxStore';
import { ToastProvider } from './contexts/toast/ToastProvider';
import { LocaleProvider } from './contexts/locale/LocaleProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SessionNotice } from './components/common/SessionNotice';

function App() {
  return (
    // Lớp bảo vệ cuối cùng: lỗi ngoài các layout (vd: tải chunk AdminLayout thất bại)
    <ErrorBoundary fullScreen>
      <Provider store={reduxStore}>
        <QueryClientProvider client={queryClient}>
          <LocaleProvider>
            <ToastProvider>
              <SessionNotice />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ToastProvider>
          </LocaleProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
