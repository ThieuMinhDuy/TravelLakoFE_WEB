import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Heart, ImageIcon, Settings } from 'lucide-react';
import { Tabs } from '../../../components/compound/Tabs';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { queryKeys } from '../../../lib/queryKeys';
import { useAuthStore } from '../../../store/useAuthStore';
import { countTrips } from '../../../utils/trip';
import { authService } from '../../auth/services/authService';
import { ProfileHeader } from '../components/ProfileHeader';
import { FavoritesTab } from '../components/tabs/FavoritesTab';
import { MemoriesTab } from '../components/tabs/MemoriesTab';
import { SettingsTab } from '../components/tabs/SettingsTab';
import { TripsTab } from '../components/tabs/TripsTab';
import { PlanWithAiBanner } from '../components/sections/PlanWithAiBanner';
import { PopularCitiesSection } from '../components/sections/PopularCitiesSection';
import { RecommendedSection } from '../components/sections/RecommendedSection';
import { useMyFavorites, useMyTrips } from '../hooks/useProfileData';
import { useProfileTab, type ProfileTab } from '../hooks/useProfileTab';
import './css/ProfilePage.css';

const TAB_LABELS: Record<ProfileTab, string> = {
  trips: 'Chuyến đi',
  favorites: 'Yêu thích',
  memories: 'Kỷ niệm',
  settings: 'Cài đặt tài khoản',
};

export const ProfilePage: React.FC = () => {
  const [tab, setTab] = useProfileTab();
  useDocumentTitle(`${TAB_LABELS[tab]} · Hồ sơ cá nhân`);

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  // Luôn lấy profile mới nhất (kèm thống kê) khi vào trang
  const profileQuery = useQuery({ queryKey: queryKeys.profile, queryFn: authService.getProfile });
  useEffect(() => {
    if (profileQuery.data) updateUser(profileQuery.data);
  }, [profileQuery.data, updateUser]);

  const trips = useMyTrips();
  const favorites = useMyFavorites();

  if (!user) return null; // ProtectedRoute đảm bảo đã đăng nhập

  // Ưu tiên số liệu từ dữ liệu đã tải (cập nhật ngay sau khi bỏ yêu thích), fallback về user.stats
  const stats = {
    trips: trips.data ? countTrips(trips.data) : (user.stats?.trips ?? 0),
    favorites: favorites.data ? favorites.data.favorites.length : (user.stats?.favorites ?? 0),
    reviews: user.stats?.reviews ?? 0,
  };

  return (
    <div className="profile-page">
      <ProfileHeader user={user} stats={stats} onEditProfile={() => setTab('settings')} />

      <Tabs value={tab} onValueChange={setTab} variant="pills" className="profile-tabs">
        <Tabs.List aria-label="Mục trong hồ sơ">
          <Tabs.Tab value="trips" badge={stats.trips}>
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
            Chuyến đi
          </Tabs.Tab>
          <Tabs.Tab value="favorites" badge={stats.favorites}>
            <Heart className="w-4 h-4" aria-hidden="true" />
            Yêu thích
          </Tabs.Tab>
          <Tabs.Tab value="memories">
            <ImageIcon className="w-4 h-4" aria-hidden="true" />
            Kỷ niệm
          </Tabs.Tab>
          <Tabs.Tab value="settings">
            <Settings className="w-4 h-4" aria-hidden="true" />
            <span>
              Cài đặt<span className="profile-tabs__long-label"> tài khoản</span>
            </span>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="trips">
          <TripsTab />
        </Tabs.Panel>
        <Tabs.Panel value="favorites">
          <FavoritesTab />
        </Tabs.Panel>
        <Tabs.Panel value="memories">
          <MemoriesTab />
        </Tabs.Panel>
        <Tabs.Panel value="settings">
          <SettingsTab user={user} />
        </Tabs.Panel>
      </Tabs>

      {/* Khối khám phá — ẩn ở tab Cài đặt cho gọn */}
      {tab !== 'settings' && (
        <>
          <RecommendedSection user={user} onSetPreferences={() => setTab('settings')} />
          <PopularCitiesSection />
          <PlanWithAiBanner />
        </>
      )}
    </div>
  );
};
