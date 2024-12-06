import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
  
})
export class PaginationComponent {
  @Input() paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  };

  @Output() paginatorChange: EventEmitter<any> = new EventEmitter<any>();

  @Output() onPageChange = new EventEmitter();

  onChangePageSize(size: number) {
    if (this.paginator.pageSize === size) {
      return;
    }

    this.paginator.pageNumber = 1;
    this.paginator.pageSize = size;

    this.paginatorChange.emit(this.paginator);

    this.onPageChange.emit()
  }

  pageChange() {
    this.onPageChange.emit()
  }

  protected readonly Math = Math;
}
