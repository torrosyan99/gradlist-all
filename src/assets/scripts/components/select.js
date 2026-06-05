export function initSelects(root = document) {
  const base =
    root instanceof Document ? root : (root instanceof Element ? root : document);

  base.querySelectorAll('.select:not([data-select-initialized])').forEach(select => {
    select.dataset.selectInitialized = 'true';

    const trigger = select.querySelector('.select__trigger') ||
      select.querySelector('.select__empty-trigger');

    if (!trigger) return;

    const hasIcon = select.classList.contains('select--with-icon');
    const svg = hasIcon && trigger.querySelector('.select__icon use');
    const text = trigger.querySelector('span');
    const hiddenInput = select.querySelector('input');
    const options = select.querySelectorAll('.select__option');

    trigger.addEventListener('click', () => {
      select.classList.toggle('select--active');
    });

    options.forEach(option => {
      option.addEventListener('click', () => {
        const label = option.textContent.trim();
        const value = option.dataset.value ?? '';
        const iconValue = option.dataset.iconValue ?? null;

        if (text) text.textContent = label;
        if (hiddenInput) hiddenInput.value = value;
        select.classList.remove('select--active');

        if (svg && iconValue) {
          const href = '/icons.svg#' + iconValue;
          // Support both SVG2 `href` and legacy `xlink:href`.
          svg.setAttribute('href', href);
          svg.setAttribute('xlink:href', href);
        }

        select.dispatchEvent(new CustomEvent('select:change', {
          bubbles: true,
          detail: { value, label, iconValue },
        }));
      });
    });

    document.addEventListener('click', e => {
      if (!select.contains(e.target)) {
        select.classList.remove('select--active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        select.classList.remove('select--active');
      }
    });
  });
}

// Initialize selects already present in the DOM.
initSelects();
