export function initMessagesPage() {
  const textarea = document.querySelector(".messages__textarea");

  textarea.addEventListener("input", function () {
    this.style.height = 47 + "px";

    const newHeight = this.scrollHeight;

    if (newHeight <= 100) {
      this.style.height = newHeight + "px";
      this.style.overflowY = "hidden";
    } else {
      this.style.height = 100 + "px";
      this.style.overflowY = "auto";
    }
  });


  const content = document.querySelector(".messages__content");


  document.body.addEventListener('click', (event) => {
    if (event.target.closest('.messages__user')) {
      content.classList.add('messages__content--active');
      document.body.classList.add('body-overflow-t')
    }else if(event.target.closest('.messages__back')) {
      content.classList.remove('messages__content--active');
      document.body.classList.remove('body-overflow-t')
    }
  })

}