import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { ProviderProfileComponent } from '../../admin/provider-profile/provider-profile.component';
import { PatientClinicalDashboardComponent } from '../patient-clinical-dashboard/patient-clinical-dashboard.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


export enum NotificationPreferenceOption {
  Email = 'Email',
  Phone = 'Phone',
  Both = 'Both'
}


export function phonePatternValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const valid = /^\(\d{3}\)-\d{3}-\d{4}$/.test(value);
    return valid ? null : { 'invalidPhonePattern': { value } };
  };
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
    settingData: any;
    notificationForm!: FormGroup;
    userId: any;
    loading: boolean = false;
    isLoading: boolean = false;
    notificationData: any;
    preference = NotificationPreferenceOption;
  
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
      private globalModalService :GlobalModalService,
      private notificationService : NotificationService,
      private providerService : ProviderService,
      private fb: FormBuilder,
      private authService : AuthService,
      private modalService: NgbModal,
    ){}
  
    ngOnInit(){
      
           this.notificationForm = this.fb.group({
              id : ['0'],
              email : ['', [Validators.required, Validators.email]],
              phoneNumber : ['', [Validators.required, phonePatternValidator()]],
              preference: [this.preference.Both]

            })
            
      this.getPatientSettingByUserId();
      this.getNotificationByUserId();

      const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    }

    sortData(column: string) {
      if (this.sortColumn === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortOrder = 'asc';
      }
      this.getPatientSettingByUserId();
    }

     viewProfile(id: any) {
        const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
          backdrop: 'static',
          size: 'xl',
          centered: true,
          windowClass: 'custom-modal'
        });
        modalRef.componentInstance.bookingId = id;
        modalRef.componentInstance.dialogClosed.subscribe(() => {
           this.getPatientSettingByUserId();
        });
      }
      viewProviderProfile(id: any, ) {
       
        const modalRef = this.modalService.open(ProviderProfileComponent, {
          backdrop: 'static',
          size: 'lg',
          centered: true
        });
        modalRef.componentInstance.providerId = id;
        // modalRef.componentInstance.bookAppointmentId = bookingId;
       modalRef.componentInstance.dialogClosed.subscribe(() => {
         this.getPatientSettingByUserId();
      });
       
      }

    postNotification() {
      this.isLoading = true;
      const notificationForm = this.notificationForm.value;

         // Ensure a preference is selected
      if (!notificationForm.preference) {
       notificationForm.preference = this.preference.Both;
       this.notificationForm.get('preference')?.setValue(this.preference.Both);
      }
    
      if (notificationForm.phoneNumber) {
        notificationForm.phoneNumber = notificationForm.phoneNumber.replace(/\D/g, '');
      }
    
      notificationForm.userId = this.userId; // Ensure userId is included
    
      this.providerService.postNotification(notificationForm).subscribe(
        (data) => {
          console.log('Post successful', data);
    
          if (this.notificationForm.value.id == 0) {
            this.notificationService.showSuccess(" Information added successfully.");
          } else {
            this.notificationService.showSuccess(" Information updated successfully.");
          }
          this.isLoading = false;
          // this.notificationForm.reset();
        },
        (error) => {
          console.error('Error posting notification:', error);
          this.isLoading = false; 
          // this.notificationService.showError("Failed to update notification preferences.");
        }
      );
    }

    getNotificationByUserId() {
      this.providerService.getNotificationByUserId().subscribe((data) => {
        this.notificationData = data;

       const formattedPhoneNumber = this.globalModalService.formatPhoneNumberForDisplay(this.notificationData.phoneNumber);

        this.notificationForm.patchValue({
          id: this.notificationData.id,
          userId: this.notificationData.userId,
          email: this.notificationData.email,
          phoneNumber: formattedPhoneNumber,
          preference: this.notificationData.preference || this.preference.Both,
       
      });
      console.log("notification data", this.notificationData);

    })
  }
  
    formatMeetingType(meetingType: string): string {
      return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
    }
    onSettingsChange(event: any) {
      // this.searchTerm = ''
      // this.roles = []
      const selectedIndex = event.index;
    }
    formatPhoneNumber(event: any): void {
      const input = event.target as HTMLInputElement;
      const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
      this.notificationForm.get('phoneNumber').setValue(formattedValue);
    }
    getPatientSettingByUserId(){
      this.settingData = []
  
      this.loading = true;
      this.patientService.getPatientSettingByUserId(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder)?.subscribe((data: any) => {  
        if (data.items.length > 0) {
                        this.roles = _.get(data, 'items');
                        this.paginator = {
                          ...this.paginator,
                          pageNumber: _.get(data, 'pageNumber'),
                          totalCount: _.get(data, 'totalCount'),
                          totalPages: _.get(data, 'totalPages'),
                        };
                        this.settingData = data.items
                        if (data && data.items && Array.isArray(data.items)) {
                          this.settingData = data.items;
                          this.filteredItems = [...this.settingData];
                        }
                      }
                       this.loading = false
                      this.settingData = data.items;    
                      console.log("payment history :",this.settingData)
                    },
                      (error) => {
                         this.loading = false
                        console.error("Error fetching complaint list:", error);
                      }
                    );     
 
    }

}
