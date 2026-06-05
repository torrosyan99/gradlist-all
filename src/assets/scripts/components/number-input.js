const numberInputs = document.querySelectorAll('.number-input');

if (numberInputs.length > 0) {
  [...numberInputs].forEach(input => input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');
    })
  )
}