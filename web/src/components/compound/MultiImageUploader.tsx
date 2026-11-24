import React, { useEffect, useId, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { GripVertical, ImagePlus, Star, X } from 'lucide-react';
import { IMAGE_ACCEPT, validateImageFile } from '../../config/upload';
import { useToast } from '../../contexts/toast/ToastContext';
import { uploadService } from '../../services/uploadService';
import { cn } from '../../utils/cn';
import './css/MultiImageUploader.css';

export interface MultiImageUploaderProps {
  /** URL ảnh đã tải lên, theo thứ tự hiển thị — ảnh đầu là ảnh đại diện */
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  /** Số ảnh tối đa (tính cả ảnh đang tải) */
  max?: number;
  /** Báo cho form biết đang có ảnh tải dở → khóa nút lưu */
  onUploadingChange?: (uploading: boolean) => void;
  error?: string;
}

interface PendingUpload {
  id: string;
  preview: string;
  progress: number;
}

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/**
 * Tải nhiều ảnh song song (hiện tiến độ từng ảnh), kéo thả để sắp xếp, ảnh đầu tiên là ảnh bìa.
 * Bàn phím: Tab tới ảnh → Space để nhấc, mũi tên để di chuyển, Space để thả (của @hello-pangea/dnd);
 * hoặc dùng nút "Đặt làm ảnh bìa".
 */
export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  value,
  onChange,
  label = 'Hình ảnh',
  max = 10,
  onUploadingChange,
  error,
}) => {
  const toast = useToast();
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Ảnh tải xong được nối vào cuối danh sách mới nhất (không dùng `value` cũ trong closure)
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    onUploadingChange?.(pending.length > 0);
  }, [pending.length, onUploadingChange]);

  // Giải phóng URL xem trước khi rời trang giữa chừng
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  const remaining = max - value.length - pending.length;

  const uploadFiles = (files: File[]) => {
    if (!files.length) return;
    if (remaining <= 0) {
      toast.warning(`Tối đa ${max} ảnh`);
      return;
    }
    const accepted = files.slice(0, remaining);
    if (files.length > accepted.length) toast.warning(`Chỉ thêm được ${remaining} ảnh nữa (tối đa ${max})`);

    accepted.forEach((file) => {
      const invalid = validateImageFile(file);
      if (invalid) {
        toast.error(invalid, { description: file.name });
        return;
      }
      const item: PendingUpload = { id: `${Date.now()}-${Math.random()}`, preview: URL.createObjectURL(file), progress: 0 };
      setPending((list) => [...list, item]);

      uploadService
        .uploadImage(file, (progress) =>
          setPending((list) => list.map((p) => (p.id === item.id ? { ...p, progress } : p)))
        )
        .then((res) => {
          // Cập nhật ref ngay: hai ảnh xong gần như cùng lúc không ghi đè lẫn nhau
          valueRef.current = [...valueRef.current, res.url];
          onChange(valueRef.current);
        })
        .catch((err: unknown) =>
          toast.error('Tải ảnh thất bại', { description: `${file.name}: ${err instanceof Error ? err.message : ''}` })
        )
        .finally(() => {
          URL.revokeObjectURL(item.preview);
          setPending((list) => list.filter((p) => p.id !== item.id));
        });
    });
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  };

  const onDragEnd = ({ source, destination }: DropResult) => {
    if (!destination || destination.index === source.index) return;
    onChange(move(value, source.index, destination.index));
  };

  return (
    <div className="ui-multi-upload">
      <div className="ui-multi-upload__head">
        <span className="ui-input-label" id={`${inputId}-label`}>
          {label}
        </span>
        <span className="ui-multi-upload__count">
          {value.length}/{max}
        </span>
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onFileInput}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`${inputId}-images`} direction="horizontal">
          {(drop) => (
            <ul
              ref={drop.innerRef}
              {...drop.droppableProps}
              className="ui-multi-upload__list"
              aria-labelledby={`${inputId}-label`}
            >
              {value.map((url, index) => (
                <Draggable key={url} draggableId={url} index={index}>
                  {(drag, snapshot) => (
                    <li
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={cn('ui-multi-upload__tile', snapshot.isDragging && 'ui-multi-upload__tile--dragging')}
                    >
                      <img src={url} alt={`Ảnh ${index + 1}`} />
                      <span
                        {...drag.dragHandleProps}
                        className="ui-multi-upload__handle"
                        aria-label={`Kéo để sắp xếp ảnh ${index + 1}`}
                        title="Kéo để sắp xếp"
                      >
                        <GripVertical aria-hidden="true" />
                      </span>
                      {index === 0 ? (
                        <span className="ui-multi-upload__cover">Ảnh bìa</span>
                      ) : (
                        <button
                          type="button"
                          className="ui-multi-upload__btn ui-multi-upload__btn--cover"
                          onClick={() => onChange(move(value, index, 0))}
                          aria-label={`Đặt ảnh ${index + 1} làm ảnh bìa`}
                          title="Đặt làm ảnh bìa"
                        >
                          <Star aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="ui-multi-upload__btn ui-multi-upload__btn--remove"
                        onClick={() => onChange(value.filter((_, i) => i !== index))}
                        aria-label={`Xóa ảnh ${index + 1}`}
                        title="Xóa ảnh"
                      >
                        <X aria-hidden="true" />
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {drop.placeholder}

              {pending.map((p) => (
                <li key={p.id} className="ui-multi-upload__tile ui-multi-upload__tile--pending" aria-busy="true">
                  <img src={p.preview} alt="" />
                  <span className="ui-multi-upload__progress" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Đang tải ảnh">
                    <span style={{ width: `${p.progress}%` }} />
                  </span>
                </li>
              ))}

              {remaining > 0 && (
                <li>
                  <button
                    type="button"
                    className={cn('ui-multi-upload__add', isDragOver && 'ui-multi-upload__add--over')}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      uploadFiles(Array.from(e.dataTransfer.files));
                    }}
                  >
                    <ImagePlus aria-hidden="true" />
                    <span>Thêm ảnh</span>
                  </button>
                </li>
              )}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <p className={error ? 'ui-input-message--error' : 'ui-input-message--helper'}>
        {error ?? 'PNG, JPG, WEBP tối đa 5MB · Kéo ảnh để sắp xếp, ảnh đầu tiên là ảnh bìa'}
      </p>
    </div>
  );
};
