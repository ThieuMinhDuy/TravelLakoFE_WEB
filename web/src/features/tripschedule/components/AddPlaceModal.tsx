import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Search, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Spinner } from '../../../components/common/Spinner';
import { useDebounce } from '../../../hooks/useDebounce';
import { placeService } from '../../../services/placeService';
import { queryKeys } from '../../../lib/queryKeys';
import { useAppDispatch } from '../../../store/reduxStore';
import { addPlaceThunk } from '../../../store/tripSlice';
import type { SchedulePlaceType } from '../../../types/trip';
import type { PlaceUnion } from '../../../types/place';
import { formatCurrencyVND } from '../../../utils/formatters';

export interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  cityId?: string;
  cityName?: string;
  dayNumber: number;
}

interface SearchPlaceItem {
  placeType: SchedulePlaceType;
  label: string;
  place: PlaceUnion;
  cost: number;
}

const TYPE_FILTERS: { key: 'all' | SchedulePlaceType; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Attraction', label: 'Tham quan' },
  { key: 'Hotel', label: 'Khách sạn' },
  { key: 'Restaurant', label: 'Nhà hàng' },
  { key: 'Cafe', label: 'Quán cafe' },
];

/** Modal tìm kiếm và thêm địa điểm vào một ngày trong lịch trình */
export const AddPlaceModal: React.FC<AddPlaceModalProps> = ({
  isOpen,
  onClose,
  tripId,
  cityId,
  cityName,
  dayNumber,
}) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | SchedulePlaceType>('all');
  const [note, setNote] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  const debouncedKeyword = useDebounce(keyword.trim(), 300);

  const searchQuery = useQuery({
    queryKey: queryKeys.places.search(debouncedKeyword, cityId ?? ''),
    queryFn: () =>
      placeService.search({
        keyword: debouncedKeyword || undefined,
        cityId: cityId || undefined,
      }),
    enabled: isOpen,
  });

  const items = useMemo<SearchPlaceItem[]>(() => {
    const data = searchQuery.data;
    if (!data) return [];

    const combined: SearchPlaceItem[] = [
      ...(data.attractions ?? []).map((p) => ({
        placeType: 'Attraction' as const,
        label: 'Tham quan',
        place: p,
        cost: p.admissionFee ?? 0,
      })),
      ...(data.hotels ?? []).map((p) => ({
        placeType: 'Hotel' as const,
        label: 'Khách sạn',
        place: p,
        cost: p.pricePerNight ?? 0,
      })),
      ...(data.restaurants ?? []).map((p) => ({
        placeType: 'Restaurant' as const,
        label: 'Nhà hàng',
        place: p,
        cost: p.price ?? 0,
      })),
      ...(data.cafes ?? []).map((p) => ({
        placeType: 'Cafe' as const,
        label: 'Quán cafe',
        place: p,
        cost: p.price ?? 0,
      })),
    ];

    if (selectedType === 'all') return combined;
    return combined.filter((item) => item.placeType === selectedType);
  }, [searchQuery.data, selectedType]);

  const handleAdd = async (item: SearchPlaceItem) => {
    setAddingId(item.place._id);
    try {
      const action = await dispatch(
        addPlaceThunk({
          tripId,
          data: {
            day: dayNumber,
            placeType: item.placeType,
            placeId: item.place._id,
            note: note.trim() || undefined,
          },
        })
      );

      if (addPlaceThunk.fulfilled.match(action)) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(tripId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.trips.mine() }),
        ]);
        toast.success(`Đã thêm "${item.place.name}" vào Ngày ${dayNumber}`);
        setNote('');
        onClose();
      } else {
        toast.error((action.payload as string) || 'Không thể thêm địa điểm!');
      }
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Thêm địa điểm vào Ngày ${dayNumber}`}
      description={
        cityName
          ? `Tìm điểm tham quan, khách sạn, nhà hàng, cafe tại ${cityName}`
          : 'Tìm địa điểm để thêm vào lịch trình'
      }
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Tìm địa điểm"
            name="placeSearch"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập tên địa điểm..."
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Input
            label="Ghi chú (tùy chọn)"
            name="placeNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Ăn trưa lúc 12h"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSelectedType(t.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                selectedType === t.key
                  ? 'bg-[#FA8B02] text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {searchQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="md" className="text-[#FA8B02]" />
            </div>
          ) : searchQuery.isError ? (
            <p className="text-xs text-red-600 py-6 text-center">
              Không tải được danh sách địa điểm. Vui lòng thử lại.
            </p>
          ) : items.length === 0 ? (
            <p className="text-xs text-zinc-500 py-8 text-center">
              Không tìm thấy địa điểm phù hợp.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={`${item.placeType}-${item.place._id}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 font-semibold text-zinc-700">
                      {item.label}
                    </span>
                    {typeof item.place.rating === 'number' && item.place.rating > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-amber-600 font-medium">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {item.place.rating.toFixed(1)}
                      </span>
                    )}
                    {item.cost > 0 && (
                      <span className="font-semibold text-zinc-700">
                        {formatCurrencyVND(item.cost)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 truncate">
                    {item.place.name}
                  </p>
                  {item.place.address && (
                    <p className="text-xs text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.place.address}</span>
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  isLoading={addingId === item.place._id}
                  disabled={addingId !== null}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => void handleAdd(item)}
                >
                  Thêm
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

