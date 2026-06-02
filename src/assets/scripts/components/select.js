document.querySelectorAll('.select').forEach(select => {
  const trigger = select.querySelector('.select__trigger') ||
    select.querySelector('.select__empty-trigger') ;
  const text = trigger.querySelector('span');
  const hiddenInput = select.querySelector('input');
  const options = select.querySelectorAll('.select__option');

  trigger.addEventListener('click', () => {
    select.classList.toggle('select--active');
  });

  options.forEach(option => {
    option.addEventListener('click', () => {
      text.textContent = option.textContent;
      hiddenInput.value = option.dataset.value;
      select.classList.remove('select--active');
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