export function setupViewportScale() {
  const docEl = document.documentElement;
  const dpr = window.devicePixelRatio || 1;
  let waitingForBody = false;

  function setBodyFontSize() {
    if (document.body) {
      document.body.style.fontSize = `${12 * dpr}px`;
      return;
    }

    waitingForBody = true;
    document.addEventListener('DOMContentLoaded', setBodyFontSize, { once: true });
  }

  function setRemUnit() {
    const rem = docEl.clientWidth / 12;
    docEl.style.fontSize = window.innerWidth <= 1000 ? '100px' : `${rem}px`;
  }

  const handlePageShow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      setRemUnit();
    }
  };

  setBodyFontSize();
  setRemUnit();

  window.addEventListener('resize', setRemUnit);
  window.addEventListener('pageshow', handlePageShow);

  if (dpr >= 2) {
    const fakeBody = document.createElement('body');
    const testElement = document.createElement('div');
    testElement.style.border = '.5px solid transparent';
    fakeBody.appendChild(testElement);
    docEl.appendChild(fakeBody);
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines');
    }
    docEl.removeChild(fakeBody);
  }

  return () => {
    if (waitingForBody) {
      document.removeEventListener('DOMContentLoaded', setBodyFontSize);
    }
    window.removeEventListener('resize', setRemUnit);
    window.removeEventListener('pageshow', handlePageShow);
  };
}
