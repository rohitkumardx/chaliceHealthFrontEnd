import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function arrayLengthValidator(length: number = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    return value.length < length ? { message: 'Invalid array length' } : null;
  }
}
