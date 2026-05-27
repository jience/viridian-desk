import './message.scss';

const normalizeContent = (content: any) =>
  typeof content === 'object' && content?.content ? content.content : content;

const toastIcons: Record<string, string> = {
  success: '✓',
  error: '×',
  warning: '!',
  info: 'i',
  loading: '',
};

const toast = (type: string, content: any) => {
  const activeCount = document.querySelectorAll('.vd-toast:not(.vd-toast--leaving)').length;
  const container = document.createElement('div');
  container.className = `vd-toast vd-toast--${type}`;
  container.style.setProperty('--vd-toast-index', String(activeCount));
  container.setAttribute('role', type === 'error' ? 'alert' : 'status');
  container.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  const icon = document.createElement('span');
  icon.className = 'vd-toast__icon';
  icon.setAttribute('aria-hidden', 'true');
  if (type !== 'loading') {
    icon.textContent = toastIcons[type] ?? toastIcons.info;
  }

  const contentNode = document.createElement('span');
  contentNode.className = 'vd-toast__content';
  contentNode.textContent = String(normalizeContent(content) ?? '');

  container.append(icon, contentNode);
  document.body.appendChild(container);
  window.setTimeout(() => {
    container.classList.add('vd-toast--leaving');
    window.setTimeout(() => container.remove(), 180);
  }, 2600);
  return { destroy: () => container.remove() };
};

export const message = {
  success: (content: any) => toast('success', content),
  error: (content: any) => toast('error', content),
  warning: (content: any) => toast('warning', content),
  info: (content: any) => toast('info', content),
  loading: (content: any) => toast('loading', content),
  destroy: () => document.querySelectorAll('.vd-toast').forEach((node) => node.remove()),
};
