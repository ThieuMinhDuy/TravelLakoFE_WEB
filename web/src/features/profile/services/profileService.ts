import { apiClient } from '../../../services/apiClient';
import type { UpdateProfileDTO, User } from '../../../types/user';

export const profileService = {
  /** PUT /auth/profile — trả về thông tin user sau khi cập nhật (không kèm stats) */
  updateProfile: async (data: UpdateProfileDTO): Promise<User> => {
    const res = await apiClient.put<User>('/auth/profile', data);
    return res.data;
  },
};
