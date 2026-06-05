import {changeModalType} from "./modal.js";

const recoveryForm = document.querySelector('.recovery');

if(recoveryForm) {
  recoveryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    changeModalType('recovery', 'recovery-result')
  })
}