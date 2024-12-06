import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[no-consecutive-spaces]'
})
export class NoConsecutiveSpacesDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    let inputValue = inputElement.value;

    // Remove consecutive spaces while allowing a space if it's after a non-space character
    const sanitizedValue = inputValue.replace(/\s{2,}/g, ' ');

    // Prevent the first character from being a space
    if (sanitizedValue.startsWith(' ')) {
      inputValue = sanitizedValue.trimStart(); // Remove the leading space
    } else {
      inputValue = sanitizedValue;
    }

    // Update the input value without causing an infinite loop
    if (inputValue !== inputElement.value) {
      inputElement.value = inputValue;
      // Emit an input event to make sure Angular forms recognize the change
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      inputElement.dispatchEvent(inputEvent);
    }
  }
}
