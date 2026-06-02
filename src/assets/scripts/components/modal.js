const modals = {};
const overlay = document.querySelector('.overlay');

function openModal(type) {
  const modal = modals[type];

  if (!modal) return;

  overlay.classList.add('overlay--active');
  document.body.classList.add('body-overflow');
  modal.classList.add('modal--active');

  setTimeout(() => {
    modal.classList.add('modal--showed');
  }, 10);
}

function closeModal() {
  const activeModal = document.querySelector('.modal--active');

  if (!activeModal) return;

  activeModal.classList.remove('modal--showed');

  setTimeout(() => {
    overlay.classList.remove('overlay--active');
    document.body.classList.remove('body-overflow');
    activeModal.classList.remove('modal--active');
  }, 200);
}

function changeModalType(activeType, type) {
  modals[activeType].classList.remove('modal--active');
  modals[activeType].classList.remove('modal--showed');
  modals[type].classList.add('modal--active');
  modals[type].classList.add('modal--showed');
}

if(overlay) {
  document.querySelectorAll('.modal').forEach((modal) => {
    modals[modal.dataset.modalType] = modal;

    modal.addEventListener('click', (e) => {
      e.stopPropagation();
      const modalClose = e.target.closest('.modal__close');
      if (modalClose) closeModal();
    });
  });

  document.body.addEventListener('click', ({target}) => {
    const modalButton = target.closest('.modal-button');
    if (modalButton) openModal(modalButton.dataset.type);
  });

  overlay.addEventListener('click', closeModal);
}

