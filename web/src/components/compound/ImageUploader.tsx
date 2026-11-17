import React, { useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { uploadService } from '../../services/uploadService';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WEBP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadService.uploadImage(file);
      onChange(res.url);
      toast.success('Tải ảnh lên thành công!');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Tải ảnh thất bại!';
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const aspectClass = `ui-image-uploader__aspect--${aspectRatio}`;

  return (
    <div className={cn('ui-image-uploader', className)}>
      {label && <label className="ui-image-uploader__label">{label}</label>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div
          className={cn(
            'ui-image-uploader__preview',
            aspectClass
          )}
        >
          <img src={value} alt="Uploaded" className="ui-image-uploader__preview-img" />
          <div className="ui-image-uploader__preview-overlay">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-surfaceWhite text-slate-800 text-xs font-semibold hover:bg-slate-100"
            >
              Thay đổi
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            'ui-image-uploader__dropzone',
            aspectClass
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-oceanBlue">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-medium">Đang tải ảnh lên...</span>
            </div>
          ) : (
            <>
              <div className="ui-image-uploader__icon-box">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Nhấn để chọn ảnh hoặc kéo thả</p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP (Tối đa 5MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
