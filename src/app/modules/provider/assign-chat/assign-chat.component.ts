import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Input, OnInit } from '@angular/core';
import { ProviderService } from 'src/app/Services/provider.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/Services/notification.service';
import { AuthService } from 'src/app/Services/auth.service';
import { noWhitespaceValidator } from 'src/app/shared/validators/no-whitespace-validator';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-assign-chat',
  templateUrl: './assign-chat.component.html',
  styleUrls: ['./assign-chat.component.css']
})
export class AssignChatComponent implements OnInit {
  @Input() receivedData: any;
  constructor(
    private providerService: ProviderService,
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }
  selectedProviders: any;
  assignChatForm: FormGroup;
  loading: boolean = false;
  loading1: boolean = false;
  ngOnInit() {
    this.getstaffListByClinicId();
    this.assignChatForm = this.fb.group({
      groupName: ['', [Validators.required, noWhitespaceValidator()]],
      description: ['',  [Validators.required, noWhitespaceValidator()]],
    })
  }
  staffList: any;
  getstaffListByClinicId() {
   const  userInfo = this.authService.getUserInfo();
    this.providerService.getClinicStaffList(userInfo.userId  ).subscribe((response: any) => {
      const data = response;
      this.staffList = data;
      // if (data == true) {
      //   this.notificationService.showSuccess("Cancel request created sucessfully");
      //   this.activeModel.close();
      //   this.loading = false;
      // }
    },
      (error: any) => {
        //this.notificationService.showDanger(getErrorMessage(error));
      }
    );
  }
  closePopup() {
    this.activeModal.close();

  }
  getDropdownWidth(): number {
    const button = document.getElementById('multiSelectDropdown');
    if (button) {
      return button.offsetWidth;
    }
    return 0;
  }

  selectedProvidersItems: string[] = [];
  checkedProviderIds: number[] = [];
  selectedNewProviders: number[] = [];
  checkboxChangeOfProvider(event: any, name: string, specialtyId: number) {
    if (event.target.checked) {
      this.selectedProvidersItems.push(name);
      this.checkedProviderIds.push(specialtyId);
    } else {
      const index = this.selectedProvidersItems.indexOf(name);
      if (index !== -1) {
        this.selectedProvidersItems.splice(index, 1);
        this.checkedProviderIds.splice(index, 1);
      }
    }
    //this.myProfileForm.get('specialtyId')?.setValue(this.checkedSpecialityIds);
  }
  createGroup() {
    
    const userdata = this.authService.getUserInfo();
    const createdBy = userdata.userId;
    const obj = {
      createdBy: createdBy,
      groupName: this.assignChatForm.get('groupName')?.value,
      description: this.assignChatForm.get('description')?.value,
    }
    this.providerService.createGroup(obj).subscribe((response: any) => {
      const providerGroupId = response;
      
      const userIds = this.checkedProviderIds;
      userIds.push(Number(this.receivedData.patientId));
      userIds.push(createdBy);
      const obj = {
        providerGroupId: providerGroupId,
        userIds: userIds
      }
      this.providerService.addGroupMembers(obj).subscribe((response: any) => {
        this.notificationService.showSuccess("Assign  sucessfully");
        this.loading = false;
        this.activeModal.close();
      });
    },
      (error: any) => {
        this.loading = false;
        this.notificationService.showDanger((getErrorMessage(error)));
        this.activeModal.close();
      }
    );
  }
}
