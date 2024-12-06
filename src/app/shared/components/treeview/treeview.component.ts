import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'app-treeview',
  templateUrl: './treeview.component.html',
  styleUrls: ['./treeview.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreeviewComponent),
      multi: true
    }
  ]
})

export class TreeviewComponent implements ControlValueAccessor, OnChanges {
  @Input() items: any = []

  private _onChange: any = (selectedItems: any) => undefined;
  private _onTouched = () => undefined;

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  writeValue(obj: any): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      this.checkIndeterminate();
    }, 0);
  }

  onCheckboxChange(event: any, item: any, parentItem: any = null, parentOfParentItem: any = null) {
    const isChecked = event.target.checked;

    if (item && item.items) {
      for (let index = 0; index < item.items.length; index++) {
        const childItem = item.items[index];

        childItem.checked = isChecked;

        if (childItem.items) {
          for (let childIndex = 0; childIndex < childItem.items.length; childIndex++) {
            childItem.items[childIndex].checked = isChecked;
          }
        }
      }
    }

    if (parentItem && parentItem.items) {
      parentItem.checked = parentItem.items.every(x => x.checked);
    }

    if (parentOfParentItem && parentOfParentItem.items) {
      parentOfParentItem.checked = parentOfParentItem.items.every(x => x.checked);
    }

    this._onChange(this.items);
    this._onTouched();

    setTimeout(() => {
      this.checkIndeterminate();
    }, 100);
  }

  checkIndeterminate() {
    const li = document.querySelectorAll('.tree-view ul li');
    if (!li || !li.length) {
      return;
    }

    for (let index = li.length - 1; index >= 0; index--) {
      const parent = li[index];
      const childItems = parent.querySelectorAll(":scope ul input");

      if (!childItems.length) {
        continue;
      }

      const childCheckedItems = parent.querySelectorAll(":scope ul input:checked");
      const checkGroup = parent.querySelector('div input');
      const isCheckedAll = childItems.length === childCheckedItems.length;

      // @ts-ignore
      checkGroup.checked = isCheckedAll;

      // @ts-ignore
      checkGroup.indeterminate = !isCheckedAll && childCheckedItems.length;
    }
  }
}
