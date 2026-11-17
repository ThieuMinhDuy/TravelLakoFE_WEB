import React, { useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { uploadService } from '../../services/uploadService';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}

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
            'relative rounded-2xl overflow-hidden border border-borderGray group bg-slate-100',
            aspectClasses[aspectRatio]
          )}
        >
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
            'rounded-2xl border-2 border-dashed border-borderGray bg-slate-50/60 hover:bg-slate-100/60 transition-colors cursor-pointer flex flex-col items-center justify-center p-6 text-center',
            aspectClasses[aspectRatio]
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-oceanBlue">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-medium">Đang tải ảnh lên...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-500 mb-2">
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
