import React from 'react';
import { Link, useLocation, type LinkProps } from 'react-router-dom';
import type { AuthModalState } from '../authPaths';

type OpenAuthLinkProps = Omit<LinkProps, 'state'>;

/** Link mở popup Đăng nhập / Đăng ký, giữ trang hiện tại làm nền phía sau */
export const OpenAuthLink: React.FC<OpenAuthLinkProps> = (props) => {
  const location = useLocation();
  const state: AuthModalState = { backgroundLocation: location };
  return <Link {...props} state={state} />;
};
