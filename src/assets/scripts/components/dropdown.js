document.querySelectorAll('.dropdown').forEach(dropdown => {
  const trigger = dropdown.querySelector('.dropdown__trigger');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('dropdown--open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('dropdown--open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('dropdown--open');
    }
  });
});