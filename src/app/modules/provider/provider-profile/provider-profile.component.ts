import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-provider-profile',
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.css']
})
export class ProviderProfileComponent implements OnInit {

  profileForm!: FormGroup
  loading: boolean = false;
  loading1: boolean = false;
  @Output() dialogClosed = new EventEmitter<void>();

  mySelectedItems: string[] = [];
  selectedItems: any[] = [];
  checkedLanguageIds: any[] = [];
  hovering: boolean = false;
  languages: any
  userInfo: any
  showEditTimeFile: boolean;
  editProfilePicture: any;

  constructor(private fb: FormBuilder,
    public activeModel: NgbActiveModal,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private providerService: ProviderService,
    private authService: AuthService,
    private globalModalService: GlobalModalService,
  ) { }
  ngOnInit() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      languageIds: ['', Validators.required],
      email: ['', Validators.required],
      SSN: ['', Validators.required],
      legalPracticeName: [''],
      ProfilePic: [],
      videoIntroName: [''],
      providerBio: ['']
    })
    this.userInfo = this.authService.getUserInfo()

    this.getlanguagesDropdown()
    this.autoFillData()
    this.updateValidation();
  }

  isTooltipVisible1 = false;

  showTooltip1() {
    this.isTooltipVisible1 = true;
  }

  hideTooltip1() {
    this.isTooltipVisible1 = false;
  }

  toggleTooltip1() {
    this.isTooltipVisible1 = !this.isTooltipVisible1;
  }

  isTooltipVisible2 = false;

  showTooltip2() {
    this.isTooltipVisible2 = true;
  }

  hideTooltip2() {
    this.isTooltipVisible2 = false;
  }

  toggleTooltip2() {
    this.isTooltipVisible2 = !this.isTooltipVisible2;
  }

  getEditProfileData() {
    this.providerService.getProvdierProfileData(this.userInfo.userId).subscribe((response: any) => {
      if (response != null) {

        const dateOfBirth = response.dateOfBirth;
        const formattedDate = this.datePipe.transform(dateOfBirth, 'yyyy-MM-dd');
        response.dateOfBirth = formattedDate;
        const SSN = response.ssn
        response.SSN = SSN
        if (response.profilePictureName != null) {
          const editProfilePicture = {
            userId: this.userInfo.userId,
            filePath: environment.fileUrl + response.profilePicturePath,
            fileName: response.profilePictureName
          };
          this.editProfilePicture = editProfilePicture
          this.showEditTimeFile = false
        }
        this.profileForm.patchValue(response)
        this.checkedLanguageIds = []
        const languageIds = [];
        response.language.forEach((item) => {
          languageIds.push(item.languageIds);
        });

        this.languages.forEach((item: any) => {
          if (languageIds.includes(item.id)) {
            item.checked = true
            this.selectedItems.push(item.name);
            this.checkedLanguageIds.push(item.id);
            this.profileForm.get('languageIds').setValue(this.checkedLanguageIds)
          }
        })
      }
    })
  }

  getlanguagesDropdown() {
    this.providerService.getLanguages().subscribe((resposne: any) => {
      this.languages = resposne.items
      this.getEditProfileData();
    })
  }

  autoFillData() {
    const userInfo = this.authService.getUserInfo()
    this.profileForm.patchValue(userInfo)
  }

  submitData() {
    this.notificationService.markFormGroupTouched(this.profileForm);
    if (this.profileForm.invalid) {
      this.notificationService.markFormGroupTouched(this.profileForm);
      return;
    }
    debugger
    this.loading = true;
    const userInfo = this.authService.getUserInfo()
    const providerForm = this.profileForm.value;
    providerForm.userId = userInfo.userId
    const formData = new FormData;
    Object.keys(providerForm).forEach(key => {
      formData.append(key, providerForm[key]);
    });
    for (let i = 0; i < this.checkedLanguageIds.length; i++) {
      formData.append('LanguageIds', this.checkedLanguageIds[i]);
    }
    for (let i = 0; i < this.profilePicture.length; i++) {
      formData.append('ProfilePicture', this.profilePicture[i]);
    }
    this.providerService.postProviderGeneralInfo(formData).subscribe((data: any) => {
      this.notificationService.showSuccess("Provider General Info updated successfully.");
      this.modalClose()
    },
      (error) => {
        this.notificationService.showDanger(getErrorMessage(error));
        this.loading = false;
      }
    )

  }


  handleCB(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.mySelectedItems.push(checkbox.value);
    } else {
      this.mySelectedItems = this.mySelectedItems.filter(item => item !== checkbox.value);
    }

    const dropdownButton = document.getElementById('multiSelectDropdown') as HTMLElement;
    dropdownButton.innerText = this.mySelectedItems.length > 0
      ? this.mySelectedItems.join(', ')
      : 'Select Items';
  }


  updateValidation() {
    if (this.selectedItems.length > 0) {
      this.profileForm.get('languageIds').setErrors(null);
    } else {
      this.profileForm.get('languageIds').setErrors({ 'required': true });
    }
  }

  checkboxChange(event: any, clientName: string, stationId: string) {
    if (event.target.checked) {
      this.selectedItems.push(clientName);
      this.checkedLanguageIds.push(stationId);
    } else {
      const index = this.selectedItems.indexOf(clientName);
      if (index !== -1) {
        this.selectedItems.splice(index, 1);
        this.checkedLanguageIds.splice(index, 1);
      }
    }
    this.profileForm.get('languageIds').setValue(this.checkedLanguageIds)
    this.updateValidation();
  }

  getDropdownWidth(): number {
    const button = document.getElementById('multiSelectDropdown');
    if (button) {
      return button.offsetWidth;
    }
    return 0;
  }

  cancel() {
    this.activeModel.close();
  }
  profilePicture = []
  onProfileSelected(event: any) {
    debugger
    this.profilePicture = []
    const file = event.target.files[0];
    if (file) {
      this.profilePicture.push(file)
    }
  }

  deleteImage(file) {
    this.providerService.deleteProfilePicture().subscribe((data: any) => {
      this.editProfilePicture = null
      this.profilePicture = []
      this.notificationService.showSuccess("Image deleted");
    })
  }
  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }
  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();

  }


}
