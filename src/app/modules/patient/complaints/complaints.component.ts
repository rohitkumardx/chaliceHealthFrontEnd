import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.css']
})
export class ComplaintsComponent implements OnInit {
  complaintData: any;
  userId: any;
  loading: boolean = false;
  complaintId: any;

      filteredItems = []
        searchTerm = '';
        sortColumn: string = '';
        sortOrder: string = 'asc';
        _ = _;
        paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
          pageNumber: 1,
          pageSize: 5,
          totalCount: 0,
          totalPages: 0
        };
        roles: {
          id: number,
          numOfUsers: number,
          name: string,
          status: string
        }[] = [];

  constructor(
    private patientService : PatientService,
    private notificationService :  NotificationService,
    private modalService: NgbModal,
  ){}

  ngOnInit(){
    this.getComplaintListByUserId();
  }

  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

//   deleteComplaintData(complaintId){

//     this.patientService.deleteComplaintData(complaintId).subscribe(data => {
//      this.getComplaintListByUserId();
//      this.notificationService.showSuccess("Deleted successfully");
//    });
//  }
deleteComplaintData(complaintId: any) {
  const modalRef = this.modalService.open(DeletePopupComponent, {
    backdrop: 'static',
    size: 'md',
    centered: true
  });
  modalRef.componentInstance.deletePropertyId = complaintId
  modalRef.componentInstance.deleteProperty = 'Complaint'
  modalRef.componentInstance.dialogClosed.subscribe(() => {
    this.getComplaintListByUserId();
  });
}

  getComplaintListByUserId(){
    this.complaintData = []

    this.loading = true;
    this.patientService.getComplaintListByUserId(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder)?.subscribe((data: any) => {  
      if (data.items.length > 0) {
                      this.roles = _.get(data, 'items');
                      this.paginator = {
                        ...this.paginator,
                        pageNumber: _.get(data, 'pageNumber'),
                        totalCount: _.get(data, 'totalCount'),
                        totalPages: _.get(data, 'totalPages'),
                      };
                      this.complaintData = data.items
                      if (data && data.items && Array.isArray(data.items)) {
                        this.complaintData = data.items;
                        this.filteredItems = [...this.complaintData];
                      }
                    }
                     this.loading = false
                    this.complaintData = data.items;    
                    console.log(this.complaintData)
                  },
                    (error) => {
                       this.loading = false
                      console.error("Error fetching complaint list:", error);
                    }
                  );     
    //   this.complaintData = data.items;    
    //   console.log("This is complaint data", this.complaintData);
    // });  
  }
}
