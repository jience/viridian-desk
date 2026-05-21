export const copyText = async (text: string) => {
  const value = text ?? '';

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '0';

  const selection = document.getSelection();
  const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const copied = document.execCommand('copy');
    if (!copied) {
      throw new Error('Clipboard copy failed');
    }
  } finally {
    document.body.removeChild(textArea);
    if (selectedRange && selection) {
      selection.removeAllRanges();
      selection.addRange(selectedRange);
    }
  }
};
