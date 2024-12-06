import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appLettersOnly]'
})
export class LettersOnlyDirective {
  private pattern = /^[a-zA-Z\s'-]*$/;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: Event): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    const inputValue = inputElement.value;

    if (!this.pattern.test(inputValue)) {
      inputElement.value = inputValue.replace(/[^a-zA-Z\s'-]+/g, '');
    }
  }
}
