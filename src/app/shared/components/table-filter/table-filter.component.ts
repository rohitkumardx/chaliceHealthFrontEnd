import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.css']
})

export class TableFilterComponent implements OnInit {

  @Input() tableConfig: any;
  @Output() searchEvent = new EventEmitter<void>();
  @Output() addActionEvent = new EventEmitter<void>();
  @Output() resetFilterEvent = new EventEmitter<void>();

  filterForm: FormGroup;
  _ = _;


  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.initializeFilterForm();
  }

  searchClicked() {
    this.searchEvent.emit();
  }

  initializeFilterForm() {
    this.filterForm = this.formBuilder.group({});
    this.filterForm.addControl('search', new FormControl(''));

    _.forEach(_.get(this.tableConfig, 'singleSelectArray'), dropDown => {
      this.filterForm.addControl(dropDown.formControlName, new FormControl(''));
    })
  }
}
