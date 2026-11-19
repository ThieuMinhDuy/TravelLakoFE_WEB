import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Heart } from 'lucide-react';
import { Tabs } from '../../../../components/compound/Tabs';
import { PlaceCard } from '../../../../components/cards/PlaceCard';
import { CardGridSkeleton } from '../../../../components/cards/CardSkeleton';
import { EmptyState } from '../../../../components/common/EmptyState';
import { Pagination } from '../../../../components/common/Pagination';
import { buttonVariants } from '../../../../components/common/buttonVariants';
import { usePagination } from '../../../../hooks/usePagination';
import { PLACE_TYPES, PLACE_TYPE_LABELS, toPlaceType } from '../../../../utils/place';
import type { Favorite } from '../../../../types/favorite';
import type { PlaceType } from '../../../../types/place';
import { useMyFavorites, useRemoveFavorite } from '../../hooks/useProfileData';
import { TabError } from './TabError';

const PAGE_SIZE = 8;
type FavoriteFilter = 'all' | PlaceType;

const FavoriteGrid: React.FC<{ favorites: Favorite[]; onRemove: (id: string) => void }> = ({
  favorites,
  onRemove,
}) => {
  const pagination = usePagination(favorites, { pageSize: PAGE_SIZE });

  if (favorites.length === 0) {
    return <EmptyState icon={<Heart className="w-6 h-6" />} title="Chưa có địa điểm nào thuộc loại này" />;
  }

  return (
    <>
      <div className="card-grid">
        {pagination.pageItems.map((favorite) => (
          <PlaceCard
            key={favorite._id}
            place={favorite.itemId}
            type={toPlaceType(favorite.itemType)}
            isFavorite
            onToggleFavorite={() => onRemove(favorite._id)}
          />
        ))}
      </div>
      <Pagination pagination={pagination} className="profile-tab__pagination" />
    </>
  );
};

/** Tab "Yêu thích": lọc theo loại địa điểm, bỏ yêu thích ngay trên thẻ */
export const FavoritesTab: React.FC = () => {
  const { data, isPending, isError, error, refetch } = useMyFavorites();
  const removeFavorite = useRemoveFavorite();
  const [filter, setFilter] = useState<FavoriteFilter>('all');

  const favorites = useMemo(() => data?.favorites ?? [], [data]);
  // Đếm số địa điểm theo từng loại để hiện trên tab lọc
  const counts = useMemo(() => {
    const result: Record<FavoriteFilter, number> = { all: favorites.length, hotel: 0, attraction: 0, restaurant: 0, cafe: 0 };
    favorites.forEach((f) => (result[toPlaceType(f.itemType)] += 1));
    return result;
  }, [favorites]);

  if (isPending) return <CardGridSkeleton />;
  if (isError) return <TabError message={error.message} onRetry={() => void refetch()} />;

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-6 h-6" />}
        title="Bạn chưa lưu địa điểm nào"
        description="Bấm biểu tượng trái tim trên khách sạn, nhà hàng hay điểm tham quan để lưu lại xem sau."
        action={
          <Link to="/places" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            <Compass className="w-4 h-4" />
            Khám phá địa điểm
          </Link>
        }
      />
    );
  }

  const filters: FavoriteFilter[] = ['all', ...PLACE_TYPES.filter((t) => counts[t] > 0)];
  // Bỏ yêu thích địa điểm cuối cùng của loại đang lọc → loại đó biến mất, quay về "Tất cả"
  const activeFilter = filters.includes(filter) ? filter : 'all';
  const visible =
    activeFilter === 'all' ? favorites : favorites.filter((f) => toPlaceType(f.itemType) === activeFilter);

  return (
    <Tabs value={activeFilter} onValueChange={(v) => setFilter(v as FavoriteFilter)} variant="pills">
      <div className="profile-tab__toolbar">
        <Tabs.List aria-label="Lọc theo loại địa điểm">
          {filters.map((f) => (
            <Tabs.Tab key={f} value={f} badge={counts[f]}>
              {f === 'all' ? 'Tất cả' : PLACE_TYPE_LABELS[f]}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <Link to="/favorites" className="profile-tab__more-link">
          Xem trang Yêu thích
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {filters.map((f) => (
        <Tabs.Panel key={f} value={f}>
          <FavoriteGrid favorites={visible} onRemove={(id) => removeFavorite.mutate(id)} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};
