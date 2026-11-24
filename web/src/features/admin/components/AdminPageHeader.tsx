import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  description?: React.ReactNode;
  /** Nút hành động chính bên phải (Thêm mới...) */
  actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, description, actions }) => (
  <header className="admin-page__header">
    <div>
      <h1 className="admin-page__title">{title}</h1>
      {description && <p className="admin-page__subtitle">{description}</p>}
    </div>
    {actions && <div className="admin-page__actions">{actions}</div>}
  </header>
);
