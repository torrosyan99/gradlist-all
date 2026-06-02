const profileMenu = document.querySelector('.profile__menu');
const profileMenuButton = document.querySelector('.profile__menu-button');

if(profileMenuButton && profileMenu) {
  profileMenuButton.addEventListener('click', (e) => {
    profileMenu.classList.add('profile__menu--active');
    document.body.classList.add('body-overflow-t');
  })
}