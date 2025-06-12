import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { elements } from 'chart.js';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { environment } from 'src/environments/environment';
import { ProviderProfileComponent } from '../provider-profile/provider-profile.component';

@Component({
  selector: 'app-clinic-profile',
  templateUrl: './clinic-profile.component.html',
  styleUrls: ['./clinic-profile.component.css']
})
export class ClinicProfileComponent implements OnInit {
  userId: any;
  clinicData: any;

    constructor(
      private modalService: NgbModal,
      private activeModel: NgbActiveModal,
      private adminService: AdminService,
      private notificationService:NotificationService
    ) {}
    ngOnInit() {
       this.getClinicProfile();

    }
    getClinicProfile() {
         this.adminService.getClinicProfile(this.userId)?.subscribe((data: any) => {       
         this.clinicData = data;           
            this.clinicData.profilePicturePath=environment.fileUrl+ this.clinicData.profilePicturePath
            console.log("This is clinic data", this.clinicData);  
            this.clinicData.usersWithSameClinic.forEach((element: any) => {
       
              element.profilePicturePath =environment.fileUrl + element.profilePicturePath;
            
          });    

      });
    }


      viewProviderProfile(id: any) {
      
        if (this.modalService.hasOpenModals?.()) { 
          this.modalService.dismissAll(); // Closes the currently open modal
        }
        const modalRef = this.modalService.open(ProviderProfileComponent, {
          backdrop: 'static',
          size: 'lg',
          centered: true
        });
        modalRef.componentInstance.providerId = id;
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.getClinicProfile();
      });
       
      }

      formatAccountType(accountType: string): string {
        return accountType ? accountType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
      }
   

  closeModal() {
    this.activeModel.close();
  }


  getStarType(index: number, rating: number): 'full' | 'half' | 'empty' {
    const floorRating = Math.floor(rating);
    const decimal = rating - floorRating;

    if (index <= floorRating) {
      return 'full';
    }
     else if (index === floorRating + 1 && decimal >= 0.25) {
      return 'half';
    } 
    else {
      return 'empty';
    }
  }

}
