import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appMinAge]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MinAgeValidatorDirective,
      multi: true
    }
  ]
})
export class MinAgeValidatorDirective implements Validator {
  @Input('appMinAge') minAge!: number;

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null; // Let required validator handle empty values

    const birthDate = new Date(control.value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear(); // Change from `const` to `let`
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--; // Now correctly reassigns `age`
    }

    return age < this.minAge ? { minAge: { requiredAge: this.minAge, actualAge: age } } : null;
  }
}
