import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { MoneyInput } from '../../../components/common/MoneyInput';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { cityService } from '../../../services/cityService';
import { createTrip } from '../../../services/tripService';
import type { CreateTripDTO } from '../../../types/trip';
import { queryKeys } from '../../../lib/queryKeys';

export interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (tripId: string) => void;
}

function formatInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDefaultDates() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return {
    startDate: formatInputDate(start),
    endDate: formatInputDate(end),
  };
}

/** Modal tạo chuyến đi mới */
export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const queryClient = useQueryClient();
  const defaults = getDefaultDates();

  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [budget, setBudget] = useState<number | undefined>(3_000_000);
  const [formError, setFormError] = useState<string | null>(null);

  const citiesQuery = useQuery({
    queryKey: queryKeys.cities.list(),
    queryFn: ({ signal }) => cityService.getCities({ signal }),
    enabled: isOpen,
  });

  const cityOptions = (citiesQuery.data?.cities ?? []).map((c) => ({
    value: c._id,
    label: c.name,
  }));

  const createMutation = useMutation({
    mutationFn: (payload: CreateTripDTO) => createTrip(payload),
    onSuccess: async (created) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
      ]);
      toast.success('Đã tạo chuyến đi mới!');
      setTitle('');
      setCity('');
      setBudget(3_000_000);
      setFormError(null);
      onClose();
      onCreated?.(created._id);
    },
    onError: (err: Error) => {
      setFormError(err.message || 'Không thể tạo chuyến đi. Vui lòng thử lại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Vui lòng nhập tên chuyến đi.');
      return;
    }
    if (!city) {
      setFormError('Vui lòng chọn thành phố điểm đến.');
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Vui lòng chọn ngày bắt đầu và ngày kết thúc.');
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

    createMutation.mutate({
      title: title.trim(),
      city,
      startDate,
      endDate,
      budget,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo chuyến đi mới"
      description="Chọn điểm đến và thời gian, hệ thống sẽ khởi tạo khung lịch trình theo từng ngày."
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
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Khám phá Đà Nẵng 3 ngày 2 đêm"
        />

        <Select
          label="Thành phố điểm đến *"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          options={cityOptions}
          placeholder={
            citiesQuery.isLoading ? 'Đang tải danh sách thành phố...' : '-- Chọn thành phố --'
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Ngày bắt đầu"
            name="startDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Ngày kết thúc"
            name="endDate"
            type="date"
            required
            min={startDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <MoneyInput
          label="Ngân sách dự kiến"
          name="budget"
          value={budget}
          onChange={setBudget}
          placeholder="3.000.000"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={createMutation.isPending}
          >
            Tạo chuyến đi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
