import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { HttpClient } from '@angular/common/http';

function fileValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const filePaths = control.value as File[];
    if (filePaths.length == 0) {
      return { 'noFilesSelected': true };
    }
    return null;
  };
}
enum Obj {
  IdentificationCardForm = 1,
  MedicalHistory = 2,
  MedicationList = 3,
  Labs = 4,
  Others = 5,
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent {
  myProfileForm!: FormGroup
  states: any[] = [];
  speciality: any
  hovering: boolean = false;
  selectedFile: any;
  loading: boolean = false;

  userId: any;

  showEditTimeFile: boolean;
  editProfilePicture: any;
  selectedFilePath: any;
  isEditMode = false;
  profilePicture = []
  obj = Object.entries(Obj)
    .filter(([key, value]) => typeof value === "number") // Filter only numeric keys
    .map(([key, value]) => ({
      id: value as number,
      value: String(key)
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
        .replace("Card Form", "Card / Form") // Replace "Card Form" with "Card / Form"
    }));


   _=_ ;

  paginator = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  };
  filteredItems = []
  searchTerm: string = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
  roles: {
    id: number;
    numOfUsers: number;
    name: string;
    status: string;
  }[] = [];

  suggestions: any[] = [];
  isDropdownOpen = false;
  qualifications: any;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private providerService: ProviderService,
    private patientService: PatientService,
    private modalService: NgbModal,
    private globalModalService: GlobalModalService,
    private http: HttpClient,
    public notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.myProfileForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      profilePicture: ['',],
      phoneNumber: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      stateId: ['', Validators.required],
      //  zipCode: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]], // Only 5 digits allowed
      qualificationId: ['', Validators.required],
      specialtyId: [''],
      email: [''],
      telehealthVisitPrice: [''],
      inHomeVisitPrice: [''],
      officeVisitPrice: [''],


