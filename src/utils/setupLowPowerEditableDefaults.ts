const editableSelector = 'input, textarea';

const applyEditableDefaults = (element: Element) => {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return;

  element.setAttribute('spellcheck', 'false');
  element.setAttribute('autocorrect', 'off');
  element.setAttribute('autocapitalize', 'none');
};

const applyEditableDefaultsIn = (root: ParentNode) => {
  if (root instanceof Element) {
    applyEditableDefaults(root);
  }

  root.querySelectorAll?.(editableSelector).forEach(applyEditableDefaults);
};

export function setupLowPowerEditableDefaults() {
  document.documentElement.setAttribute('spellcheck', 'false');
  document.body?.setAttribute('spellcheck', 'false');
  applyEditableDefaultsIn(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          applyEditableDefaultsIn(node);
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
