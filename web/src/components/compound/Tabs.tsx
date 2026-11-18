import React, { useCallback, useId, useMemo, useState } from 'react';
import { cn } from '../../utils/cn';
import { TabsContext, panelId, tabId, useTabsContext, type TabsContextValue } from './TabsContext';
import './css/Tabs.css';

/* -------------------------------------------------------------------------- */
/*  <Tabs> — gốc, giữ trạng thái tab đang chọn (controlled hoặc uncontrolled)  */
/* -------------------------------------------------------------------------- */

export interface TabsProps {
  /** Controlled: tab đang chọn */
  value?: string;
  /** Uncontrolled: tab chọn ban đầu */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsContextValue['variant'];
  className?: string;
  children: React.ReactNode;
}

const TabsRoot: React.FC<TabsProps> = ({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  variant = 'underline',
  className,
  children,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;
  const baseId = useId();

  const select = useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange]
  );

  const context = useMemo(() => ({ value, select, baseId, variant }), [value, select, baseId, variant]);

  return (
    <TabsContext.Provider value={context}>
      <div className={cn('ui-tabs', `ui-tabs--${variant}`, className)}>{children}</div>
    </TabsContext.Provider>
  );
};

/* -------------------------------------------------------------------------- */
/*  <Tabs.List> — thanh chứa các tab, xử lý phím mũi tên                       */
/* -------------------------------------------------------------------------- */

export interface TabsListProps {
  /** Mô tả nhóm tab cho trình đọc màn hình (vd: "Trạng thái chuyến đi") */
  'aria-label': string;
  className?: string;
  children: React.ReactNode;
}

const TabsList: React.FC<TabsListProps> = ({ className, children, ...props }) => {
  useTabsContext('Tabs.List');

  // ←/→ chuyển tab kế bên, Home/End về đầu/cuối (tự kích hoạt tab được focus)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(e.key)) return;

    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
    );
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (tabs.length === 0 || current === -1) return;

    e.preventDefault();
    const nextIndex =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? tabs.length - 1
          : (current + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;

    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  return (
    <div
      role="tablist"
      aria-label={props['aria-label']}
      className={cn('ui-tabs__list', className)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  <Tabs.Tab>                                                                 */
/* -------------------------------------------------------------------------- */

export interface TabProps {
  value: string;
  disabled?: boolean;
  /** Nội dung phụ bên phải nhãn (vd: số lượng) */
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const Tab: React.FC<TabProps> = ({ value, disabled = false, badge, className, children }) => {
  const { value: selected, select, baseId } = useTabsContext('Tabs.Tab');
  const isSelected = selected === value;

  return (
    <button
      type="button"
      role="tab"
      id={tabId(baseId, value)}
      aria-selected={isSelected}
      aria-controls={panelId(baseId, value)}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => select(value)}
      className={cn('ui-tabs__tab', isSelected && 'ui-tabs__tab--active', className)}
    >
      {children}
      {badge !== undefined && <span className="ui-tabs__badge">{badge}</span>}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/*  <Tabs.Panel> — chỉ render nội dung của tab đang chọn                        */
/* -------------------------------------------------------------------------- */

export interface TabPanelProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ value, className, children }) => {
  const { value: selected, baseId } = useTabsContext('Tabs.Panel');
  if (selected !== value) return null;

  return (
    <div
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      tabIndex={0}
      className={cn('ui-tabs__panel', className)}
    >
      {children}
    </div>
  );
};

/**
 * Compound Component — các phần chia sẻ trạng thái qua Context:
 *
 * @example
 * <Tabs defaultValue="upcoming">
 *   <Tabs.List aria-label="Trạng thái chuyến đi">
 *     <Tabs.Tab value="upcoming" badge={3}>Sắp đi</Tabs.Tab>
 *     <Tabs.Tab value="ongoing">Đang đi</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel value="upcoming">...</Tabs.Panel>
 *   <Tabs.Panel value="ongoing">...</Tabs.Panel>
 * </Tabs>
 */
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab,
  Panel: TabPanel,
});
