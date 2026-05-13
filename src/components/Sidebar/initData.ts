import Actions from '@/utils/actions';
import type { MenuItem } from './types';

export const initMenus: MenuItem[] = [
  {
    name: 'desk',
    icon: 'icon-desktop',
    path: '/app/desk',
    actions: [Actions.TerminalRODesktopRead],
  },
  {
    name: 'application',
    icon: 'icon-app',
    path: '/app/application',
    actions: [Actions.TerminalROAppRead, Actions.TerminalRORemoteAppRead],
  },
  {
    name: 'peripheral',
    icon: 'icon-USB',
    path: '/app/peripheral',
    actions: [],
  },
  {
    name: 'approval',
    icon: 'icon-done',
    path: '/app/approval',
    actions: [Actions.TerminalROApplyManageRead],
  },
  {
    name: 'malfunction',
    icon: 'icon-fault',
    path: '/app/malfunction',
    actions: [Actions.TerminalROMalfunctionRead],
  },
];
