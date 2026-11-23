import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Lock, RefreshCw, Search, ShieldCheck, ShieldOff, Trash2, Unlock, UserX } from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useDebounce } from '../../../hooks/useDebounce';
import { useLocale } from '../../../contexts/locale/LocaleContext';
import { useAuthStore } from '../../../store/useAuthStore';
import { Avatar } from '../../../components/common/Avatar';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { StatusView } from '../../../components/common/StatusView';
import { DataTable, type Column } from '../../../components/compound/DataTable';
import { SegmentedControl } from '../../../components/glass';
import type { AdminUser } from '../../../types/admin';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { UserActionDialog, type UserAction, type UserActionKind } from '../components/users/UserActionDialog';
import { UserDetailDrawer } from '../components/users/UserDetailDrawer';
import { useAdminUsers } from '../hooks/useAdminQueries';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { adminErrorMessage } from '../utils/adminErrors';
import {
  countUserGroups,
  filterUsers,
  type UserAuthFilter,
  type UserFilterValues,
  type UserGroup,
} from '../utils/userFilters';
import './css/AdminPages.css';
import './css/AdminUsers.css';

const DEFAULT_FILTERS: UserFilterValues = { q: '', group: 'all', auth: 'all' };

const GROUP_LABELS: Record<UserGroup, string> = {
  all: 'Tất cả',
  admin: 'Quản trị viên',
  customer: 'Khách hàng',
  blocked: 'Đã khóa',
  unverified: 'Chưa xác thực',
};

const AUTH_OPTIONS: { value: UserAuthFilter; label: string }[] = [
  { value: 'all', label: 'Mọi cách đăng nhập' },
  { value: 'local', label: 'Email & mật khẩu' },
  { value: 'google', label: 'Google' },
];

const SELF_HINT = 'Không thể thao tác trên tài khoản của chính bạn';

