import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent {

  constructor(public activeModal: NgbActiveModal){

  }

  @Input() data:{
    confirmationHeading:string,
    confirmationMessage:string
  };

  modalClose(){
    this.activeModal.close('cancel');
  }
  
  confirm(){
    this.activeModal.close('confirm');
  }
}
