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
}