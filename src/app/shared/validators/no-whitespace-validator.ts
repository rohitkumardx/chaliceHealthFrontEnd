import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (typeof value === 'string' && value.trim().length === 0) {
      return { 'whitespace': true }; // Return error if only spaces
    }

    return null; 
  };
}
