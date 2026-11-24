import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../../../../components/common/Button';
import { EmptyState } from '../../../../components/common/EmptyState';

/** Trạng thái lỗi tải dữ liệu của một tab, có nút thử lại */
export const TabError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <EmptyState
    icon={<AlertTriangle className="w-6 h-6" />}
    title="Không tải được dữ liệu"
    description={message}
    action={
      <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={onRetry}>
        Thử lại
      </Button>
    }
  />
);
