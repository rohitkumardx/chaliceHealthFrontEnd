import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mask'
})
export class MaskPipe implements PipeTransform {
  transform(value: string, mask: string, keepLastNumOfCharacter: number = 1): string {
    if (!value) {
      return '';
    }

    return (`${value}`).slice(0, -keepLastNumOfCharacter).replace(/./g, mask) + (`${value}`).slice(-keepLastNumOfCharacter);
  }
}
