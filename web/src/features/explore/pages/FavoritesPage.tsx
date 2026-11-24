import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useExploreQueries';
import { invalidateRelated } from '../../../lib/invalidateRelated';
import { usePagination } from '../hooks/usePagination';
import { exploreApi } from '../services/exploreApi';
import {
  CardSkeletons,
  ExploreFrame,
  PageHeading,
  Pagination,
  PlaceCard,
  Status,
} from '../components/ExploreUI';
import { fromItemType, KIND_LABELS, messageOf, PLACE_KINDS } from '../utils';
import type { ExplorePlace, Favorite } from '../types';

export function FavoritesPage() {
  const query = useFavorites();
  const client = useQueryClient();
  const [kind, setKind] = useState('all');
  const [page, setPage] = useState(1);
  const places: ExplorePlace[] = [];
  const unavailable: Favorite[] = [];
  for (const favorite of query.data ?? []) {
    const type = fromItemType(favorite.itemType);
    if (!type || !favorite.itemId || typeof favorite.itemId === 'string') {
      unavailable.push(favorite);
    } else {
      places.push({ ...favorite.itemId, kind: type });
    }
  }
  const filtered = places.filter(
    (place) => kind === 'all' || place.kind === kind,
  );
  const pagination = usePagination(filtered, page);
  const remove = useMutation({
    mutationFn: exploreApi.deleteFavorite,
    onSuccess: async () => {
      await invalidateRelated.afterFavorite(client);
      toast.success('Đã bỏ lưu địa điểm.');
    },
    onError: (error) => toast.error(messageOf(error)),
  });
  return (
    <ExploreFrame>
      <div className="explore-container">
        <PageHeading
          eyebrow="Những nơi bạn muốn đến"
          title="Bộ sưu tập yêu thích"
          description="Lưu một chút cảm hứng cho chuyến đi tiếp theo."
        >
          <Heart className="explore-heading-icon" size={40} />
        </PageHeading>
        <div className="explore-category-tabs" aria-label="Lọc yêu thích">
          {['all', ...PLACE_KINDS].map((type) => (
            <button
              type="button"
              key={type}
              aria-pressed={kind === type}
              onClick={() => {
                setKind(type);
                setPage(1);
              }}
            >
              {type === 'all'
                ? 'Tất cả'
                : KIND_LABELS[type as keyof typeof KIND_LABELS]}
            </button>
          ))}
        </div>
        {query.isPending ? (
          <CardSkeletons />
        ) : query.isError ? (
          <Status
            title="Chưa tải được danh sách đã lưu"
            description={messageOf(query.error)}
            retry={() => void query.refetch()}
          />
        ) : pagination.total ? (
          <>
            <div className="explore-grid">
              {pagination.items.map((place) => (
                <PlaceCard place={place} key={`${place.kind}-${place._id}`} />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={setPage}
            />
          </>
        ) : (
          <Status
            title={
              kind === 'all'
                ? 'Bộ sưu tập đang chờ chuyến đi đầu tiên'
                : 'Chưa có địa điểm đã lưu trong nhóm này'
            }
            description="Nhấn trái tim ở một địa điểm bạn thích để tìm lại nơi đó tại đây."
          >
            <Link to="/places" className="explore-button">
              Khám phá địa điểm
            </Link>
          </Status>
        )}
        {unavailable.length > 0 && (
          <section className="explore-section">
            <h2>Địa điểm chưa xem được thông tin</h2>
            <p className="explore-muted">
              Một số địa điểm đã lưu không còn thông tin chi tiết. Bạn có thể bỏ
              lưu các mục này.
            </p>
            {unavailable.map((favorite) => (
              <div className="explore-unavailable" key={favorite._id}>
                <span>
                  Địa điểm{' '}
                  {typeof favorite.itemId === 'string'
                    ? favorite.itemId
                    : 'không còn khả dụng'}
                </span>
                <button
                  className="explore-button explore-button--outline"
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(favorite._id)}
                >
                  Bỏ lưu
                </button>
              </div>
            ))}
          </section>
        )}
      </div>
    </ExploreFrame>
  );
}
