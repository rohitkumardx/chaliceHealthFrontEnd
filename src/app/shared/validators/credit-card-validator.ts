import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Luhn Algorithm validator function
export function creditCardValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cardNumber = control.value;

    // Check if card number exists and if it's of valid length (13-19 digits)
    if (!cardNumber || !/^\d{13,19}$/.test(cardNumber)) {
      return { 'invalidCardNumberLength': 'Card number must be between 13 and 19 digits.' };
    }

    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9; // If doubling gives a number greater than 9, subtract 9
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    // If the sum modulo 10 is zero, the card number is valid
    return sum % 10 === 0 ? null : { 'invalidCardNumber': 'Card number is invalid.' };
  };
}