      id: ['0']
    })
    this.getState();
    this.getSpecialityDropdown();
    this.getProviderProfileByUserId();

    this.getQualificationDropdown();
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
  }


  limitZipCodeLength(event: any) {
    let value = event.target.value;
    if (value.length > 5) {
      event.target.value = value.slice(0, 5);
      this.myProfileForm.get('zipCode')?.setValue(value.slice(0, 5));
    }
  }


  postProviderProfile() {
    this.loading = true;
    
    const myProfileForm = this.myProfileForm.value;

    if (myProfileForm.phoneNumber) {
      myProfileForm.phoneNumber = myProfileForm.phoneNumber.replace(/\D/g, '');
    }

    myProfileForm.userId = this.userId;
    const formData = new FormData();

    // Ensure specialtyIds are sent as an array of integers
    if (Array.isArray(this.checkedSpecialityIds) && this.checkedSpecialityIds.length > 0) {
      this.checkedSpecialityIds.forEach((id) => {
        formData.append('specialtyIds', id.toString());  // Ensure integer values
      });
    }

    // Append other form data fields
    Object.keys(myProfileForm).forEach((key) => {
      if (key !== 'specialtyIds') { // Avoid duplication, we handled it above
        formData.append(key, myProfileForm[key]);
      }
    });

    // Append profile picture if available
    if (this.profilePicture.length > 0) {
      formData.append('profilePicture', this.profilePicture[0]);
    }

    this.providerService.postProviderProfile(formData).subscribe(
      (data: any) => {
        console.log('Post successful', data);

        if (this.myProfileForm.value.id == 0) {
          this.notificationService.showSuccess('Provider Information updated successfully.');
        } else {
          this.notificationService.showSuccess('Provider Information updated successfully.');
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error posting profile', error);
        this.notificationService.showDanger(error);
        this.loading = false;
      }
    );
  }


  async getProviderProfileByUserId() {
    try {
      const data: any = await this.providerService.getProviderProfileByUserId().toPromise();
      console.log("My profile data", data);
  
      if (data) {
        const formattedPhone = this.globalModalService.formatPhoneNumberForDisplay(data.phoneNumber);
  
        this.myProfileForm.patchValue({
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: formattedPhone || '',
          address: data.address || '',
          city: data.city || '',
          stateId: data.stateId || '',
          zipCode: data.zipCode || '',
          qualificationId: data.qualificationId || '',
          telehealthVisitPrice: data.telehealthVisitPrice,
          inHomeVisitPrice: data.inHomeVisitPrice,
          officeVisitPrice: data.officeVisitPrice,
        });
  
        if (data.profilePictureFileName) {
          this.editProfilePicture = {
            userId: this.userId,
            filePath: `${environment.fileUrl}${data.profilePictureFilePath}`,
            fileName: data.profilePictureFileName
          };
          this.showEditTimeFile = false;
        }
        console.log("get data", data);
  
        // Ensure specialties are fully loaded before proceeding
        if (Array.isArray(data.specialtyId) && data.specialtyId.length > 0) {
          this.checkedSpecialityIds = [...data.specialtyId];
  
          await this.getSpecialityDropdown();
  
          // Update specialty list with checked and disabled statuses
          this.speciality = this.speciality.map(item => ({
            ...item,
            checked: data.specialtyId.includes(item.id),
            disabled: data.specialtyId.includes(item.id) // Disable existing specialties
          }));
  
          // Display selected specialties in UI
          this.selectedSpecialityItems = this.speciality
            .filter(item => item.checked)
            .map(item => item.name);
        }
      }
    } catch (error) {
      console.error("Error fetching provider profile:", error);
    }
  }
  getQualificationDropdown() {
    this.providerService.getQualifications().subscribe((response: any) => {
      this.qualifications = response.items.sort((a: any, b: any) => {
        return a.name.localeCompare(b.name);
      });
    });
  }
  getSpecialityDropdown() {
    this.providerService.getSpeciality().subscribe((response: any) => {
      this.speciality = response.map(item => ({
        ...item,
        checked: this.checkedSpecialityIds.includes(item.id), // If it's already selected, mark it
        disabled: this.checkedSpecialityIds.includes(item.id) // Disable existing specialties
      }));
    });
  }
  selectedSpecialityItems: string[] = [];
  checkedSpecialityIds: number[] = [];
  selectedNewSpecialities: number[] = [];

checkboxChangeOfSpeciality(event: any, name: string, specialtyId: number) {
  debugger;
  if (event.target.checked) {
    this.selectedSpecialityItems.push(name);
    this.checkedSpecialityIds.push(specialtyId);
  } else {
    const nameIndex = this.selectedSpecialityItems.indexOf(name);
    if (nameIndex !== -1) {
      this.selectedSpecialityItems.splice(nameIndex, 1);
    }
 
    const idIndex = this.checkedSpecialityIds.indexOf(specialtyId);
    if (idIndex !== -1) {
      this.checkedSpecialityIds.splice(idIndex, 1);
    }
  }
 
  this.myProfileForm.get('specialtyId').setValue(this.checkedSpecialityIds);
  this.updateValidationForSpeciality();
}


  updateValidationForSpeciality() {
    if (this.checkedSpecialityIds.length > 0) {
      this.myProfileForm.get('specialtyIds').setErrors(null);
    } else {
      this.myProfileForm.get('specialtyIds').setErrors({ 'required': true });
    }
  }



  onProfileSelected(event: any) {
    
    this.profilePicture = [];
    const file = event.target.files[0];
    if (file) {
      this.profilePicture.push(file);
    }
  }


  formatCategory(category: string): string {
    if (!category) return '';
    return category.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  deleteImage(file) {
    this.providerService.deleteProfilePicture(this.userId).subscribe((data: any) => {
      this.editProfilePicture = null
      this.profilePicture = []
      this.notificationService.showSuccess("Profile Picture Deleted Successfully");
    })
  }

  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.myProfileForm.get('phoneNumber').setValue(formattedValue);
  }
  onAddressChange(event: any): void {
   
    console.log("This is local storage ",localStorage);
   
  
    const query = event.target.value;
    if (query.length > 2) {
     this.providerService.getAddressSearch(query).subscribe((response:any)=>{
     
      this.suggestions = response
     });
    
    } else {
      this.suggestions = [];
    }
  }

  selectSuggestion(suggestion: any): void {
   
    const postalCode = suggestion.postalCode?.includes('-')
      ? suggestion.postalCode.split('-')[0]  // Extract part before the hyphen if present
      : suggestion.postalCode;  // Use the full postal code if no hyphen
  
    const country = suggestion.country; // Ensure country is properly assigned
  
    // this.getStateId(suggestion.city, suggestion.countryCode, 3);
  this.states.map((temp)=>{
    if(temp.name==suggestion.state){
     const StateId=temp.id
     this.myProfileForm.patchValue({
      stateId:StateId
     }
     )
    }
  })
    this.myProfileForm.patchValue({
      address: suggestion.address,
      city: suggestion.city,
      zipCode: postalCode,
    
     

    });
   
    this.suggestions = [];  // Clear suggestions once an address is selected
  }
  
  getState() {

    this.patientService.getState().subscribe((data: any) => {
      this.states = data.items;
      console.log("states :", this.states)
    });
  }














  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }



toggleDropdown(): void {
  this.isDropdownOpen = !this.isDropdownOpen;
}

// Optional: close dropdown when clicking outside
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target.closest('.custom-dropdown')) {
    this.isDropdownOpen = false;
  }
}



}
