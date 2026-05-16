import Actions from '@/utils/actions';
import type { MenuItem } from './types';

export const initMenus: MenuItem[] = [
  {
    name: 'desk',
    labelKey: 'navigation.desktop',
    icon: 'icon-desktop',
    path: '/app/desk',
    actions: [Actions.TerminalRODesktopRead],
  },
  {
    name: 'application',
    labelKey: 'navigation.application',
    icon: 'icon-app',
    path: '/app/application',
    actions: [Actions.TerminalROAppRead, Actions.TerminalRORemoteAppRead],
  },
  {
    name: 'peripheral',
    labelKey: 'navigation.peripheral',
    icon: 'icon-USB',
    path: '/app/peripheral',
    actions: [],
  },
  {
    name: 'approval',
    labelKey: 'navigation.approval',
    icon: 'icon-done',
    path: '/app/approval',
    actions: [Actions.TerminalROApplyManageRead],
  },
  {
    name: 'malfunction',
    labelKey: 'navigation.desktopIssues',
    icon: 'icon-fault',
    path: '/app/malfunction',
    actions: [Actions.TerminalROMalfunctionRead],
  },
];
