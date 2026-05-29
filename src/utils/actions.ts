export default {
  // 应用
  TerminalRWApplyManageCreateOrCancel: 'Terminal::RW::ApplyManage::CreateOrCancel',
  TerminalROApplyManageRead: 'Terminal::RO::ApplyManage::Read',

  //快照
  TerminalROSnapshotRead: 'Terminal::RO::Snapshot::Read',
  TerminalRWSnapshotCreateOrDelete: 'Terminal::RW::Snapshot::CreateOrDelete',
  TerminalRWSnapshotRollback: 'Terminal::RW::Snapshot::Rollback',

  //应用
  TerminalROAppRead: 'Terminal::RO::App::Read',
  TerminalRWAppAddPrepare: 'Terminal::RW::App::AddPrepare',
  TerminalRWAppAddCustom: 'Terminal::RW::App::AddCustom',
  TerminalRWAppCreateShortcut: 'Terminal::RW::App::CreateShortcut',
  TerminalRWAppDelete: 'Terminal::RW::App::Delete',
  TerminalRORemoteAppRead: 'Terminal::RO::RemoteApp::Read',

  // 用户
  TerminalROUserRead: 'Terminal::RO::User::Read',
  TerminalRWUserLoginOrLogout: 'Terminal::RW::User::LoginOrLogout',
  TerminalRWUserUpdatePassword: 'Terminal::RW::User::UpdatePassword',
  TerminalRWUserUpdatePhone: 'Terminal::RW::User::UpdatePhone',

  // 桌面
  TerminalRODesktopRead: 'Terminal::RO::Desktop::Read',
  TerminalRWDesktopSetOrUnsetDefault: 'Terminal::RW::Desktop::SetOrUnsetDefault',
  TerminalRWDesktopForceReboot: 'Terminal::RW::Desktop::ForceReboot',
  TerminalRWDesktopShutdown: 'Terminal::RW::Desktop::Shutdown',

  // 工单
  TerminalROMalfunctionRead: 'Terminal::RO::Malfunction::Read',
  TerminalRWMalfunctionReport: 'Terminal::RW::Malfunction::Report',
  TerminalRWMalfunctionCancel: 'Terminal::RW::Malfunction::Cancel',
};
