export type AccountWorkbenchView = 'overview' | 'password' | 'phone';

export type PasswordFields = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export type PhoneFields = {
  phone?: string;
  verifyCode?: string;
};
