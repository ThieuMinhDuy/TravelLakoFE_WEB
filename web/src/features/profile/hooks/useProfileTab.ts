import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const PROFILE_TABS = ['trips', 'favorites', 'reviews', 'memories', 'settings'] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

const DEFAULT_TAB: ProfileTab = 'trips';

export const isProfileTab = (value: unknown): value is ProfileTab =>
  typeof value === 'string' && (PROFILE_TABS as readonly string[]).includes(value);

/**
 * Tab đang mở của trang Hồ sơ, đồng bộ với URL (`/profile?tab=favorites`):
 * tải lại trang hoặc chia sẻ link vẫn mở đúng tab. Giá trị lạ → tab mặc định.
 */
export function useProfileTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get('tab');
  const tab: ProfileTab = isProfileTab(raw) ? raw : DEFAULT_TAB;

  const setTab = useCallback(
    (next: string) => {
      if (!isProfileTab(next)) return;
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === DEFAULT_TAB) params.delete('tab');
          else params.set('tab', next);
          return params;
        },
        // Đổi tab không tạo thêm mục lịch sử → nút Back rời trang Hồ sơ như mong đợi
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return [tab, setTab] as const;
}
