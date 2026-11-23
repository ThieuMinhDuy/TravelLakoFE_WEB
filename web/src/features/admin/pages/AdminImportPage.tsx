import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Coffee,
  DownloadCloud,
  Hotel,
  Landmark,
  Loader2,
  MapPin,
  RotateCcw,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Button } from '../../../components/common/Button';
import { buttonVariants } from '../../../components/common/buttonVariants';
import { cn } from '../../../utils/cn';
import type { ImportEnrichment, ImportOsmDTO, ImportStats } from '../../../types/admin';
import { PLACE_TYPE_LABELS, toPlaceType } from '../../../utils/place';
import { toSearchKey } from '../../../utils/searchKey';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { useImportOsm } from '../hooks/useAdminMutations';
import { useAdminCities, useVietnamCities } from '../hooks/useAdminQueries';
import { IMPORT_LIMIT, importFormSchema, type ImportFormValues } from '../schemas';
import { adminErrorMessage } from '../utils/adminErrors';
// Dùng trực tiếp class của Select / Input cho <select> có nhóm (optgroup) → nạp style của chúng
import '../../../components/common/css/Select.css';
import '../../../components/common/css/Input.css';
import './css/AdminPages.css';
import './css/AdminImport.css';

/** Các bước ước lượng theo thời gian (API chỉ trả kết quả một lần ở cuối) */
const STEPS = [
  { from: 0, label: 'Tìm tọa độ thành phố' },
  { from: 4, label: 'Lấy dữ liệu từ OpenStreetMap' },
  { from: 20, label: 'AI viết mô tả, giá tham khảo & lưu địa điểm' },
] as const;

const RESULT_ITEMS: { key: keyof ImportStats; label: string; icon: React.ElementType }[] = [
  { key: 'attractionsImported', label: 'Điểm tham quan', icon: Landmark },
  { key: 'hotelsImported', label: 'Khách sạn', icon: Hotel },
  { key: 'restaurantsImported', label: 'Nhà hàng', icon: Utensils },
  { key: 'cafesImported', label: 'Quán cafe', icon: Coffee },
];

interface ImportResult {
  cityName: string;
  stats: ImportStats;
  enrichment?: ImportEnrichment;
  durationSec: number;
}

/** "id:<cityId>" hoặc "name:<tên>" → body API */
const toDTO = ({ target, limit }: ImportFormValues): ImportOsmDTO =>
  target.startsWith('id:') ? { cityId: target.slice(3), limit } : { cityName: target.slice(5), limit };

/** Bộ đếm giây khi đang chạy */
function useElapsed(running: boolean) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  if (running && startedAt === null) setStartedAt(Date.now());
  if (!running && startedAt !== null) setStartedAt(null);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [running]);

  return startedAt === null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000));
}

