import React, { useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LocateFixed } from 'lucide-react';
import { Drawer } from '../../../../components/common/Drawer';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import { MoneyInput } from '../../../../components/common/MoneyInput';
import { Select } from '../../../../components/common/Select';
import { Textarea } from '../../../../components/common/Textarea';
import { MultiImageUploader } from '../../../../components/compound/MultiImageUploader';
import { SegmentedControl } from '../../../../components/glass';
import type { LatLng } from '../../../../components/map';
import { useToast } from '../../../../contexts/toast/ToastContext';
import { hasErrorCode } from '../../../../services/apiError';
import type { AdminPlace } from '../../../../types/admin';
import type { City } from '../../../../types/city';
import type { CreatePlaceDTO, PlaceType } from '../../../../types/place';
import { PLACE_TYPE_LABELS, PLACE_TYPES } from '../../../../utils/place';
import { useSavePlace } from '../../hooks/useAdminMutations';
import { placeFormSchema, toPlaceDTO, type PlaceFormValues } from '../../schemas';
import { adminErrorMessage } from '../../utils/adminErrors';
import { CoordinatesField } from '../CoordinatesField';

/** Giá trị form: gộp field của cả 4 loại; zod chỉ giữ field của loại đang chọn khi submit */
interface PlaceFormInput {
  type: PlaceType;
  name: string;
  city: string;
  description: string;
  address: string;
  images: string[];
  coordinates: Partial<LatLng>;
  /** Ô tiền để trống = null (xem emptyAsUndefined trong schemas) */
  admissionFee?: number | null;
  stars?: number;
  pricePerNight?: number | null;
  cuisineType: string;
  price?: number | null;
}

interface PlaceFormDrawerProps {
  open: boolean;
  onClose: () => void;
  /** null = thêm mới */
  place: AdminPlace | null;
  /** Loại của địa điểm đang sửa, hoặc loại mặc định khi thêm mới (tab đang xem) */
  type: PlaceType;
  /** Thành phố mặc định khi thêm mới (bộ lọc đang chọn) */
  defaultCityId: string;
  cities: City[];
  sessionKey: number;
  /** Lưu thành công — kèm loại địa điểm (khi thêm mới có thể khác tab đang xem) */
  onSaved?: (type: PlaceType) => void;
}

export const PlaceFormDrawer: React.FC<PlaceFormDrawerProps> = ({ open, onClose, place, sessionKey, ...rest }) => {
  // Drawer luôn mount để chạy hiệu ứng đóng; form (kèm bản đồ) chỉ dựng từ lần mở đầu tiên
  const [everOpened, setEverOpened] = useState(open);
  if (open && !everOpened) setEverOpened(true);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      title={place ? `Sửa ${place.name}` : 'Thêm địa điểm'}
      className="admin-form-drawer"
    >
      {everOpened && <PlaceForm key={`${place?._id ?? 'new'}-${sessionKey}`} place={place} onDone={onClose} {...rest} />}
    </Drawer>
  );
};

const toFormInput = (place: AdminPlace | null, type: PlaceType, cityId: string): PlaceFormInput => ({
  type,
  name: place?.name ?? '',
  city: place?.city?._id ?? cityId,
  description: place?.description ?? '',
  address: place?.address ?? '',
  images: place?.images ?? [],
  coordinates: place?.coordinates ?? {},
  admissionFee: place?.admissionFee,
  stars: place ? place.stars : 3,
  pricePerNight: place?.pricePerNight,
  cuisineType: place?.cuisineType ?? '',
  price: place?.price,
});

/** Chỉ gửi field đã đổi khi sửa (PUT nhận một phần) */
function diffPlace(original: CreatePlaceDTO, next: CreatePlaceDTO): Partial<CreatePlaceDTO> {
  const a = original as unknown as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(a[key]))
  ) as Partial<CreatePlaceDTO>;
}

