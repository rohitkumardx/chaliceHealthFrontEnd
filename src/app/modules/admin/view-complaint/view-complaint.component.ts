import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';

@Component({
  selector: 'app-view-complaint',
  templateUrl: './view-complaint.component.html',
  styleUrls: ['./view-complaint.component.css']
})
export class ViewComplaintComponent {
    transactionDetails: any
    @Input() complaintId: any
    @Output() dialogClosed = new EventEmitter<void>();
  
    constructor(public activeModel: NgbActiveModal,
      private adminService: AdminService
    ) { }
  
    ngOnInit() {
      this.getDetails()
    }
  
  
    getDetails() {
      this.adminService.getNotificationDetails(this.complaintId).subscribe((response: any) => {
        this.transactionDetails = response.items[0]
      })
    }
  
  
  
  
    closePopup() {
      this.activeModel.close();
      this.dialogClosed.emit();
    }
  

}
