import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCities, usePlaces } from '../hooks/useExploreQueries';
import { useDebounce } from '../../../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import {
  ExploreFrame,
  PageHeading,
  Pagination,
  Status,
} from '../components/ExploreUI';
import { PlaceGrid } from '../components/PlaceGrid';
import {
  KIND_LABELS,
  messageOf,
  parseFilters,
  PLACE_KINDS,
  updateFilters,
} from '../utils';
import type { ExploreFilters } from '../types';

export function PlacesPage() {
  const [params, setParams] = useSearchParams();
  const filters = parseFilters(params);
  const keyword = useDebounce(filters.search, 350);
  const criteria = { ...filters, search: keyword };
  const invalidRange =
    filters.minPrice !== '' &&
    filters.maxPrice !== '' &&
    Number(filters.minPrice) > Number(filters.maxPrice);
  const query = usePlaces(criteria, !invalidRange);
  const cities = useCities();
  const pagination = usePagination(query.data ?? [], filters.page);
  const change = (patch: Partial<ExploreFilters>, replace = false) =>
    setParams((current) => updateFilters(current, patch), { replace });
  const busy = query.isPending || keyword !== filters.search;
  return (
    <ExploreFrame>
      <div className="explore-container">
        <nav className="explore-breadcrumb" aria-label="Đường dẫn">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>Khám phá địa điểm</span>
        </nav>
        <PageHeading
          eyebrow="Tìm một trải nghiệm mới"
          title="Đi đâu trong chuyến đi này?"
          description="Tìm điểm tham quan, nơi nghỉ, nhà hàng và quán cà phê phù hợp với bạn."
        />
        <div className="explore-directory">
          <aside className="explore-filters" aria-label="Bộ lọc địa điểm">
            <div className="explore-filter-heading">
              <h2>
                <SlidersHorizontal size={18} />
                Bộ lọc
              </h2>
              <button type="button" onClick={() => setParams({})}>
                <X size={14} /> Xóa lọc
              </button>
            </div>
            <label>
              Từ khóa
              <div className="explore-input-icon">
                <Search size={16} />
                <input
                  type="search"
                  aria-label="Từ khóa địa điểm"
                  placeholder="Bạn đang tìm nơi nào?"
                  value={params.get('search') ?? ''}
                  onChange={(e) => change({ search: e.target.value }, true)}
                />
              </div>
            </label>
            <label>
              Thành phố
              <select
                aria-label="Lọc theo thành phố"
                value={filters.city}
                onChange={(e) => change({ city: e.target.value })}
              >
                <option value="">Tất cả thành phố</option>
                {cities.data?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            {cities.isError && (
              <p className="explore-error">
                Chưa tải được bộ chọn thành phố.{' '}
                <button type="button" onClick={() => void cities.refetch()}>
                  Thử lại
                </button>
              </p>
            )}
            <fieldset>
              <legend>Loại trải nghiệm</legend>
              {(['all', ...PLACE_KINDS] as const).map((type) => (
                <label className="explore-radio" key={type}>
                  <input
                    type="radio"
                    name="explore-type"
                    value={type}
                    checked={filters.type === type}
                    onChange={() => change({ type })}
                  />
                  {type === 'all' ? 'Tất cả loại hình' : KIND_LABELS[type]}
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>
                {filters.type === 'attraction'
                  ? 'Giá vé (VNĐ)'
                  : filters.type === 'hotel'
                    ? 'Giá phòng / đêm (VNĐ)'
                    : 'Giá tham khảo (VNĐ)'}
              </legend>
              <div className="explore-price-inputs">
                <label>
                  <span>Từ</span>
                  <input
                    aria-label="Giá thấp nhất"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={params.get('minPrice') ?? ''}
                    onChange={(e) => change({ minPrice: e.target.value }, true)}
                  />
                </label>
                <label>
                  <span>Đến</span>
                  <input
                    aria-label="Giá cao nhất"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Không giới hạn"
                    value={params.get('maxPrice') ?? ''}
                    onChange={(e) => change({ maxPrice: e.target.value }, true)}
                  />
                </label>
              </div>
            </fieldset>
            {invalidRange && (
              <p role="alert" className="explore-error">
                Giá thấp nhất phải nhỏ hơn hoặc bằng giá cao nhất.
              </p>
            )}
            {filters.type === 'hotel' && (
              <label>
                Hạng sao khách sạn
                <select
                  aria-label="Hạng sao khách sạn"
                  value={filters.stars}
                  onChange={(e) => change({ stars: e.target.value })}
                >
                  <option value="">Tất cả hạng sao</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} sao
                    </option>
                  ))}
                </select>
              </label>
            )}
            {filters.type === 'restaurant' && (
              <label>
                Loại ẩm thực
                <input
                  aria-label="Loại ẩm thực"
                  value={params.get('cuisineType') ?? ''}
                  placeholder="Ví dụ: Việt Nam"
                  onChange={(e) =>
                    change({ cuisineType: e.target.value }, true)
                  }
                />
              </label>
            )}
          </aside>
          <section className="explore-results" aria-label="Kết quả tìm kiếm">
            <div className="explore-results-bar">
              <p aria-live="polite">
                {busy ? (
                  'Đang tìm địa điểm…'
                ) : query.isError || invalidRange ? (
                  'Kết quả tìm kiếm'
                ) : (
                  <>
                    <strong>{pagination.total}</strong> địa điểm phù hợp
                  </>
                )}
              </p>
              <span>
                {filters.type === 'all'
                  ? 'Tất cả trải nghiệm'
                  : KIND_LABELS[filters.type]}
              </span>
            </div>
            {invalidRange ? (
              <Status
                title="Kiểm tra lại khoảng giá"
                description="Điều chỉnh giá từ và đến để tiếp tục tìm kiếm."
              />
            ) : busy ? (
              <PlaceGrid loading places={[]} />
            ) : query.isError ? (
              <Status
                title="Chưa tải được địa điểm"
                description={messageOf(query.error)}
                retry={() => void query.refetch()}
              />
            ) : pagination.total ? (
              <>
                <PlaceGrid loading={false} places={pagination.items} />
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onChange={(page) => change({ page })}
                />
              </>
            ) : (
              <Status
                title="Chưa tìm thấy điểm dừng chân phù hợp"
                description="Thử đổi từ khóa hoặc bộ lọc. Nếu chưa có nội dung, hãy quay lại sau khi các địa điểm được cập nhật."
              >
                <button
                  className="explore-button explore-button--outline"
                  type="button"
                  onClick={() => setParams({})}
                >
                  Xóa bộ lọc
                </button>
              </Status>
            )}
          </section>
        </div>
      </div>
    </ExploreFrame>
  );
}
