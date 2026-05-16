export type MenuLabelKey =
  | 'navigation.desktop'
  | 'navigation.application'
  | 'navigation.peripheral'
  | 'navigation.approval'
  | 'navigation.desktopIssues';

export interface MenuItem {
  name: string;
  labelKey: MenuLabelKey;
  icon: string;
  path: string;
  actions: string[];
}
