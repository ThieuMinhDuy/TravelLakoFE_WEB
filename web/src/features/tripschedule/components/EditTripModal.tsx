import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { MoneyInput } from '../../../components/common/MoneyInput';
import { Button } from '../../../components/common/Button';
import { updateTripMetadata } from '../../../services/tripService';
import { queryKeys } from '../../../lib/queryKeys';
import type { TripDetail } from '../../../types/trip';

export interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDetail;
}

function toDateInputValue(iso: string): string {
  return iso ? iso.slice(0, 10) : '';
}

/** Modal cập nhật thông tin chuyến đi (tên, ngày đi - về, ngân sách) */
export const EditTripModal: React.FC<EditTripModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(trip.title);
  const [startDate, setStartDate] = useState(toDateInputValue(trip.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(trip.endDate));
  const [budget, setBudget] = useState<number | undefined>(trip.budget);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(trip.title);
      setStartDate(toDateInputValue(trip.startDate));
      setEndDate(toDateInputValue(trip.endDate));
      setBudget(trip.budget);
      setFormError(null);
    }
  }, [isOpen, trip]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateTripMetadata(trip._id, {
        title: title.trim(),
        startDate,
        endDate,
        budget: budget ?? 0,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(trip._id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.mine() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
      ]);
      toast.success('Đã cập nhật thông tin chuyến đi!');
      onClose();
    },
    onError: (err: Error) => {
      setFormError(err.message || 'Không thể cập nhật chuyến đi.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) {
      setFormError('Vui lòng nhập tên chuyến đi.');
      return;
    }
    if (endDate < startDate) {
      setFormError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
      return;
    }
    if (budget !== undefined && (Number.isNaN(budget) || budget < 0)) {
      setFormError('Ngân sách không hợp lệ.');
      return;
    }
    updateMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa thông tin chuyến đi"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {formError}
          </div>
        )}

        <Input
          label="Tên chuyến đi"
          name="editTitle"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Ngày bắt đầu"
            name="editStartDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Ngày kết thúc"
            name="editEndDate"
            type="date"
            required
            min={startDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <MoneyInput
          label="Ngân sách dự kiến"
          name="editBudget"
          value={budget}
          onChange={setBudget}
          placeholder="30.000.000"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={updateMutation.isPending}
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