export const AdminImportPage: React.FC = () => {
  useDocumentTitle('Import từ OpenStreetMap');
  const citiesQuery = useAdminCities();
  // Gọi ngay khi vào trang: vừa lấy danh sách, vừa "đánh thức" server Render gói free
  const vnQuery = useVietnamCities();
  const importOsm = useImportOsm();
  const [result, setResult] = useState<ImportResult | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: { target: '', limit: IMPORT_LIMIT.default },
  });

  const cities = useMemo(() => citiesQuery.data?.cities ?? [], [citiesQuery.data]);
  // Xếp tên gợi ý vào nhóm "đã có" theo cùng cách backend so tên (bỏ dấu, không phân biệt hoa thường),
  // nên "Đà Lạt" trong danh sách gợi ý khớp với "Da Lat" đã có và được gửi bằng cityId
  const existingByName = useMemo(() => new Map(cities.map((c) => [toSearchKey(c.name), c])), [cities]);
  const existingOptions = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name, 'vi')),
    [cities]
  );
  const newOptions = useMemo(
    () =>
      (vnQuery.data ?? [])
        .filter((name) => !existingByName.has(toSearchKey(name)))
        .sort((a, b) => a.localeCompare(b, 'vi')),
    [vnQuery.data, existingByName]
  );

  const target = watch('target');

  // Import xong một thành phố mới → nó chuyển sang nhóm "đã có"; chọn lại theo cityId để lần sau gửi đúng
  useEffect(() => {
    if (!target.startsWith('name:')) return;
    const created = existingByName.get(toSearchKey(target.slice(5)));
    if (created) setValue('target', `id:${created._id}`);
  }, [target, existingByName, setValue]);
  const targetLabel = target.startsWith('id:')
    ? cities.find((c) => c._id === target.slice(3))?.name
    : target.slice(5);
  const resultCity = result ? existingByName.get(toSearchKey(result.cityName)) : undefined;

  const running = importOsm.isPending;
  const elapsed = useElapsed(running);
  const stepIndex = STEPS.reduce((acc, step, i) => (elapsed >= step.from ? i : acc), 0);

  // Đang chạy mà đóng / tải lại trang → hỏi lại (request sẽ bị bỏ dở phía trình duyệt)
  useEffect(() => {
    if (!running) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [running]);

  const onSubmit = (values: ImportFormValues) => {
    const cityName = targetLabel ?? '';
    const startedAt = Date.now();
    setResult(null);
    importOsm.mutate(toDTO(values), {
      onSuccess: (res) => {
        const stats = res.stats ?? {
          hotelsImported: 0,
          attractionsImported: 0,
          restaurantsImported: 0,
          cafesImported: 0,
          totalImported: 0,
        };
        setResult({
          cityName,
          stats,
          enrichment: res.enrichment,
          durationSec: Math.round((Date.now() - startedAt) / 1000),
        });
      },
    });
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Import từ OpenStreetMap"
        description="Tự động lấy địa điểm thật (tên, tọa độ, địa chỉ) theo thành phố để làm giàu dữ liệu"
      />

      <div className="admin-import">
        <form className="admin-import__form glass glass--thick" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="admin-import__field">
            <label htmlFor="import-target" className="ui-select-label">
              Thành phố<span className="ui-input-required">*</span>
            </label>
            <Controller
              control={control}
              name="target"
              render={({ field }) => (
                <div className="ui-select-container">
                  <select
                    id="import-target"
                    className={cn('ui-select', errors.target && 'ui-select--error')}
                    aria-invalid={!!errors.target || undefined}
                    disabled={running}
                    {...field}
                  >
                    <option value="">
                      {citiesQuery.isLoading || vnQuery.isLoading ? 'Đang tải danh sách…' : 'Chọn thành phố'}
                    </option>
                    {existingOptions.length > 0 && (
                      <optgroup label="Thành phố đã có — thêm địa điểm mới">
                        {existingOptions.map((c) => (
                          <option key={c._id} value={`id:${c._id}`}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {newOptions.length > 0 && (
                      <optgroup label="Thêm thành phố mới từ danh sách">
                        {newOptions.map((name) => (
                          <option key={name} value={`name:${name}`}>
                            {name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <ChevronDown className="ui-select-icon" aria-hidden="true" />
                </div>
              )}
            />
            {errors.target ? (
              <p className="ui-select-message--error">{errors.target.message}</p>
            ) : target.startsWith('name:') ? (
              <p className="ui-select-message--helper">
                Thành phố "{targetLabel}" chưa có — hệ thống sẽ tự tạo (tọa độ từ OpenStreetMap, ảnh ngẫu nhiên).
              </p>
            ) : null}
          </div>

          <Controller
            control={control}
            name="limit"
            render={({ field }) => (
              <div className="admin-import__field">
                <div className="admin-import__limit-head">
                  <label htmlFor="import-limit" className="ui-select-label">
                    Số địa điểm tối đa mỗi loại
                  </label>
                  <output htmlFor="import-limit" className="admin-import__limit-value">
                    {field.value}
                  </output>
                </div>
                <input
                  id="import-limit"
                  type="range"
                  min={IMPORT_LIMIT.min}
                  max={IMPORT_LIMIT.max}
                  step={1}
                  value={field.value}
                  disabled={running}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="admin-import__range"
                  style={{ '--fill': `${((field.value - IMPORT_LIMIT.min) / (IMPORT_LIMIT.max - IMPORT_LIMIT.min)) * 100}%` } as React.CSSProperties}
                />
                <p className="ui-select-message--helper">
                  4 loại × {field.value} → tối đa {field.value * 4} địa điểm. Địa điểm đã có (trùng tên trong cùng thành
                  phố) sẽ được bỏ qua.
                </p>
              </div>
            )}
          />

          <Button
            type="submit"
            isLoading={running}
            leftIcon={running ? undefined : <DownloadCloud className="w-4 h-4" />}
            className="admin-import__submit"
          >
            {running ? 'Đang import…' : 'Bắt đầu import'}
          </Button>
        </form>

        <aside className="admin-import__info glass">
          <h2>Import hoạt động thế nào?</h2>
          <ol>
            <li>Tìm tọa độ thành phố (tạo thành phố mới nếu chưa có).</li>
            <li>Lấy điểm tham quan, khách sạn, nhà hàng, quán cafe quanh thành phố từ OpenStreetMap.</li>
            <li>AI viết mô tả và giá tham khảo, gán ảnh minh họa, rồi lưu vào hệ thống.</li>
          </ol>
          <div className="admin-import__warning" role="note">
            <AlertTriangle aria-hidden="true" />
            <p>
              Tên, địa chỉ và tọa độ lấy từ OpenStreetMap. <strong>Mô tả và giá tham khảo do AI viết</strong> (khách sạn
              có thêm số sao, nhà hàng có thêm loại ẩm thực) nên có thể chưa chính xác. <strong>Ảnh là ảnh minh họa.</strong>{' '}
              Điểm đánh giá bắt đầu từ 0. Hãy rà lại ở trang Địa điểm trước khi công bố.
            </p>
          </div>
          <p className="admin-import__note">Thường mất 30–60 giây. Máy chủ miễn phí có thể cần thêm thời gian khởi động.</p>
        </aside>
      </div>

      {running && (
        <section className="admin-import__progress glass" aria-live="polite">
          <header>
            <h2>
              Đang import <strong>{targetLabel}</strong>
            </h2>
            <span className="admin-import__elapsed">{elapsed}s</span>
          </header>
          <ol className="admin-import__steps">
            {STEPS.map((step, i) => (
              <li
                key={step.label}
                className={cn(i < stepIndex && 'is-done', i === stepIndex && 'is-active')}
                aria-current={i === stepIndex ? 'step' : undefined}
              >
                <span className="admin-import__step-icon">
                  {i < stepIndex ? <Check /> : i === stepIndex ? <Loader2 className="animate-spin" /> : i + 1}
                </span>
                {step.label}
              </li>
            ))}
          </ol>
          <p className="admin-import__note">Vui lòng không đóng trang trong lúc import.</p>
        </section>
      )}

      {importOsm.isError && !running && (
        <section className="admin-import__error glass" role="alert">
          <AlertTriangle aria-hidden="true" />
          <div>
            <h2>Import thất bại</h2>
            <p>{adminErrorMessage(importOsm.error, 'Không import được dữ liệu')}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={handleSubmit(onSubmit)}
          >
            Thử lại
          </Button>
        </section>
      )}

      {result && !running && (
        <section className="admin-import__result glass" aria-live="polite">
          <header>
            <div>
              <h2>
                {result.stats.totalImported > 0 ? (
                  <>
                    Đã thêm <strong>{result.stats.totalImported}</strong> địa điểm cho {result.cityName}
                  </>
                ) : (
                  <>Không có địa điểm mới cho {result.cityName}</>
                )}
              </h2>
              <p>
                {result.stats.totalImported > 0
                  ? `Hoàn tất sau ${result.durationSec} giây.`
                  : 'Các địa điểm tìm được đều đã có trong hệ thống. Thử tăng số lượng mỗi loại để lấy thêm.'}
              </p>
            </div>
            {resultCity && result.stats.totalImported > 0 && (
              <Link
                to={`/admin/places?city=${resultCity._id}`}
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                <MapPin className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Xem địa điểm vừa nhập
              </Link>
            )}
          </header>
          {result.enrichment && result.stats.totalImported > 0 && <EnrichmentSummary enrichment={result.enrichment} />}
          <dl className="admin-import__stats">
            {RESULT_ITEMS.map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <dt>
                  <Icon aria-hidden="true" />
                  {label}
                </dt>
                <dd>{result.stats[key]}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
};

/** Phần do AI viết và phần dùng mô tả mẫu trong lần import vừa xong */
const EnrichmentSummary: React.FC<{ enrichment: ImportEnrichment }> = ({ enrichment }) => {
  const { aiGenerated, templateGenerated, geminiEnabled, failedTypes } = enrichment;

  if (!geminiEnabled) {
    return (
      <p className="admin-import__ai admin-import__ai--warn" role="note">
        <AlertTriangle aria-hidden="true" />
        Máy chủ chưa bật AI, toàn bộ địa điểm dùng mô tả mẫu và giá ngẫu nhiên.
      </p>
    );
  }

  const failedLabels = failedTypes.map((t) => PLACE_TYPE_LABELS[toPlaceType(t)]).join(', ');
  return (
    <div className="admin-import__ai-group">
      <p className="admin-import__ai">
        <Sparkles aria-hidden="true" />
        <span>
          <strong>{aiGenerated}</strong> địa điểm có mô tả do AI viết
          {templateGenerated > 0 && (
            <>
              , <strong>{templateGenerated}</strong> địa điểm dùng mô tả mẫu
            </>
          )}
          .
        </span>
      </p>
      {failedTypes.length > 0 && (
        <p className="admin-import__ai admin-import__ai--warn" role="note">
          <AlertTriangle aria-hidden="true" />
          AI chưa xử lý được: {failedLabels} (dùng mô tả mẫu).
        </p>
      )}
    </div>
  );
};
