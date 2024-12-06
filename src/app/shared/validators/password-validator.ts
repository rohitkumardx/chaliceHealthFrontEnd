import { AbstractControl, ValidatorFn } from '@angular/forms';

export class CustomPasswordValidator {
  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }

      const errors = [];

      const regexUppercase = /[A-Z]+/;
      const regexLowercase = /[a-z]+/;
      const regexLength = /^.{8,16}$/;
      const regexSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
      const regexNumber = /[0-9]+/;

      if (!regexUppercase.test(control.value)) {
        errors.push('Password must contain at least one uppercase letter.');
      }

      if (!regexLowercase.test(control.value)) {
        errors.push('Password must contain at least one lowercase letter.');
      }

      if (!regexLength.test(control.value)) {
        errors.push('Password length must be between 8 and 16 characters.');
      }

      if (!regexSpecialCharacter.test(control.value)) {
        errors.push('Password must contain at least one special character.');
      }

      if (!regexNumber.test(control.value)) {
        errors.push('Password must contain at least one number.');
      }

      return errors.length > 0 ? { customErrors: errors } : null;
    };
  }

  static confirmPasswordValidator(passwordControlName: string): ValidatorFn {
    return (control: AbstractControl) => {
      const password = control.root.get(passwordControlName)?.value;
      const confirmPassword = control.value;

      return password === confirmPassword ? null : { passwordsDoNotMatch: true };
    };
  }
}
