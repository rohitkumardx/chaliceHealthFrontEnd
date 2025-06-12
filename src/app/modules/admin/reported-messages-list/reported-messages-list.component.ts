import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ViewComplaintComponent } from '../view-complaint/view-complaint.component';
@Component({
  selector: 'app-reported-messages-list',
  templateUrl: './reported-messages-list.component.html',
  styleUrls: ['./reported-messages-list.component.css']
})
export class ReportedMessagesListComponent {
    complaintData: any;
      userId: any;
      loading: boolean = false
  
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
        private adminService : AdminService,
        private notificationService : NotificationService,
        private modalService: NgbModal,
      ){}
  
    
      ngOnInit(){
        this.getComplaintMessageList();
      }
  
  
      onStatusChange(event: Event, id: any) {
        
        this.complaintData = []
        this.loading = true
        const selectedValue = (event.target as HTMLSelectElement).value;
        const obj = {
          id: id,
          status: selectedValue
          
        }
        this.adminService.messageStatus(obj).subscribe((response: any) => {
          this.notificationService.showSuccess("Message status updated successfully.");
          this.getComplaintMessageList()
        })
    
      }
  
  
      getRead(){
       
        this.adminService.getMessageComplaintList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
          this.complaintData = data.items
        }
      )
    }
  

  
      markAsRead(messageComplaintId: any) {
        
        const obj = {
          messageComplaintId: messageComplaintId,
          isRead: true
        } 
        this.adminService.markReadReportedMessages(obj).subscribe((response: any) => {
          this.notificationService.emitNotificationUpdate();
          
         this.getRead() 
        })
      }
    
      formatMeetingType(meetingType: string): string {
        return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
      }
      getComplaintMessageList(){
        this.complaintData = [];
        this.loading = true;
      
        this.adminService.getMessageComplaintList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder)?.subscribe(
          (data: any) => { 
            this.loading = false;
      
            if (data && data.items && Array.isArray(data.items)) {
              this.complaintData = data.items;
              this.filteredItems = [...this.complaintData];
            } else {
              this.complaintData = []; // Ensure it's an empty array if no data
            }
      
            this.roles = _.get(data, 'items', []);
            this.paginator = {
              ...this.paginator,
              pageNumber: _.get(data, 'pageNumber'),
              totalCount: _.get(data, 'totalCount'),
              totalPages: _.get(data, 'totalPages'),
            };
      
            console.log(this.complaintData);
          },
          (error) => {
            this.loading = false;
            this.complaintData = []; // Ensure no data is displayed on error
            console.error("Error fetching complaint list:", error);
          }
        );
      }
      

    
  

}
