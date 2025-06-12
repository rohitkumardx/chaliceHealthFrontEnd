import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { race, Observable, finalize } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';



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
  selector: 'app-patient-information',
  templateUrl: './patient-information.component.html',
  styleUrls: ['./patient-information.component.css']
})
export class PatientInformationComponent implements OnInit {
  isLoading: boolean = false;
  isLoading1: boolean = false;
  isLoading2: boolean = false;
  generalForm!: FormGroup;
  familyMemberForm!: FormGroup;
  emergencyContactForm!: FormGroup;
  selectedFile: File | null = null;  // Initialize selectedFile
  errorMessage: string | null = null;
  userId: any;
  state: any;
  familyMemberData: any;
  language: any;
  states: any[] = [];
  languages: any[] = [];
  showEditTimeFile: boolean;
  editProfilePicture: any;
  ethnicityList: any
  raceList: any
  secondaryRaceList: any

  // @ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;
  @ViewChild('tabGroup', { static: false }) tabGroup!: MatTabGroup;
  suggestions: any[] = [];


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private authService: AuthService,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService,
    private patientService: PatientService,
    private http: HttpClient,
    private modalService: NgbModal,
    private providerService: ProviderService
  ) { }

  ngOnInit() {
    this.generalForm = this.fb.group({
      id: ['0'],
      firstName: ['', [Validators.required, Validators.pattern(/\S+/)]],
      middleName: [],
      lastName: ['', [Validators.required, Validators.pattern(/\S+/)]],
      patientUniqueId: [{ value: '' }, Validators.required],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      email: [{ value: '' }, [Validators.required, Validators.email]],
      raceId: ['', Validators.required],
      secondaryRaceId: [''],
      gender: ['', [Validators.required, Validators.pattern(/\S+/)]],
      stateId: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/\S+/)]],
      ethnicityId: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', [Validators.required, Validators.pattern(/\S+/)]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      // userId: ['']
    })

    this.familyMemberForm = this.fb.group({
      id: ['0'],
      firstName: ['', [Validators.required, Validators.pattern(/\S+/)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.pattern(/\S+/)]],
      uniqueId: ['', Validators.required],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      email: ['', [Validators.required, Validators.email]],
      race: [''],
      gender: ['', Validators.required],
      stateId: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/\S+/)]],
      // dob: ['', Validators.required],
      dob: ['', [Validators.required, this.pastDateValidator]],
      address: ['', [Validators.required, Validators.pattern(/\S+/)]],
      languageId: [''],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      relationshipType: ['', Validators.required],
      // userId: [''],
    });

    this.emergencyContactForm = this.fb.group({
      id: ['0'],
      firstName: ['', [Validators.required, Validators.pattern(/\S+/)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.pattern(/\S+/)]],
      uniqueId: ['', Validators.required],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      email: ['', [Validators.required, Validators.email]],
      relationshipType: ['', Validators.required],
      address: ['', [Validators.required, Validators.pattern(/\S+/)]],
      stateId: ['', Validators.required],
      city: ['', [Validators.required, Validators.pattern(/\S+/)]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      // userId: ['']

    })
    this.getState();
    this.getEthnicityDropdownList()
    this.getRaceDropdownList();
    this.getSecondaryRaceDropdownList();
    this.getLanguage();
    this.getPatientInformationById();
    this.getEmergencyContactById();
    this.getFamilyMemberList();
    this.getFamilyUniqueCode();
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
  }

    selectedTabIndex = 0;

  goToEmergencyContact() {
    this.selectedTabIndex = 2; // 1 is the index of the Emergency Contact tab
  }

