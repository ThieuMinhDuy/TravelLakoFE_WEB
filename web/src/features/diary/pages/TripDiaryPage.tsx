import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Info, MapPin, Sparkles } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Spinner } from '../../../components/common/Spinner';
import { StatusView } from '../../../components/common/StatusView';
import { buttonVariants } from '../../../components/common/buttonVariants';
import { ConfirmDialog } from '../../../components/compound/ConfirmDialog';
import { useLocale } from '../../../contexts/locale/LocaleContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { getCityName } from '../../../utils/place';
import { getTripDays } from '../../../utils/trip';
import { DiaryEditor } from '../components/DiaryEditor';
import { TripItinerarySidebar } from '../components/TripItinerarySidebar';
import { useTripDiaryDetail, useUpdateTripDiary } from '../hooks/useTripDiary';
import { getDiaryPhotoCount, hasDiaryContent, isTripEnded } from '../utils/diaryHelpers';
import './css/DiaryPage.css';

/** Trang viết / xem chi tiết nhật ký của một chuyến đi (/trips/:id/diary) */
export const TripDiaryPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { formatDate } = useLocale();

  const tripQuery = useTripDiaryDetail(id);
  const updateMutation = useUpdateTripDiary(id);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavTarget, setPendingNavTarget] = useState<string | null>(null);

  const trip = tripQuery.data;
  useDocumentTitle(trip?.title ? `${trip.title} · Nhật ký` : 'Nhật ký chuyến đi');

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleGuardedNavigate = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (!hasUnsavedChanges) return;
    e.preventDefault();
    setPendingNavTarget(target);
  };

  if (tripQuery.isPending && !trip) {
    return (
      <div className="diary-page flex justify-center py-20" role="status" aria-label="Đang tải nhật ký">
        <Spinner size="lg" className="text-[#FA8B02]" />
      </div>
    );
  }

  if (tripQuery.isError || !trip) {
    return (
      <div className="diary-page">
        <StatusView
          title="Không tải được nhật ký chuyến đi"
          description={
            tripQuery.error?.message || 'Chuyến đi không tồn tại hoặc bạn không có quyền truy cập.'
          }
          actions={
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="primary" size="sm" onClick={() => void tripQuery.refetch()}>
                Thử lại
              </Button>
              <Link to="/diary" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                Về trang Nhật ký
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const cityName = getCityName(trip.city);
  const days = getTripDays(trip);
  const ended = isTripEnded(trip);
  const written = hasDiaryContent(trip);
  const photoCount = getDiaryPhotoCount(trip);

  return (
    <div className="diary-page">
      <div className="diary-page__topbar">
        <Link
          to="/diary"
          className="diary-page__back"
          onClick={(e) => handleGuardedNavigate(e, '/diary')}
        >
          <ArrowLeft className="w-4 h-4" />
          Tất cả nhật ký
        </Link>

        <Link
          to={`/trips/${trip._id}`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
          onClick={(e) => handleGuardedNavigate(e, `/trips/${trip._id}`)}
        >
          Xem chi tiết lịch trình
        </Link>
      </div>

      <header className="diary-hero">
        <div className="diary-hero__badges">
          <span className={`diary-pill ${ended ? 'diary-pill--teal' : 'diary-pill--muted'}`}>
            {ended ? 'Đã đi' : 'Chưa kết thúc'}
          </span>
          <span className={`diary-pill ${written ? 'diary-pill--brand' : 'diary-pill--muted'}`}>
            {written ? `Đã viết · ${photoCount} ảnh` : 'Chưa viết nhật ký'}
          </span>
        </div>

        <h1 className="diary-hero__title">{trip.title}</h1>

        <div className="diary-hero__meta">
          {cityName && (
            <span className="diary-hero__meta-item">
              <MapPin className="w-4 h-4 text-[#FA8B02]" aria-hidden="true" />
              {cityName}
            </span>
          )}
          <span className="diary-hero__meta-item">
            <CalendarDays className="w-4 h-4 text-[#FA8B02]" aria-hidden="true" />
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)} · {days} ngày
          </span>
        </div>

        {ended && !written && (
          <p className="diary-hero__notice mb-0">
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
            Chuyến đi đã hoàn thành — hãy ghi lại cảm xúc và tải lên tối đa 10 bức ảnh đáng nhớ nhất!
          </p>
        )}

        {!ended && (
          <p className="diary-hero__notice mb-0">
            <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
            Chuyến đi này vẫn chưa kết thúc — bạn vẫn có thể ghi chú trước các trải nghiệm tại đây.
          </p>
        )}
      </header>

      <div className="diary-detail__layout">
        <DiaryEditor
          initialDiary={trip.diary}
          tripTitle={trip.title}
          isSaving={updateMutation.isPending}
          onDirtyChange={setHasUnsavedChanges}
          onSave={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
        />

        <TripItinerarySidebar trip={trip} />
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingNavTarget)}
        onClose={() => setPendingNavTarget(null)}
        onConfirm={() => {
          const target = pendingNavTarget;
          setPendingNavTarget(null);
          if (target) navigate(target);
        }}
        title="Rời trang khi chưa lưu?"
        message="Bạn đang có nội dung nhật ký chưa lưu. Nếu rời trang lúc này, các thay đổi mới sẽ bị mất."
        confirmText="Rời trang"
        cancelText="Ở lại viết tiếp"
        variant="accent"
      />
    </div>
  );
};

