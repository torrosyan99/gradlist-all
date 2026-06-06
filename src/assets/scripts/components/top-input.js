const input = document.querySelector('.top__input');

if (input) {
  const form = input.closest('.top__form');
  const panel = form?.querySelector('.top__search-panel');

  const updatePlaceholder = () => {
    if (window.innerWidth < 1120) {
      input.placeholder = 'Поиск';
    } else {
      input.placeholder = 'Поиск: квартиры, авто, работа ...';
    }
  };

  const openPanel = () => {
    if (!form || !panel) return;
    form.classList.add('top__form--open');
  };

  const closePanel = () => {
    if (!form || !panel) return;
    form.classList.remove('top__form--open');
  };

  updatePlaceholder();
  window.addEventListener('resize', updatePlaceholder);

  if (form && panel) {
    input.addEventListener('input', () => {
      if (input.value.trim().length > 0) openPanel();
      else closePanel();
    });

    form.addEventListener('click', (e) => {
      const chip = e.target.closest('.top__chip');
      const suggestion = e.target.closest('.top__suggestion');

      if (chip) {
        input.value = chip.textContent?.trim() || '';
        input.focus();
        openPanel();
      }

      if (suggestion) {
        input.value = suggestion.textContent?.trim() || '';
        closePanel();
        input.focus();
      }
    });


    document.addEventListener('click', (e) => {
      if (!form.contains(e.target)) closePanel();
    });
  }
}
