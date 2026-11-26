import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw, Save, Trash2 } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Textarea } from '../../../components/common/Textarea';
import { ConfirmDialog } from '../../../components/compound/ConfirmDialog';
import { MultiImageUploader } from '../../../components/compound/MultiImageUploader';
import type { TripDiary } from '../../../types/trip';
import { DIARY_MAX_PHOTOS, isDiaryDirty, normalizeDiaryDraft } from '../utils/diaryHelpers';

export interface DiaryEditorProps {
  /** Nội dung nhật ký đã lưu từ backend */
  initialDiary?: Partial<TripDiary> | null;
  /** Tiêu đề hiển thị ở lightbox xem ảnh lớn */
  tripTitle?: string;
  isSaving?: boolean;
  onSave: (data: TripDiary) => Promise<void> | void;
  onDirtyChange?: (dirty: boolean) => void;
}

/**
 * Trình soạn thảo nhật ký chuyến đi:
 * viết cảm nhận, tải lên tối đa 10 ảnh (kéo thả đổi thứ tự / chọn ảnh bìa),
 * xem ảnh phóng to qua lightbox, khôi phục hoặc xóa trắng nhật ký.
 */
export const DiaryEditor: React.FC<DiaryEditorProps> = ({
  initialDiary,
  tripTitle,
  isSaving = false,
  onSave,
  onDirtyChange,
}) => {
  const [prevSaved, setPrevSaved] = useState<TripDiary>(() => normalizeDiaryDraft(initialDiary));
  const [draft, setDraft] = useState<TripDiary>(() => normalizeDiaryDraft(initialDiary));
  const [isUploading, setIsUploading] = useState(false);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Đồng bộ lại bản nháp khi dữ liệu đã lưu từ server thay đổi (chuyển chuyến đi / sau refetch)
  const latestSaved = normalizeDiaryDraft(initialDiary);
  if (isDiaryDirty(latestSaved, prevSaved)) {
    setPrevSaved(latestSaved);
    setDraft(latestSaved);
    setViewingIndex(null);
  }

  const isDirty = isDiaryDirty(draft, latestSaved);
  const hasSavedContent =
    Boolean(latestSaved.notes.trim()) || latestSaved.photos.length > 0;
  const hasAnyContent =
    Boolean(draft.notes.trim()) || draft.photos.length > 0 || hasSavedContent;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const currentPhoto =
    viewingIndex !== null && viewingIndex >= 0 && viewingIndex < draft.photos.length
      ? draft.photos[viewingIndex]
      : null;

  const stepPhoto = (delta: number) => {
    if (draft.photos.length === 0) return;
    setViewingIndex((prev) =>
      prev === null ? null : (prev + delta + draft.photos.length) % draft.photos.length
    );
  };

  useEffect(() => {
    if (viewingIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') stepPhoto(-1);
      if (e.key === 'ArrowRight') stepPhoto(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingIndex, draft.photos.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || isSaving || !isDirty) return;
    await onSave({
      notes: draft.notes,
      photos: draft.photos,
    });
  };

  const handleConfirmClear = async () => {
    setIsClearConfirmOpen(false);
    const cleared: TripDiary = { notes: '', photos: [] };
    if (hasSavedContent) {
      await onSave(cleared);
    } else {
      setDraft(cleared);
    }
  };

  const handleReset = () => {
    setDraft(latestSaved);
    setViewingIndex(null);
  };

  const statusLabel = isUploading
    ? { text: 'Đang tải ảnh lên...', className: 'diary-editor__status--uploading' }
    : isDirty
      ? { text: 'Chưa lưu thay đổi', className: 'diary-editor__status--dirty' }
      : { text: hasSavedContent ? 'Đã lưu' : 'Chưa có nội dung', className: 'diary-editor__status--synced' };

  return (
    <section className="diary-panel" aria-label="Soạn nhật ký chuyến đi">
      <form className="diary-editor" onSubmit={(e) => void handleSubmit(e)}>
        <div className="diary-editor__header">
          <h2 className="diary-editor__heading">
            <BookOpen className="w-5 h-5 text-[#FA8B02]" aria-hidden="true" />
            Ghi chép & Hình ảnh kỷ niệm
          </h2>
          <span className={`diary-editor__status ${statusLabel.className}`}>{statusLabel.text}</span>
        </div>

        <Textarea
          id="diary-notes"
          name="notes"
          label="Cảm nhận & trải nghiệm chuyến đi"
          placeholder="Chia sẻ những khoảnh khắc đáng nhớ, quán ăn tâm đắc, người dân địa phương hoặc kinh nghiệm cho lần sau..."
          rows={7}
          value={draft.notes}
          disabled={isSaving}
          onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
          helperText={`${draft.notes.trim().length} ký tự`}
        />

        <MultiImageUploader
          label="Ảnh kỷ niệm chuyến đi"
          value={draft.photos}
          max={DIARY_MAX_PHOTOS}
          onUploadingChange={setIsUploading}
          onChange={(photos) => setDraft((prev) => ({ ...prev, photos }))}
        />

        {draft.photos.length > 0 && (
          <div className="diary-gallery-preview">
            <span className="diary-gallery-preview__label">
              Bấm vào ảnh để xem kích thước lớn ({draft.photos.length}/{DIARY_MAX_PHOTOS})
            </span>
            <ul className="diary-gallery-preview__grid">
              {draft.photos.map((url, index) => (
                <li key={`${url}-${index}`}>
                  <button
                    type="button"
                    className="diary-gallery-preview__btn"
                    onClick={() => setViewingIndex(index)}
                    aria-label={`Phóng to ảnh ${index + 1}`}
                  >
                    <img src={url} alt={`Ảnh nhật ký ${index + 1}`} loading="lazy" />
                    {index === 0 && <span className="diary-gallery-preview__badge">Ảnh bìa</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="diary-editor__footer">
          {hasAnyContent && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              disabled={isSaving || isUploading}
              onClick={() => setIsClearConfirmOpen(true)}
            >
              Xóa nhật ký
            </Button>
          )}

          <div className="diary-editor__actions">
            {isDirty && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                disabled={isSaving}
                onClick={handleReset}
              >
                Khôi phục
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={isSaving}
              disabled={!isDirty || isUploading}
            >
              Lưu nhật ký
            </Button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={currentPhoto !== null}
        onClose={() => setViewingIndex(null)}
        title={tripTitle || 'Ảnh kỷ niệm'}
        description={
          viewingIndex !== null ? `Ảnh ${viewingIndex + 1} / ${draft.photos.length}` : undefined
        }
        maxWidth="2xl"
      >
        {currentPhoto && (
          <figure className="diary-lightbox">
            <img
              src={currentPhoto}
              alt={`Ảnh kỷ niệm ${(viewingIndex ?? 0) + 1}`}
              className="diary-lightbox__img"
            />
            {draft.photos.length > 1 && (
              <figcaption className="diary-lightbox__nav">
                <button
                  type="button"
                  className="diary-lightbox__nav-btn"
                  onClick={() => stepPhoto(-1)}
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span>
                  {(viewingIndex ?? 0) + 1} / {draft.photos.length}
                </span>
                <button
                  type="button"
                  className="diary-lightbox__nav-btn"
                  onClick={() => stepPhoto(1)}
                  aria-label="Ảnh sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </figcaption>
            )}
          </figure>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={() => void handleConfirmClear()}
        title="Xóa nội dung nhật ký"
        message="Toàn bộ cảm nhận và danh sách ảnh kỷ niệm trong nhật ký của chuyến đi này sẽ bị xóa trắng. Bạn có chắc muốn tiếp tục?"
        confirmText="Xóa nhật ký"
        variant="danger"
        isLoading={isSaving}
      />
    </section>
  );
};

