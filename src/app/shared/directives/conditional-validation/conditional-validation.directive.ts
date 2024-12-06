import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgControl, Validators, ValidatorFn } from '@angular/forms';

@Directive({
  selector: '[appConditionalValidation]',
})
export class ConditionalValidationDirective implements OnChanges {
  @Input() appConditionalValidation: boolean;

  constructor(private control: NgControl) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('appConditionalValidation' in changes) {
      this.updateValidation();
    }
  }

  private updateValidation() {
    if (this.appConditionalValidation) {
      this.applyRequiredValidation();
    } else {
      this.removeRequiredValidation();
    }
  }

  private applyRequiredValidation() {
    const currentValidators = this.control.control.validator;
    const newValidators = [Validators.required, ...(this.convertToArray(currentValidators) || [])] as ValidatorFn[];
    this.control.control.setValidators(newValidators);
    this.control.control.updateValueAndValidity();
  }

  private removeRequiredValidation() {
    const currentValidators = this.control.control.validator;
    if (Array.isArray(currentValidators)) {
      const newValidators = currentValidators.filter((validator) => validator !== Validators.required);
      this.control.control.setValidators(newValidators.length > 0 ? newValidators : null);
      this.control.control.updateValueAndValidity();
    }
  }

  private convertToArray(validators: ValidatorFn | ValidatorFn[] | null): ValidatorFn[] | null {
    if (Array.isArray(validators)) {
      return validators;
    } else if (validators) {
      return [validators];
    } else {
      return null;
    }
  }
}
