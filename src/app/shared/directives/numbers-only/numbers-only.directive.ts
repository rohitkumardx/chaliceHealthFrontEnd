import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement as HTMLInputElement;
    const originalValue = input.value;
    const sanitizedValue = originalValue.replace(/[^0-9]/g, '');

    if (sanitizedValue !== originalValue) {
      input.value = sanitizedValue;
      input.dispatchEvent(new Event('input'));
    }
  }
}
