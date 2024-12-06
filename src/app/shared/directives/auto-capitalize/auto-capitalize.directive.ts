import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAutoCapitalize]'
})
export class AutoCapitalizeDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    // Capitalize the first letter of each word
    inputValue = inputValue.replace(/\b\w/g, char => char.toUpperCase());

    // Update the input element's value
    this.renderer.setProperty(inputElement, 'value', inputValue);
  }
}
