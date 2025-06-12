import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';

@Component({
  selector: 'app-show-details-popup',
  templateUrl: './show-details-popup.component.html',
  styleUrls: ['./show-details-popup.component.css']
})
export class ShowDetailsPopupComponent implements OnInit {

  transactionDetails: any
  @Input() transactionId: any
  @Output() dialogClosed = new EventEmitter<void>();

  constructor(public activeModel: NgbActiveModal,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.getDetails()
  }


  getDetails() {
    this.adminService.getHistoryDetails(this.transactionId).subscribe((response: any) => {
      this.transactionDetails = response
    })
  }

  formatConsultationType(consultationType: string): string {
    return consultationType ? consultationType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }




  closePopup() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}
