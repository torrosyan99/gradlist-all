const input = document.querySelector('.top__input')

if (input) {
  const updatePlaceholder = () => {
    if (window.innerWidth < 1120) {
      input.placeholder = 'Поиск'
    } else {
      input.placeholder = 'Поиск: квартиры, авто, работа ...'
    }
  }

  updatePlaceholder()
  window.addEventListener('resize', updatePlaceholder)
}