const STAR_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} sao` }));

interface PlaceFormProps extends Omit<PlaceFormDrawerProps, 'open' | 'onClose' | 'place' | 'sessionKey'> {
  place: AdminPlace | null;
  onDone: () => void;
}

const PlaceForm: React.FC<PlaceFormProps> = ({ place, type: initialType, defaultCityId, cities, onDone, onSaved }) => {
  const toast = useToast();
  const savePlace = useSavePlace();
  const [uploading, setUploading] = useState(false);
  const defaults = useMemo(() => toFormInput(place, initialType, defaultCityId), [place, initialType, defaultCityId]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<PlaceFormInput>({
    // Schema là union theo `type` → ép kiểu resolver về dạng phẳng của form
    resolver: zodResolver(placeFormSchema) as unknown as Resolver<PlaceFormInput>,
    defaultValues: defaults,
  });

  const type = watch('type');
  const cityId = watch('city');
  const selectedCity = cities.find((c) => c._id === cityId);
  const cityOptions = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((c) => ({ value: c._id, label: c.name })),
    [cities]
  );

  const onSubmit = (values: PlaceFormInput) => {
    // Resolver đã parse bằng zod → values thực chất là PlaceFormValues (chỉ còn field của loại đang chọn)
    const body = toPlaceDTO(values as unknown as PlaceFormValues);
    // Dữ liệu cũ có thể thiếu field (vd: import OSM) → so sánh trực tiếp, không parse lại bằng zod
    const payload = place ? diffPlace(toPlaceDTO(defaults as unknown as PlaceFormValues), body) : body;
    if (place && !Object.keys(payload).length) {
      onDone();
      return;
    }

    savePlace.mutate(
      { type: values.type, id: place?._id, body: payload as CreatePlaceDTO },
      {
        onSuccess: (saved) => {
          toast.success(place ? 'Đã cập nhật địa điểm' : 'Đã thêm địa điểm', { description: saved.name });
          onSaved?.(values.type);
          onDone();
        },
        onError: (error) => {
          if (hasErrorCode(error, 'CITY_NOT_FOUND')) {
            setError('city', { message: 'Thành phố không còn tồn tại, hãy chọn lại' }, { shouldFocus: true });
          }
        },
      }
    );
  };

  const formError =
    savePlace.isError && !hasErrorCode(savePlace.error, 'CITY_NOT_FOUND')
      ? adminErrorMessage(savePlace.error, 'Không lưu được địa điểm')
      : null;

  return (
    <form className="admin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="admin-form__body">
        {place ? (
          <p className="admin-form__type-note">
            Loại: <strong>{PLACE_TYPE_LABELS[type]}</strong> · Muốn đổi loại, hãy xóa rồi tạo địa điểm mới.
          </p>
        ) : (
          <SegmentedControl
            ariaLabel="Loại địa điểm"
            fullWidth
            value={type}
            onChange={(value) => setValue('type', value, { shouldDirty: true })}
            options={PLACE_TYPES.map((t) => ({ value: t, label: PLACE_TYPE_LABELS[t] }))}
          />
        )}

        <Input
          label="Tên địa điểm"
          required
          autoComplete="off"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="admin-form__row">
          <Select
            label="Thành phố"
            required
            placeholder="Chọn thành phố"
            options={cityOptions}
            error={errors.city?.message}
            {...register('city')}
          />
          <Input label="Địa chỉ" autoComplete="off" error={errors.address?.message} {...register('address')} />
        </div>

        <TypeSpecificFields type={type} control={control} register={register} errors={errors} />

        <Textarea label="Mô tả" rows={4} error={errors.description?.message} {...register('description')} />

        <Controller
          control={control}
          name="images"
          render={({ field }) => (
            <MultiImageUploader
              value={field.value}
              onChange={field.onChange}
              onUploadingChange={setUploading}
              error={errors.images?.message}
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
              fallbackCenter={selectedCity?.coordinates}
              errors={{ lat: errors.coordinates?.lat?.message, lng: errors.coordinates?.lng?.message }}
              action={
                selectedCity && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<LocateFixed className="w-4 h-4" />}
                    onClick={() =>
                      setValue('coordinates', selectedCity.coordinates, { shouldDirty: true, shouldValidate: true })
                    }
                  >
                    Lấy tọa độ {selectedCity.name}
                  </Button>
                )
              }
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
        {uploading && <span className="admin-form__hint">Đang tải ảnh…</span>}
        <Button variant="ghost" onClick={onDone} disabled={savePlace.isPending}>
          Hủy
        </Button>
        <Button type="submit" isLoading={savePlace.isPending} disabled={uploading || (!!place && !isDirty)}>
          {place ? 'Lưu thay đổi' : 'Thêm địa điểm'}
        </Button>
      </div>
    </form>
  );
};

type FormApi = Pick<ReturnType<typeof useForm<PlaceFormInput>>, 'control' | 'register'> & {
  errors: ReturnType<typeof useForm<PlaceFormInput>>['formState']['errors'];
};

/** Field riêng của từng loại (khớp EDITABLE_FIELDS của backend) */
const TypeSpecificFields: React.FC<FormApi & { type: PlaceType }> = ({ type, control, register, errors }) => {
  const money = (name: 'admissionFee' | 'pricePerNight' | 'price', label: string, required = false, helper?: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <MoneyInput
          id={`place-${name}`}
          label={label}
          required={required}
          value={field.value ?? undefined}
          onChange={(v) => field.onChange(v ?? null)}
          onBlur={field.onBlur}
          error={errors[name]?.message}
          helperText={helper}
        />
      )}
    />
  );

  switch (type) {
    case 'attraction':
      return money('admissionFee', 'Giá vé', false, 'Để trống hoặc 0 nếu miễn phí');
    case 'hotel':
      return (
        <div className="admin-form__row">
          <Controller
            control={control}
            name="stars"
            render={({ field }) => (
              <Select
                id="place-stars"
                label="Hạng sao"
                options={STAR_OPTIONS}
                value={field.value === undefined ? '' : String(field.value)}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                error={errors.stars?.message}
              />
            )}
          />
          {money('pricePerNight', 'Giá mỗi đêm', true)}
        </div>
      );
    case 'restaurant':
      return (
        <div className="admin-form__row">
          <Input
            label="Loại ẩm thực"
            placeholder="vd: Hải sản, Món Việt"
            autoComplete="off"
            error={errors.cuisineType?.message}
            {...register('cuisineType')}
          />
          {money('price', 'Giá trung bình / người')}
        </div>
      );
    case 'cafe':
      return money('price', 'Giá trung bình / ly');
  }
};
