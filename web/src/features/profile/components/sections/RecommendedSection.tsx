import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { PlaceCard } from '../../../../components/cards/PlaceCard';
import { CardGridSkeleton } from '../../../../components/cards/CardSkeleton';
import { Button } from '../../../../components/common/Button';
import { toItemType } from '../../../../utils/place';
import type { User } from '../../../../types/user';
import { useAddFavorite, useMyFavorites, usePlaceHighlights } from '../../hooks/useProfileData';
import { recommendPlaces } from '../../utils/recommend';

interface RecommendedSectionProps {
  user: User;
  /** Mở tab Cài đặt để người dùng chọn sở thích */
  onSetPreferences: () => void;
}

/**
 * "Gợi ý dành cho bạn" — địa điểm có thật trong hệ thống, chấm điểm theo đánh giá,
 * sở thích và ngân sách của người dùng (xem utils/recommend.ts). Bỏ qua địa điểm đã yêu thích.
 */
export const RecommendedSection: React.FC<RecommendedSectionProps> = ({ user, onSetPreferences }) => {
  const highlights = usePlaceHighlights();
  const favorites = useMyFavorites();
  const addFavorite = useAddFavorite();

  const interests = useMemo(() => user.travelPreferences ?? [], [user.travelPreferences]);
  const hasPreferences = interests.length > 0 || !!user.favoriteBudget;

  const recommendations = useMemo(() => {
    if (!highlights.data) return [];
    const excludeIds = new Set(favorites.data?.favorites.map((f) => f.itemId._id) ?? []);
    return recommendPlaces(highlights.data, {
      interests,
      favoriteBudget: user.favoriteBudget,
      excludeIds,
    });
  }, [highlights.data, favorites.data, interests, user.favoriteBudget]);

  // Lỗi hoặc hệ thống chưa có địa điểm → ẩn cả khối, không làm phiền người dùng
  if (highlights.isError || (highlights.isSuccess && recommendations.length === 0)) return null;

  return (
    <section className="profile-section" aria-labelledby="recommended-title">
      <header className="profile-section__header">
        <h2 id="recommended-title" className="profile-section__title">
          <Sparkles className="profile-section__title-icon" aria-hidden="true" />
          {hasPreferences ? 'Gợi ý dành cho bạn' : 'Nổi bật trên TripMate'}
        </h2>
        <p className="profile-section__desc">
          {hasPreferences
            ? 'Chọn lọc theo sở thích và ngân sách bạn đã thiết lập.'
            : 'Những địa điểm được du khách đánh giá cao nhất.'}
        </p>
      </header>

      {!hasPreferences && (
        <div className="profile-section__notice">
          <p>Cho TripMate biết bạn thích gì để nhận gợi ý chính xác hơn.</p>
          <Button variant="outline" size="sm" onClick={onSetPreferences}>
            Chọn sở thích
          </Button>
        </div>
      )}

      {highlights.isPending ? (
        <CardGridSkeleton />
      ) : (
        <div className="card-grid">
          {recommendations.map(({ place, type, reason }) => (
            <PlaceCard
              key={place._id}
              place={place}
              type={type}
              highlight={hasPreferences ? reason : undefined}
              onToggleFavorite={() => addFavorite.mutate({ itemType: toItemType(type), itemId: place._id })}
            />
          ))}
        </div>
      )}
    </section>
  );
};
