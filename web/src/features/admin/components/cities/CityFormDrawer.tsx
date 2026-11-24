import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer } from '../../../../components/common/Drawer';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import { Textarea } from '../../../../components/common/Textarea';
import { ImageUploader } from '../../../../components/compound/ImageUploader';
import { useToast } from '../../../../contexts/toast/ToastContext';
import { hasErrorCode } from '../../../../services/apiError';
import type { City, UpdateCityDTO } from '../../../../types/city';
import { useSaveCity } from '../../hooks/useAdminMutations';
import { cityFormSchema, toCityDTO, type CityFormValues } from '../../schemas';
import { adminErrorMessage } from '../../utils/adminErrors';
import { CoordinatesField } from '../CoordinatesField';

interface CityFormDrawerProps {
  open: boolean;
  onClose: () => void;
  /** null = thêm mới */
  city: City | null;
  /** Đổi mỗi lần mở để form khởi tạo lại (kể cả khi mở lại cùng một thành phố) */
  sessionKey: number;
}

export const CityFormDrawer: React.FC<CityFormDrawerProps> = ({ open, onClose, city, sessionKey }) => {
  // Drawer luôn mount để chạy hiệu ứng đóng; form (kèm bản đồ) chỉ dựng từ lần mở đầu tiên
  const [everOpened, setEverOpened] = useState(open);
  if (open && !everOpened) setEverOpened(true);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={city ? `Sửa thành phố ${city.name}` : 'Thêm thành phố'}
      className="admin-form-drawer"
    >
      {everOpened && <CityForm key={`${city?._id ?? 'new'}-${sessionKey}`} city={city} onDone={onClose} />}
    </Drawer>
  );
};

/**
 * Chỉ gửi field đã đổi. Mô tả / ảnh bị xóa trắng vẫn gửi `""`: backend hiểu là xóa,
 * còn field không gửi được giữ nguyên.
 */
function diffCity(city: City, values: CityFormValues): UpdateCityDTO {
  const body: UpdateCityDTO = {};
  if (values.name !== city.name) body.name = values.name;
  if (values.description !== (city.description ?? '')) body.description = values.description;
  if (values.image !== (city.image ?? '')) body.image = values.image;
  if (values.coordinates.lat !== city.coordinates.lat || values.coordinates.lng !== city.coordinates.lng) {
    body.coordinates = values.coordinates;
  }
  return body;
}

const CityForm: React.FC<{ city: City | null; onDone: () => void }> = ({ city, onDone }) => {
  const toast = useToast();
  const saveCity = useSaveCity();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<CityFormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      name: city?.name ?? '',
      description: city?.description ?? '',
      image: city?.image ?? '',
      // Ô trống khi thêm mới → zod báo "Vui lòng nhập ..." nếu chưa chọn vị trí
      coordinates: (city?.coordinates ?? {}) as CityFormValues['coordinates'],
    },
  });

  const onSubmit = (values: CityFormValues) => {
    const body = city ? diffCity(city, values) : toCityDTO(values);
    if (city && !Object.keys(body).length) {
      onDone();
      return;
    }
    saveCity.mutate(
      { id: city?._id, body },
      {
        onSuccess: (saved) => {
          toast.success(city ? 'Đã cập nhật thành phố' : 'Đã thêm thành phố', { description: saved.name });
          onDone();
        },
        onError: (error) => {
          if (hasErrorCode(error, 'CITY_EXISTS')) {
            setError('name', { message: 'Thành phố này đã tồn tại' }, { shouldFocus: true });
          }
        },
      }
    );
  };

  const formError =
    saveCity.isError && !hasErrorCode(saveCity.error, 'CITY_EXISTS')
      ? adminErrorMessage(saveCity.error, 'Không lưu được thành phố')
      : null;

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="admin-form__body">
        <Input
          label="Tên thành phố"
          required
          placeholder="vd: Đà Lạt"
          autoComplete="off"
          error={errors.name?.message}
          {...register('name')}
        />

        <Textarea
          label="Mô tả"
          rows={4}
          placeholder="Giới thiệu ngắn về thành phố…"
          error={errors.description?.message}
          {...register('description')}
        />

        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUploader
              label="Ảnh banner"
              value={field.value}
              onChange={field.onChange}
              aspectRatio="wide"
            />
          )}
        />

        <Controller
          control={control}
          name="coordinates"
          render={({ field }) => (
            <CoordinatesField
              value={field.value}
              onChange={(v) => field.onChange(v ?? {})}
              errors={{ lat: errors.coordinates?.lat?.message, lng: errors.coordinates?.lng?.message }}
            />
          )}
        />

        {formError && (
          <p role="alert" className="admin-form-error">
            {formError}
          </p>
        )}
      </div>

      <div className="admin-form__footer">
        <Button variant="ghost" onClick={onDone} disabled={saveCity.isPending}>
          Hủy
        </Button>
        <Button type="submit" isLoading={saveCity.isPending} disabled={!!city && !isDirty}>
          {city ? 'Lưu thay đổi' : 'Thêm thành phố'}
        </Button>
      </div>
    </form>
  );
};
