import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCities } from '../hooks/useExploreQueries';
import { useDebounce } from '../../../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import {
  CardSkeletons,
  CityCard,
  ExploreFrame,
  PageHeading,
  Pagination,
  Status,
} from '../components/ExploreUI';
import { messageOf, normalizeText } from '../utils';

export function CitiesPage() {
  const query = useCities();
  const [params, setParams] = useSearchParams();
  const input = params.get('search') ?? '';
  const keyword = useDebounce(input, 350);
  const cities =
    query.data?.filter((c) =>
      normalizeText(c.name).includes(normalizeText(keyword)),
    ) ?? [];
  const pagination = usePagination(cities, Number(params.get('page')) || 1);
  return (
    <ExploreFrame>
      <div className="explore-container">
        <PageHeading
          eyebrow="Khám phá Việt Nam"
          title="Mỗi thành phố, một câu chuyện"
          description="Chọn điểm dừng chân và khám phá những trải nghiệm quanh bạn."
        />
        <div className="explore-toolbar">
          <label className="explore-search-field">
            <Search size={19} />
            <input
              type="search"
              value={input}
              onChange={(e) => {
                const value = e.target.value;
                setParams(
                  (current) => {
                    const next = new URLSearchParams(current);
                    if (value) next.set('search', value);
                    else next.delete('search');
                    next.delete('page');
                    return next;
                  },
                  { replace: true },
                );
              }}
              placeholder="Tìm thành phố…"
              aria-label="Tìm thành phố"
            />
          </label>
          <Link to="/places" className="explore-text-link">
            Xem tất cả địa điểm →
          </Link>
        </div>
        {query.isPending || input !== keyword ? (
          <CardSkeletons />
        ) : query.isError ? (
          <Status
            title="Chưa tải được thành phố"
            description={messageOf(query.error)}
            retry={() => void query.refetch()}
          />
        ) : cities.length ? (
          <>
            <div className="explore-grid">
              {pagination.items.map((c) => (
                <CityCard city={c} key={c._id} />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={(page) =>
                setParams((current) => {
                  const next = new URLSearchParams(current);
                  next.set('page', String(page));
                  return next;
                })
              }
            />
          </>
        ) : (
          <Status
            title={
              keyword
                ? 'Chưa tìm thấy thành phố phù hợp'
                : 'Chưa có thành phố nào'
            }
            description={
              keyword
                ? 'Thử một từ khóa khác hoặc xóa nội dung tìm kiếm.'
                : 'Các thành phố sẽ xuất hiện tại đây khi được cập nhật.'
            }
          />
        )}
      </div>
    </ExploreFrame>
  );
}
