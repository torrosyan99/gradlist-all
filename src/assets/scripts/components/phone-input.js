import IMask from "imask";

const inputs = document.querySelectorAll('.phone-input__item');

if (inputs.length > 0) {
  [...inputs].forEach(
    input => new IMask(input, {
      mask: '000 000 00-00'
    })
  )
}

const phoneInputs = document.querySelectorAll('.phone-input-second');

if (phoneInputs.length > 0) {
  [...phoneInputs].forEach(
    input => new IMask(input, {
      mask: '+7 (000) 000-00-00'
    })
  )
}