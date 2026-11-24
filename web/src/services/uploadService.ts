import { apiClient } from './apiClient';

export interface UploadResponse {
  message: string;
  url: string;
}

export const uploadService = {
  /**
   * Tải ảnh đơn lẻ lên máy chủ (Cloudinary / Local) qua POST /api/upload
   * Key form-data: 'image'
   */
  uploadImage: async (file: File, onProgress?: (percent: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Ảnh lớn qua mạng chậm có thể vượt timeout mặc định 30 giây
      timeout: 120_000,
      onUploadProgress: onProgress
        ? (e) => onProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 0)
        : undefined,
    });
    return res.data;
  },
};
