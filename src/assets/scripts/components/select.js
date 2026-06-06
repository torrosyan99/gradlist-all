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
    const options = Array.from(select.querySelectorAll('.select__option'));

    const NS = 'http://www.w3.org/2000/svg';

    function createCheckSvg() {
      const s = document.createElementNS(NS, 'svg');
      s.setAttribute('width', '16');
      s.setAttribute('height', '16');
      s.classList.add('select__option-check');
      const u = document.createElementNS(NS, 'use');
      const href = '/icons.svg#select-check';
      // Support both SVG2 `href` and legacy `xlink:href`.
      u.setAttribute('href', href);
      u.setAttribute('xlink:href', href);
      s.appendChild(u);
      return s;
    }

    function normalizeOption(option) {
      // Ensure structure: [optional leading svg icon] + <span class="select__option-label"> + check svg
      let labelEl = option.querySelector('.select__option-label');
      if (!labelEl) {
        const labelText = option.textContent.trim();
        const svgs = Array.from(option.querySelectorAll('svg'))
          .filter((s) => !s.classList.contains('select__option-check'));

        option.textContent = '';

        svgs.forEach((s) => option.appendChild(s));

        labelEl = document.createElement('span');
        labelEl.className = 'select__option-label';
        labelEl.textContent = labelText;
        option.appendChild(labelEl);
      }

      if (!option.querySelector('.select__option-check')) {
        option.appendChild(createCheckSvg());
      }
    }

    function setSelected(value) {
      const v = String(value ?? '').trim();
      options.forEach((opt) => {
        const isSelected = String(opt.dataset.value ?? '') === v && v.length > 0;
        opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });
    }

    trigger.addEventListener('click', () => {
      setSelected(hiddenInput?.value ?? '');
      select.classList.toggle('select--active');
    });

    options.forEach(option => {
      normalizeOption(option);
      option.addEventListener('click', () => {
        const label = option.querySelector('.select__option-label')?.textContent?.trim()
          ?? option.textContent.trim();
        const value = option.dataset.value ?? '';
        const iconValue = option.dataset.iconValue ?? null;

        if (text) text.textContent = label;
        if (hiddenInput) hiddenInput.value = value;
        setSelected(value);
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

    setSelected(hiddenInput?.value ?? '');

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

initSelects();
