import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { EmptyState } from '../../../../components/common/EmptyState';
import { Modal } from '../../../../components/common/Modal';
import { Skeleton } from '../../../../components/common/Skeleton';
import { buttonVariants } from '../../../../components/common/buttonVariants';
import { useLocale } from '../../../../contexts/locale/LocaleContext';
import { getCityName } from '../../../../utils/place';
import { useMyTrips } from '../../hooks/useProfileData';
import { TabError } from './TabError';
import { collectMemories } from '../../utils/memories';

/** Tab "Kỷ niệm": lưới ảnh nhật ký các chuyến đi, bấm để xem lớn */
export const MemoriesTab: React.FC = () => {
  const { data, isPending, isError, error, refetch } = useMyTrips();
  const { formatDate } = useLocale();
  const [viewing, setViewing] = useState<number | null>(null);

  const memories = useMemo(() => (data ? collectMemories(data) : []), [data]);
  const current = viewing !== null ? memories[viewing] : null;

  const go = (step: number) =>
    setViewing((i) => (i === null ? i : (i + step + memories.length) % memories.length));

  // ← / → để chuyển ảnh khi đang xem
  useEffect(() => {
    if (viewing === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewing, memories.length]);

  if (isPending) {
    return (
      <div className="memories-grid" role="status" aria-label="Đang tải">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="memories-grid__skeleton" />
        ))}
      </div>
    );
  }
  if (isError) return <TabError message={error.message} onRetry={() => void refetch()} />;

  if (memories.length === 0) {
    return (
      <EmptyState
        icon={<ImageIcon className="w-6 h-6" />}
        title="Chưa có kỷ niệm nào"
        description="Viết nhật ký và thêm ảnh sau mỗi chuyến đi — chúng sẽ hiện ở đây."
        action={
          <Link to="/diary" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            <BookOpen className="w-4 h-4" />
            Viết nhật ký
          </Link>
        }
      />
    );
  }

  return (
    <>
      <ul className="memories-grid">
        {memories.map((memory, index) => (
          <li key={`${memory.trip._id}-${index}`}>
            <button
              type="button"
              className="memories-grid__item"
              onClick={() => setViewing(index)}
              aria-label={`Xem ảnh ${index + 1} — ${memory.trip.title}`}
            >
              <img src={memory.url} alt="" loading="lazy" decoding="async" />
              <span className="memories-grid__caption">{memory.trip.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={current !== null}
        onClose={() => setViewing(null)}
        title={current?.trip.title}
        description={
          current
            ? [getCityName(current.trip.city), formatDate(current.trip.startDate)].filter(Boolean).join(' · ')
            : undefined
        }
        maxWidth="2xl"
      >
        {current && (
          <figure className="memory-viewer">
            <img src={current.url} alt={`Ảnh kỷ niệm chuyến ${current.trip.title}`} className="memory-viewer__img" />
            {memories.length > 1 && (
              <figcaption className="memory-viewer__nav">
                <button type="button" className="memory-viewer__btn" onClick={() => go(-1)} aria-label="Ảnh trước">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span>
                  {(viewing ?? 0) + 1} / {memories.length}
                </span>
                <button type="button" className="memory-viewer__btn" onClick={() => go(1)} aria-label="Ảnh sau">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </figcaption>
            )}
          </figure>
        )}
      </Modal>
    </>
  );
};
