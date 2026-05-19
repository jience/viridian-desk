import './message.scss';

const normalizeContent = (content: any) =>
  typeof content === 'object' && content?.content ? content.content : content;

const toast = (type: string, content: any) => {
  const container = document.createElement('div');
  container.className = `vd-toast vd-toast--${type}`;
  container.textContent = String(normalizeContent(content) ?? '');
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
