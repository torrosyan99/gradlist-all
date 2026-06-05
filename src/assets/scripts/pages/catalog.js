export function initCatalogPage() {
  const menu = document.querySelector('.catalog__menu');
  const menuButton = document.querySelector('.catalog__menu-button');
  const menuCloseButton = document.querySelector('.catalog__menu-close');

  menuButton.addEventListener('click', () => {
    menu.classList.add('catalog__menu--active');
    document.body.classList.add('body-overflow-t')
  });

  menuCloseButton.addEventListener('click', () => {
    menu.classList.remove('catalog__menu--active');
    document.body.classList.remove('body-overflow-t')
  });
}