export const AdminUsersPage: React.FC = () => {
  useDocumentTitle('Quản lý người dùng');
  const { formatDate } = useLocale();
  const currentUserId = useAuthStore((s) => s.user?._id);
  const usersQuery = useAdminUsers();

  const { filters, setFilters, resetFilters, isFiltered } = useUrlFilters(DEFAULT_FILTERS);
  const group = (filters.group in GROUP_LABELS ? filters.group : 'all') as UserGroup;
  const auth = (['all', 'local', 'google'].includes(filters.auth) ? filters.auth : 'all') as UserAuthFilter;

  // Ô tìm kiếm phản hồi ngay, còn URL + lọc dữ liệu chờ người dùng gõ xong
  const [searchInput, setSearchInput] = useState(filters.q);
  const debouncedSearch = useDebounce(searchInput, 250);
  const lastSyncedSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (debouncedSearch === lastSyncedSearch.current) return;
    lastSyncedSearch.current = debouncedSearch;
    setFilters({ q: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [action, setAction] = useState<UserAction | null>(null);

  const users = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data]);
  const counts = useMemo(() => countUserGroups(users), [users]);
  const visibleUsers = useMemo(
    () => filterUsers(users, { q: debouncedSearch, group, auth }),
    [users, debouncedSearch, group, auth]
  );
  // Lấy từ danh sách mới nhất → drawer tự cập nhật sau khi khóa / sửa
  const detailUser = users.find((u) => u._id === detailId) ?? null;

  const openDetail = (user: AdminUser) => {
    setDetailId(user._id);
    setDetailOpen(true);
  };
  const runAction = (kind: UserActionKind, user: AdminUser) => setAction({ kind, user });

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'Người dùng',
      render: (u) => (
        <button type="button" className="admin-user-cell" onClick={() => openDetail(u)}>
          <Avatar src={u.avatar} name={u.name} size="sm" />
          <span className="admin-user-cell__text">
            <span className="admin-user-cell__name">
              {u.name}
              {u._id === currentUserId && <span className="admin-user-cell__self">Bạn</span>}
            </span>
            <span className="admin-user-cell__email">{u.email}</span>
          </span>
        </button>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (u) =>
        u.isAdmin ? (
          <Badge variant="primary" size="sm">
            Quản trị viên
          </Badge>
        ) : (
          <span className="admin-muted">Khách hàng</span>
        ),
    },
    {
      key: 'auth',
      header: 'Đăng nhập',
      className: 'hidden md:table-cell',
      render: (u) => (
        <span className="admin-user-auth">
          {u.authType === 'google' ? 'Google' : 'Email'}
          {!u.isVerified && (
            <Badge variant="warning" size="sm">
              Chưa xác thực
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (u) =>
        u.isBlocked ? (
          <Badge variant="danger" size="sm">
            Đã khóa
          </Badge>
        ) : (
          <span className="admin-status-dot">Hoạt động</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tham gia',
      className: 'hidden lg:table-cell',
      render: (u) => <span className="admin-muted">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'admin-col-actions',
      render: (u) => {
        const self = u._id === currentUserId;
        return (
          <div className="admin-row-actions">
            <IconAction label="Xem chi tiết" onClick={() => openDetail(u)}>
              <Eye />
            </IconAction>
            <IconAction
              label={self ? SELF_HINT : u.isBlocked ? 'Mở khóa' : 'Khóa tài khoản'}
              disabled={self}
              onClick={() => runAction(u.isBlocked ? 'unblock' : 'block', u)}
            >
              {u.isBlocked ? <Unlock /> : <Lock />}
            </IconAction>
            <IconAction
              label={self ? SELF_HINT : u.isAdmin ? 'Gỡ quyền Admin' : 'Cấp quyền Admin'}
              disabled={self}
              onClick={() => runAction(u.isAdmin ? 'revoke' : 'grant', u)}
            >
              {u.isAdmin ? <ShieldOff /> : <ShieldCheck />}
            </IconAction>
            <IconAction label={self ? SELF_HINT : 'Xóa tài khoản'} danger disabled={self} onClick={() => runAction('delete', u)}>
              <Trash2 />
            </IconAction>
          </div>
        );
      },
    },
  ];

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Người dùng"
        description={
          usersQuery.data
            ? `${usersQuery.data.total} tài khoản · ${counts.admin} quản trị viên · ${counts.blocked} đang bị khóa`
            : 'Quản lý tài khoản, phân quyền và khóa tài khoản vi phạm'
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={usersQuery.isFetching ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
            onClick={() => usersQuery.refetch()}
            disabled={usersQuery.isFetching}
          >
            Làm mới
          </Button>
        }
      />

      {usersQuery.isError ? (
        <div className="glass glass--thick admin-panel">
          <StatusView
            icon={<UserX className="w-7 h-7" />}
            title="Không tải được danh sách người dùng"
            description={adminErrorMessage(usersQuery.error)}
            actions={<Button onClick={() => usersQuery.refetch()}>Thử lại</Button>}
          />
        </div>
      ) : (
        <>
          <div className="glass admin-toolbar">
            <label className="admin-search">
              <Search aria-hidden="true" />
              <span className="sr-only">Tìm người dùng</span>
              <input
                type="search"
                placeholder="Tìm theo tên hoặc email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </label>
            <SegmentedControl
              ariaLabel="Lọc theo nhóm"
              value={group}
              onChange={(value) => setFilters({ group: value })}
              options={(Object.keys(GROUP_LABELS) as UserGroup[]).map((g) => ({
                value: g,
                label: GROUP_LABELS[g],
                count: usersQuery.data ? counts[g] : undefined,
              }))}
            />
            <div className="admin-toolbar__select">
              <Select
                aria-label="Lọc theo cách đăng nhập"
                value={auth}
                onChange={(e) => setFilters({ auth: e.target.value as UserAuthFilter })}
                options={AUTH_OPTIONS}
              />
            </div>
          </div>

          <DataTable<AdminUser>
            // Đổi bộ lọc → về trang 1
            key={`${debouncedSearch}|${group}|${auth}`}
            columns={columns}
            data={visibleUsers}
            isLoading={usersQuery.isLoading}
            searchable={false}
            pageSize={10}
            emptyTitle={isFiltered ? 'Không có người dùng phù hợp' : 'Chưa có người dùng'}
            emptyDescription={isFiltered ? 'Thử đổi từ khóa hoặc bộ lọc khác.' : undefined}
          />
          {isFiltered && !usersQuery.isLoading && (
            <p className="admin-result-note">
              Hiển thị {visibleUsers.length} / {users.length} người dùng ·{' '}
              <button
                type="button"
                className="admin-link-btn"
                onClick={() => {
                  setSearchInput('');
                  resetFilters();
                }}
              >
                Xóa bộ lọc
              </button>
            </p>
          )}
        </>
      )}

      <UserDetailDrawer
        user={detailUser}
        open={detailOpen && !!detailUser}
        onClose={() => setDetailOpen(false)}
        isSelf={detailUser?._id === currentUserId}
        onAction={(kind) => detailUser && runAction(kind, detailUser)}
      />

      <UserActionDialog
        action={action}
        onClose={() => setAction(null)}
        onDeleted={(id) => {
          if (id === detailId) setDetailOpen(false);
        }}
      />
    </div>
  );
};

interface IconActionProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}

/** Nút icon trong cột thao tác; nhãn dùng cho cả tooltip lẫn trình đọc màn hình */
const IconAction: React.FC<IconActionProps> = ({ label, onClick, disabled, danger, children }) => (
  <button
    type="button"
    className={danger ? 'admin-icon-btn admin-icon-btn--danger' : 'admin-icon-btn'}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
  >
    {children}
  </button>
);
