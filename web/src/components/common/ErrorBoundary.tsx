import React from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { env } from '../../config/env';
import { isChunkLoadError, reloadOnceForChunkError } from '../../utils/errors';
import { Button } from './Button';
import { StatusView } from './StatusView';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Giao diện thay thế khi có lỗi; mặc định là ErrorFallback */
  fallback?: (props: { error: Error; reset: () => void }) => React.ReactNode;
  /** Tự xóa lỗi khi một trong các giá trị này đổi (vd: pathname → chuyển trang là hết lỗi) */
  resetKeys?: readonly unknown[];
  /** Chiếm toàn màn hình (boundary ngoài cùng, không có layout bao quanh) */
  fullScreen?: boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
}

const keysChanged = (a: readonly unknown[] = [], b: readonly unknown[] = []) =>
  a.length !== b.length || a.some((value, i) => !Object.is(value, b[i]));

/**
 * Bắt lỗi render trong cây con để không làm trắng cả trang.
 * Lỗi tải chunk lazy (sau khi deploy bản mới) → tự tải lại trang một lần.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (isChunkLoadError(error) && reloadOnceForChunkError()) return;
    if (env.IS_DEV) console.error('[ErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && keysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });
    return <ErrorFallback error={error} reset={this.reset} fullScreen={this.props.fullScreen} />;
  }
}

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
  fullScreen?: boolean;
}

/** Giao diện mặc định khi có lỗi */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, reset, fullScreen }) => {
  const chunkError = isChunkLoadError(error);

  return (
    <StatusView
      fullScreen={fullScreen}
      icon={<AlertTriangle className="w-6 h-6" />}
      title={chunkError ? 'Không tải được trang' : 'Đã xảy ra lỗi'}
      description={
        <>
          {chunkError
            ? 'Có thể ứng dụng vừa được cập nhật hoặc kết nối mạng bị gián đoạn. Vui lòng tải lại trang.'
            : 'Rất tiếc, đã có sự cố khi hiển thị nội dung này. Bạn có thể thử lại hoặc quay về trang chủ.'}
          {env.IS_DEV && (
            <>
              <br />
              <code className="text-xs text-red-500">{error.message}</code>
            </>
          )}
        </>
      }
      actions={
        <>
          <Button
            variant="primary"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={chunkError ? () => window.location.reload() : reset}
          >
            {chunkError ? 'Tải lại trang' : 'Thử lại'}
          </Button>
          <Button
            variant="outline"
            leftIcon={<Home className="w-4 h-4" />}
            onClick={() => window.location.assign('/')}
          >
            Về trang chủ
          </Button>
        </>
      }
    />
  );
};
