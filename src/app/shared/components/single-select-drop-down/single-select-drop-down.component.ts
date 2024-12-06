import { Component, ElementRef, forwardRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-single-select-drop-down',
  templateUrl: './single-select-drop-down.component.html',
  styleUrls: ['./single-select-drop-down.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SingleSelectDropDownComponent),
      multi: true
    }
  ]
})
export class SingleSelectDropDownComponent implements ControlValueAccessor, OnChanges {

  @Input() optionsList: any[] = [];
  @Input() associatedFormControl!: AbstractControl;
  @Input() customHeight: string | undefined;
  @Input() customWidth: string | undefined;
  @Input() placeHolder: string | undefined;
  @Input() dropDownHeight: string | '400px';
  selectedOption: any = {};
  dropdownOpen = false;
  onChange: any = () => {
  };

  onTouch: any = () => {
  };

  constructor(private _elementRef: ElementRef) {
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
      //this.onTouch();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('optionsList' in changes || 'associatedFormControl' in changes) {
      this.updateSelectedOption();
    }
  }

  writeValue(obj: any): void {
    if ((obj != null || obj != undefined) && this.optionsList?.length > 0) {
      const predefinedOption = _.find(this.optionsList, { value: obj }) || _.find(this.optionsList, { id: obj }) || 'Select Value';
      this.selectedOption = predefinedOption;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;

    if (this.dropdownOpen) {
      setTimeout(() => {
        const windowHeight = window.innerHeight;
        const dropdownElement = this._elementRef.nativeElement.querySelector('.custom-dropdown');
        const ulElement = dropdownElement.querySelector('.options-list');
        const dropdownHeight = ulElement.offsetHeight;
        const boundingBox = dropdownElement.getBoundingClientRect();
        const spaceBelow = windowHeight - boundingBox.bottom;
        const spaceAbove = boundingBox.top;

        if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
          dropdownElement.classList.add('open-above');
        } else {
          dropdownElement.classList.remove('open-above');
        }

        this.onTouch();
      }, 0);
    }
  }

  selectOption(option: any) {
    const newKey = option?.value || option?.id
    const oldKey = this.selectedOption?.value || this.selectedOption?.id;

    if (newKey !== oldKey) {
      this.selectedOption = option;
      this.onChange(newKey);

      this.onTouch();
    }

    this.dropdownOpen = false;
  }

  private updateSelectedOption() {
    if (this.optionsList?.length > 0 && this.associatedFormControl?.value != undefined) {
      const predefinedOption = _.find(this.optionsList, { value: this.associatedFormControl?.value }) || _.find(this.optionsList, { id: this.associatedFormControl?.value });
      if (predefinedOption) {
        this.selectedOption = predefinedOption;
      }
    }
  }
}
