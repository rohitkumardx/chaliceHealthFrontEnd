import { Component, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-cancellation',
  templateUrl: './view-cancellation.component.html',
  styleUrls: ['./view-cancellation.component.css']
})
export class ViewCancellationComponent {
  @Output() dialogClosed = new EventEmitter<void>();
    constructor(
      public activeModel: NgbActiveModal,

    ) { }
  
    ngOnInit(){

    }

    modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }

}