goBack() {
  if (this.selectedTabIndex > 0) {
    this.selectedTabIndex -= 1;
  }
}

  limitGeneralZipCodeLength(event: any) {
    let value = event.target.value;
    if (value.length > 5) {
      event.target.value = value.slice(0, 5);
      this.generalForm.get('zipCode')?.setValue(value.slice(0, 5));
    }
  }

  limitFamilyZipCodeLength(event: any) {
    let value = event.target.value;
    if (value.length > 5) {
      event.target.value = value.slice(0, 5);
      this.familyMemberForm.get('zipCode')?.setValue(value.slice(0, 5));
    }
  }

  limitEmergencyZipCodeLength(event: any) {
    let value = event.target.value;
    if (value.length > 5) {
      event.target.value = value.slice(0, 5);
      this.emergencyContactForm.get('zipCode')?.setValue(value.slice(0, 5));
    }
  }

  getEthnicityDropdownList() {
    this.patientService.getEthnicityList().subscribe((response: any) => {
      this.ethnicityList = response
    })
  }
  getRaceDropdownList() {
    this.patientService.getRaceList().subscribe((response: any) => {
      this.raceList = response
    })
  }
  getSecondaryRaceDropdownList() {
    this.patientService.getSecondaryRaceList().subscribe((response: any) => {
      this.secondaryRaceList = response
    })
  }
  onAddressChange(event: any): void {
    const query = event.target.value;
    if (query.length > 2) {
      this.providerService.getAddressSearch(query).subscribe((response: any) => {

        this.suggestions = response
      });

    } else {
      this.suggestions = [];
    }
  }

  selectSuggestion(suggestion: any): void {
    this.generalForm.get('address')?.setValue(suggestion.address);
    this.suggestions = [];
    this.selectedIndex = -1;

    const postalCode = suggestion.postalCode?.includes('-')
      ? suggestion.postalCode.split('-')[0]
      : suggestion.postalCode;
    const country = suggestion.country;

    this.states.forEach((temp) => {
      if (temp.name === suggestion.state) {
        this.generalForm.patchValue({ stateId: temp.id });
      }
    });

    this.generalForm.patchValue({
      address: suggestion.address,
      city: suggestion.city,
      zipCode: postalCode,
      country: country // Use the extracted country
    });

    this.suggestions = []; // Clear suggestions after selection
  }

  address1Suggestions = []
  onAddressChangeInFamilyMember(event: any): void {
    const query = event.target.value;
    if (query.length > 2) {
      this.providerService.getAddressSearch(query).subscribe((response: any) => {

        this.address1Suggestions = response
      });

    } else {
      this.suggestions = [];
    }
  }
  selectSuggestionFamilyMember(suggestion: any): void {
    this.familyMemberForm.get('address')?.setValue(suggestion.address);
    this.address1Suggestions = [];
    this.selectedIndex = -1;
    const postalCode = suggestion.postalCode?.includes('-')
      ? suggestion.postalCode.split('-')[0]
      : suggestion.postalCode;
    const country = suggestion.country;
    this.states.map((temp) => {
      if (temp.name == suggestion.state) {
        const StateId = temp.id
        this.familyMemberForm.patchValue({
          stateId: StateId
        }
        )
      }
    })
    this.familyMemberForm.patchValue({
      address: suggestion.address,
      city: suggestion.city,
      zipCode: postalCode,

      country: country  // Use the extracted country

    });

    this.address1Suggestions = [];  // Clear suggestions once an address is selected

  }
  selectSuggestionEmergencyContact(suggestion: any): void {
    this.address2Suggestions = [];
    const postalCode = suggestion.postalCode?.includes('-')
      ? suggestion.postalCode.split('-')[0]
      : suggestion.postalCode;
    const country = suggestion.country;
    this.states.map((temp) => {
      if (temp.name == suggestion.state) {
        const StateId = temp.id
        this.emergencyContactForm.patchValue({
          stateId: StateId
        }
        )
      }
    })
    this.emergencyContactForm.patchValue({
      address: suggestion.address,
      city: suggestion.city,
      zipCode: postalCode,

      country: country  // Use the extracted country

    });

    this.address2Suggestions = [];  // Clear suggestions once an address is selected

  }

  address2Suggestions = []
  onAddressChangeInEmergencyContact(event: any): void {

    const query = event.target.value;
    if (query.length > 2) {
      this.providerService.getAddressSearch(query).subscribe((response: any) => {

        this.address2Suggestions = response
      });

    } else {
      this.suggestions = [];
    }
  }

  getPatientUniqueCode(): void {
    this.patientService.getPatientUniqueCode().subscribe(
      (response: any) => {
        this.generalForm.get('patientUniqueId').setValue(response.patientUniqueId);  // Set the unique code from response

      },
      (error) => {
        console.error('Error fetching unique code:', error);
      }
    );
  }
  getFamilyUniqueCode(): void {
    this.patientService.getFamilyUniqueCode().subscribe(
      (response: any) => {
        console.log("mydata: ", response)
        this.familyMemberForm.get('uniqueId').setValue(response.uniqueId);  // Set the unique code from response

      },
      (error) => {
        console.error('Error fetching unique code for family:', error);
      }
    );
  }
  getEmergencyContactUniqueId(): void {

    this.patientService.getEmergencyContactUniqueId().subscribe(
      (response: any) => {
        console.log("mydata: ", response)
        this.emergencyContactForm.get('uniqueId').setValue(response.uniqueId);  // Set the unique code from response

      },
      (error) => {
        console.error('Error fetching unique code for emergency contact:', error);
      }
    );
  }
  getState() {
    this.patientService.getState().subscribe((data: any) => {
      this.states = data.items;
      console.log("states :", this.state)
    });
  }

  getStateId(city: string, countryCode: any, type: number) {
    this.patientService.getStateByCityAndCountry(city, countryCode).subscribe((response: any) => {
      // Extract the state from the response
      const findState = this.patientService.getStateFromResponse(response.items);
      ;
      const state = this.states.find(state => state.name === findState);
      if (state) {
        // Check the type and patch the corresponding form
        if (type === 1) {
          // Patch generalForm if type is 1
          this.generalForm.patchValue({
            stateId: state.id,
          });
        } else if (type === 2) {
          // Patch familyMemberForm if type is 2
          this.familyMemberForm.patchValue({
            stateId: state.id,
          });
        } else if (type === 3) {
          // Patch emergencyContactForm if type is 3
          this.emergencyContactForm.patchValue({
            stateId: state.id,
          });
        } else {
          console.log('Unknown type:', type);
        }
      } else {
        console.log('State not found');
        return null; // Return null if no state is found
      }
    });
  }




  getLanguage() {
    this.patientService.getLanguage().subscribe((data: any) => {
      this.languages = data.items;
      console.log("languages :", this.language)
    });
  }
  // onProfileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.generalForm.get(`profilePictureName`).setValue(file)
  //   }
  // }

  profilePicture = []
  onProfileSelected(event: any) {

    this.profilePicture = []
    const file = event.target.files[0];
    if (file) {
      this.profilePicture.push(file)
    }
  }

  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }
  deleteImage(file) {
    this.patientService.deletePatientProfle(file.userId).subscribe((data: any) => {
      this.editProfilePicture = null
      this.notificationService.showSuccess("Profile Picture Deleted Successfully");
    })

  }

  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.generalForm.get('phoneNumber').setValue(formattedValue);
  }



  PostGeneralInformation() {
    this.isLoading2 = true;
    if (this.generalForm.valid) {
      // Collect form data
      const generalForm = this.generalForm.value;
      if (!generalForm.middleName || generalForm.middleName.toLowerCase() === 'null') {
        generalForm.middleName = '';
      }
      ;
      if (generalForm.phoneNumber) {
        generalForm.phoneNumber = generalForm.phoneNumber.replace(/\D/g, '');
      }

      generalForm.userId = this.userId;
      const formData = new FormData();

      // Append form data fields
      Object.keys(generalForm).forEach(key => {
        formData.append(key, generalForm[key]);
      });

      // Append profile pictures to formData
      for (let i = 0; i < this.profilePicture.length; i++) {
        formData.append('profilePictureName', this.profilePicture[i]);
      }

      // if (this.generalForm.value.middleName === '' || this.generalForm.value.middleName === 'null') {
      //   this.generalForm.value.middleName = null;
      // }

      this.patientService.postPatientGeneralInformation(formData).subscribe(
        (response: any) => {
          console.log('Post successful', response);

          // Check if the patient ID is null
          if (this.generalForm.value.id == 0) {
            this.notificationService.showSuccess("Patient General Information added successfully.");
          } else {
            this.notificationService.showSuccess("Patient General Information updated successfully.");
          }
          this.isLoading2 = false;
          this.generalForm.reset();
          this.getPatientInformationById();

          // Redirect to the next tab (Emergency Contact)
          this.tabGroup.selectedIndex = 1; // Switch to the next tab
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
          this.isLoading2 = false;
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.generalForm.markAllAsTouched();
      this.isLoading2 = false;// Mark all fields as touched to show validation errors
    }
  }







  PostEmergencyContact() {
    ;
    this.isLoading1 = true;
    if (this.emergencyContactForm.valid) {
      // Collect form data
      const emergencyContactForm = this.emergencyContactForm.value;
      emergencyContactForm.userId = this.userId;

      if (typeof emergencyContactForm.zipCode === 'number') {
        emergencyContactForm.zipCode = emergencyContactForm.zipCode.toString();
      }

      this.patientService.postEmergencyContact(emergencyContactForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
          // Check if the doctor profile ID is null
          if (this.emergencyContactForm.value.id == 0) {
            this.notificationService.showSuccess("Emergency Contact added successfully");
          } else {
            this.notificationService.showSuccess("Emergency Contact Updated Successfully");
          }
          this.isLoading1 = false;

          // this.emergencyContactForm.reset();
          this.getEmergencyContactById;
          // this.getEmergencyContactUniqueId()
          // Redirect to the next tab (if any) or perform further actions
          // this.tabGroup.selectedIndex = 2;
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
          this.isLoading1 = false;
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.emergencyContactForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
      this.isLoading1 = false;
    }
  }

  pastDateValidator(control: AbstractControl) {
    if (control.value) {
      const selectedDate = new Date(control.value);
      const currentDate = new Date();

      if (selectedDate > currentDate) {
        return { futureDate: true }; // Return an error object if date is in the future
      }
    }
    return null; // No error if the date is valid
  }

  formatMobileNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.emergencyContactForm.patchValue({
      phoneNumber: formattedValue
    });
  }

  postFamilyMember() {
    this.isLoading = true;
    ;
    if (this.familyMemberForm.valid) {
      // Collect form data
      const familyMemberForm = { ...this.familyMemberForm.value }; // Create a shallow copy of the form data

      // Convert zipCode from number to string
      if (typeof familyMemberForm.zipCode === 'number') {
        familyMemberForm.zipCode = familyMemberForm.zipCode.toString();
      }
      familyMemberForm.languageId = familyMemberForm.languageId
        ? parseInt(familyMemberForm.languageId, 10) || null
        : null;
      familyMemberForm.userId = this.userId;

      ;
      this.patientService.postFamilyMember(familyMemberForm).subscribe(
        (response: any) => {
          console.log('Family member Post successful', response);

          // Call getFamilyMemberList after successful post
          this.getFamilyMemberList();
          this.getFamilyUniqueCode();
          // this.tabGroup.selectedIndex = 2;

          if (this.familyMemberForm.value.id == 0) {
            this.notificationService.showSuccess("Patient Family Member Information Post Successfully");
          } else {
            this.notificationService.showSuccess("Patient Family Member Information Updated Successfully");
          }
          this.isLoading = false;
          this.familyMemberForm.reset();
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
          this.isLoading = false;
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.familyMemberForm.markAllAsTouched();
      this.isLoading = false;
    }
  }

  formatNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.familyMemberForm.patchValue({
      phoneNumber: formattedValue
    });
  }

  getEmergencyContactById() {
    ;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getEmergencyContactById(userInfo.userId).subscribe((data: any) => {
      if (data) { // Check if data is not null or undefined
        console.log("This is emergency contact", data);
        this.emergencyContactForm.patchValue(data); // Patch the data to the form
      } else {
        console.log("No emergency contact found");
      }
    }, (error) => {
      this.getEmergencyContactUniqueId()
      console.error("Error fetching emergency contact", error);
    });
  }

  getPatientInformationById() {
    const userInfo = this.authService.getUserInfo()
    const formattedPhone = this.globalModalService.formatPhoneNumberForDisplay(userInfo.phoneNumber);
    userInfo.phoneNumber = formattedPhone;
    console.log('userinfo', userInfo)
    this.generalForm.patchValue(userInfo)
    this.patientService.getPatientInformationById(userInfo?.userId).subscribe((data: any) => {
      if (data) {

        const dateOfBirth = data.dateOfBirth;
        const formattedDate = this.datePipe.transform(dateOfBirth, 'yyyy-MM-dd');

        const formattedPhone = this.globalModalService.formatPhoneNumberForDisplay(data.phoneNumber);
        data.phoneNumber = formattedPhone;
        data.dateOfBirth = formattedDate
        if (data.profilePictureName != null) {
          const editProfilePicture = {
            userId: this.userId,
            filePath: environment.fileUrl + data.profilePicturePath,
            fileName: data.profilePictureName
          };
          this.editProfilePicture = editProfilePicture
          this.showEditTimeFile = false
        }

        this.generalForm.patchValue(data);

      }


    }, (error) => {
      this.getPatientUniqueCode();
      console.error("Error fetching patient general information data", error);
    });

  }




  getFamilyMemberList() {
    ;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getFamilyMember(userInfo.userId).subscribe((data: any) => {
      this.familyMemberData = data.patientFamilyMember;
      console.log("family data:", this.familyMemberData)
    })
  }


  editItem(index: number) {
    ;
    const editData = { ...this.familyMemberData[index] };

    if (editData.dob) {
      editData.dob = new Date(editData.dob).toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    }

    this.familyMemberForm.patchValue(editData);
    // ✅ Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }



  deleteItem(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Family Member'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getFamilyMemberList();
    });
  }

  selectedIndex = -1;

  onKeyDown(event: KeyboardEvent) {
    if (this.address1Suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.address1Suggestions.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.address1Suggestions.length) % this.address1Suggestions.length;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.selectedIndex >= 0) {
      this.selectSuggestionFamilyMember(this.address1Suggestions[this.selectedIndex]);
      event.preventDefault();
    }

    // 🟢 Auto-scroll active item into view
    setTimeout(() => {
      const activeElement = document.querySelector('.address1-suggestion-list .active');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  }


  onKeyDown1(event: KeyboardEvent) {
    if (this.suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.selectedIndex >= 0) {
      this.selectSuggestionAddress(this.suggestions[this.selectedIndex]);
      event.preventDefault();
    }

    // 🟢 Auto-scroll active item into view
    setTimeout(() => {
      const activeElement = document.querySelector('.suggestion-list .active');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  }


  selectSuggestionAddress(suggestion: any): void {
    this.generalForm.get('address')?.setValue(suggestion.address);
    this.suggestions = [];
    this.selectedIndex = -1;
    const postalCode = suggestion.postalCode?.includes('-')
      ? suggestion.postalCode.split('-')[0]
      : suggestion.postalCode;
    const country = suggestion.country;
    this.states.map((temp) => {
      if (temp.name == suggestion.state) {
        const StateId = temp.id
        this.generalForm.patchValue({
          stateId: StateId
        }
        )
      }
    })
    this.generalForm.patchValue({
      address: suggestion.address,
      city: suggestion.city,
      zipCode: postalCode,

      country: country  // Use the extracted country

    });

    this.suggestions = [];  // Clear suggestions once an address is selected

  }


  selectSuggestionAddress3(suggestion: any): void {
    this.emergencyContactForm.get('address')?.setValue(suggestion.address);
    this.address2Suggestions = [];
    this.selectedIndex = -1;
    const postalCode = suggestion.postalCode?.includes('-')
      ? suggestion.postalCode.split('-')[0]
      : suggestion.postalCode;
    const country = suggestion.country;
    this.states.map((temp) => {
      if (temp.name == suggestion.state) {
        const StateId = temp.id
        this.emergencyContactForm.patchValue({
          stateId: StateId
        }
        )
      }
    })
    this.emergencyContactForm.patchValue({
      address: suggestion.address,
      city: suggestion.city,
      zipCode: postalCode,

      country: country

    });

    this.address2Suggestions = [];

  }
  onKeyDown3(event: KeyboardEvent) {
    if (this.address2Suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.address2Suggestions.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.address2Suggestions.length) % this.address2Suggestions.length;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.selectedIndex >= 0) {
      this.selectSuggestionEmergencyContact(this.address2Suggestions[this.selectedIndex]);
      event.preventDefault();
    }

    // 🟢 Auto-scroll active item into view
    setTimeout(() => {
      const activeElement = document.querySelector('.address2-suggestion-list .active');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  }

}

