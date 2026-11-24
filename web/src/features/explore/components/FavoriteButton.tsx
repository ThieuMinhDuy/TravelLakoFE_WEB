import { Heart, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { PlaceType } from '../../../types/place';
import { useAuthStore } from '../../../store/useAuthStore';
import { useFavorites } from '../hooks/useExploreQueries';
import { invalidateRelated } from '../../../lib/invalidateRelated';
import { exploreApi } from '../services/exploreApi';
import { messageOf, toItemType } from '../utils';

export function FavoriteButton({
  kind,
  itemId,
  withLabel = false,
}: {
  kind: PlaceType;
  itemId: string;
  withLabel?: boolean;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const query = useFavorites();
  const favorite = query.data?.find(
    (f) =>
      f.itemType === toItemType(kind) &&
      (typeof f.itemId === 'object' && f.itemId ? f.itemId._id : f.itemId) ===
        itemId,
  );
  const client = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const mutation = useMutation({
    mutationFn: async () => {
      if (query.isError)
        throw new Error(
          'Chưa tải được danh sách yêu thích. Vui lòng thử tải lại trang.',
        );
      return favorite
        ? exploreApi.deleteFavorite(favorite._id)
        : exploreApi.addFavorite(kind, itemId);
    },
    onSuccess: async () => {
      await invalidateRelated.afterFavorite(client);
      toast.success(favorite ? 'Đã bỏ lưu địa điểm.' : 'Đã lưu địa điểm.');
    },
    onError: (error) => toast.error(messageOf(error)),
  });
  const label = favorite ? 'Bỏ lưu địa điểm' : 'Lưu địa điểm';
  return (
    <button
      type="button"
      className={`explore-favorite ${withLabel ? 'explore-favorite--label' : ''} ${favorite ? 'is-saved' : ''}`}
      aria-label={label}
      aria-pressed={!!favorite}
      disabled={mutation.isPending || (isAuthenticated && query.isPending)}
      onClick={() => {
        if (!isAuthenticated) {
          navigate(
            `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`,
            { state: { backgroundLocation: location } },
          );
          return;
        }
        mutation.mutate();
      }}
    >
      {mutation.isPending ? (
        <Loader2 size={19} className="explore-spin" />
      ) : (
        <Heart size={19} fill={favorite ? 'currentColor' : 'none'} />
      )}
      {withLabel && label}
    </button>
  );
}
