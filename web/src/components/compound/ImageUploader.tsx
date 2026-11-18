import React, { useId, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { uploadService } from '../../services/uploadService';
import { IMAGE_ACCEPT, validateImageFile } from '../../config/upload';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/toast/ToastContext';
import './css/ImageUploader.css';

export interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Tải ảnh lên',
  aspectRatio = 'video',
  className,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

  const uploadFile = async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadService.uploadImage(file);
      onChange(res.url);
      toast.success('Tải ảnh lên thành công!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Tải ảnh thất bại!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng một file
    if (file) void uploadFile(file);
  };

  const openPicker = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  // Kéo & thả ảnh vào vùng chọn
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // bắt buộc để sự kiện drop được kích hoạt
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Bỏ qua khi con trỏ chỉ di chuyển giữa các phần tử con bên trong
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const aspectClass = `ui-image-uploader__aspect--${aspectRatio}`;

  return (
    <div className={cn('ui-image-uploader', className)}>
      {label && (
        <span id={labelId} className="ui-image-uploader__label">
          {label}
        </span>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={handleFileChange}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      {value ? (
        <div className={cn('ui-image-uploader__preview', aspectClass)}>
          <img src={value} alt={label || 'Ảnh đã tải lên'} className="ui-image-uploader__preview-img" />
          <div className="ui-image-uploader__preview-overlay">
            <button
              type="button"
              onClick={openPicker}
              className="px-3 py-1.5 rounded-lg bg-surfaceWhite text-slate-800 text-xs font-semibold hover:bg-slate-100"
            >
              Thay đổi
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
              aria-label="Xóa ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isUploading}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={`${labelId}-hint`}
          className={cn(
            'ui-image-uploader__dropzone',
            aspectClass,
            isDragging && 'ui-image-uploader__dropzone--dragging'
          )}
        >
          {isUploading ? (
            <span className="flex flex-col items-center gap-2 text-oceanBlue">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-medium">Đang tải ảnh lên...</span>
            </span>
          ) : (
            <>
              <span className="ui-image-uploader__icon-box">
                <UploadCloud className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {isDragging ? 'Thả ảnh vào đây' : 'Nhấn để chọn ảnh hoặc kéo thả'}
              </span>
              <span id={`${labelId}-hint`} className="text-[11px] text-slate-400 mt-1">
                PNG, JPG, WEBP (Tối đa 5MB)
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
