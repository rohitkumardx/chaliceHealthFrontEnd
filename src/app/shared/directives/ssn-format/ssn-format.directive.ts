import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSsnFormat]'
})
export class SsnFormatDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, ''); 
    
    if (value.length > 9) {
      value = value.substring(0, 9);
    }

    if (value.length >= 3) {
      value = `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5)}`;
    }
   
    this.renderer.setProperty(inputElement, 'value', value);
  }
}
