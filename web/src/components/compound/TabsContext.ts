import { createContext, useContext } from 'react';

export interface TabsContextValue {
  value: string;
  select: (value: string) => void;
  /** Tiền tố id để nối tab ↔ panel qua aria-controls / aria-labelledby */
  baseId: string;
  variant: 'underline' | 'pills';
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) throw new Error(`<${component}> phải nằm bên trong <Tabs>`);
  return context;
}

export const tabId = (baseId: string, value: string) => `${baseId}-tab-${value}`;
export const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`;
