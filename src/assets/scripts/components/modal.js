const modals = {};
const overlay = document.querySelector('.overlay');
let activeModal = document.querySelector('.page-login') ? 'login' : null;

function openModal(type) {
  const modal = modals[type];

  if (!modal) return;

  activeModal = type;
  overlay.classList.add('overlay--active');
  document.body.classList.add('body-overflow');
  modal.classList.add('modal--active');

  setTimeout(() => {
    modal.classList.add('modal--showed');
  }, 10);
}

function closeModal() {
  const activeModalTag = document.querySelector('.modal--active');

  if (!activeModalTag) return;

   activeModal = null

  activeModalTag.classList.remove('modal--showed');

  setTimeout(() => {
    overlay.classList.remove('overlay--active');
    document.body.classList.remove('body-overflow');
    activeModalTag.classList.remove('modal--active');
  }, 200);
}

export function changeModalType(activeType, type) {
  modals[activeType].classList.remove('modal--active');
  modals[activeType].classList.remove('modal--showed');
  modals[type].classList.add('modal--active');
  modals[type].classList.add('modal--showed');
   activeModal = type

}

if (overlay) {
  document.querySelectorAll('.modal').forEach((modal) => {
    modals[modal.dataset.modalType] = modal;

    modal.addEventListener('click', (e) => {
      e.stopPropagation();
      const {target} = e
      const modalClose = target.closest('.modal__close') || target.closest('.modal-close');
      const changeModalButton = target.closest('.change-modal');

      if (changeModalButton && activeModal) changeModalType(activeModal, changeModalButton.dataset.type);


      if (modalClose) closeModal()


    });
  });

  document.body.addEventListener('click', ({target}) => {
    const modalButton = target.closest('.modal-button');
    if (modalButton) openModal(activeModal)

  });

  overlay.addEventListener('click', closeModal);
}

