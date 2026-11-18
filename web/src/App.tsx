import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes/AppRoutes';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './contexts/toast/ToastProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  return (
    // Lớp bảo vệ cuối cùng: lỗi ngoài các layout (vd: tải chunk AdminLayout thất bại)
    <ErrorBoundary fullScreen>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
