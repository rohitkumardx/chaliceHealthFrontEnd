import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { race } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
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
  isLoading = false;
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

  private HERE_API_URL = 'https://autocomplete.search.hereapi.com/v1/autocomplete';
  private API_KEY = 't58P7DlKUdXX1Wlcn1C9bRO7U9t1tC-Y3M2Q1T2m3Ac';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private authService: AuthService,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService,
    private patientService: PatientService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.generalForm = this.fb.group({
      id: ['0'],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      patientUniqueId: [{ value: '' }, Validators.required],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      email: [{ value: '' }, [Validators.required, Validators.email]],
      raceId: [''],
      secondaryRaceId: [''],
      gender: ['', Validators.required],
      stateId: ['', Validators.required],
      city: ['', Validators.required],
      ethnicityId: [''],
      dateOfBirth: ['', Validators.required],
      profilePictureName: [''],
      address: ['', Validators.required],
      zipCode: ['', Validators.required]
      // userId: ['']
    })

    this.familyMemberForm = this.fb.group({
      id: ['0'],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      uniqueId: ['', Validators.required],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      email: ['', [Validators.required, Validators.email]],
      race: [''],
      gender: ['', Validators.required],
      stateId: ['', Validators.required],
      city: ['', Validators.required],
      dob: ['', Validators.required],
      address: ['', Validators.required],
      languageId: [''],
      zipCode: ['', Validators.required],
      relationshipType: ['', Validators.required],
      // userId: [''],
    });

    this.emergencyContactForm = this.fb.group({
      id: ['0'],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      uniqueId: ['', Validators.required],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      email: ['', [Validators.required, Validators.email]],
      relationshipType: ['', Validators.required],
      address: ['', Validators.required],
      stateId: ['', Validators.required],
      city: ['', Validators.required],
      zipCode: ['', Validators.required]


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
    debugger
    const query = event.target.value;

    if (query.length > 2) {
      this.http.get(`${this.HERE_API_URL}?q=${query}&apiKey=${this.API_KEY}`)
        .subscribe((response: any) => {
          this.suggestions = response.items;
        });
    } else {
      this.suggestions = [];
    }
  }
  selectSuggestion(suggestion: any): void {
    // Set the selected address in the form
    this.generalForm.patchValue({ address: suggestion });
    this.suggestions = [];  // Clear suggestions once an address is selected
  }

  address1Suggestions = []
  onAddressChangeInFamilyMember(event: any): void {
    debugger
    const query = event.target.value;

    if (query.length > 2) {
      this.http.get(`${this.HERE_API_URL}?q=${query}&apiKey=${this.API_KEY}`)
        .subscribe((response: any) => {
          this.address1Suggestions = response.items;
        });
    } else {
      this.address1Suggestions = [];
    }
  }
  selectSuggestionFamilyMember(suggestion: any): void {
    // Set the selected address in the form
    this.familyMemberForm.patchValue({ address: suggestion });
    this.address1Suggestions = [];  // Clear suggestions once an address is selected
  }
  selectSuggestionEmergencyContact(suggestion: any): void {
    // Set the selected address in the form
    this.emergencyContactForm.patchValue({ address: suggestion });
    this.address2Suggestions = [];  // Clear suggestions once an address is selected
  }

  address2Suggestions = []
  onAddressChangeInEmergencyContact(event: any): void {
    debugger
    const query = event.target.value;

    if (query.length > 2) {
      this.http.get(`${this.HERE_API_URL}?q=${query}&apiKey=${this.API_KEY}`)
        .subscribe((response: any) => {
          this.address2Suggestions = response.items;
        });
    } else {
      this.address2Suggestions = [];
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
    debugger
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
    debugger
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
      this.notificationService.showSuccess("Image deleted");
    })

  }

  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.generalForm.get('phoneNumber').setValue(formattedValue);
  }


  PostGeneralInformation() {
    if (this.generalForm.valid) {
      // Collect form data
      const generalForm = this.generalForm.value;
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

      this.patientService.postPatientGeneralInformation(formData).subscribe(
        (response: any) => {
          console.log('Post successful', response);

          // Check if the patient ID is null
          if (this.generalForm.value.id == 0) {
            this.notificationService.showSuccess("Patient General Information added successfully.");
          } else {
            this.notificationService.showSuccess("Patient General Information updated successfully.");
          }
          this.generalForm.reset();
          this.getPatientInformationById();

          // Redirect to the next tab (Emergency Contact)
          this.tabGroup.selectedIndex = 1; // Switch to the next tab
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.generalForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  PostEmergencyContact() {
    debugger;
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
          this.emergencyContactForm.reset();
          this.getEmergencyContactById;
          // this.getEmergencyContactUniqueId()
          // Redirect to the next tab (if any) or perform further actions
          // this.tabGroup.selectedIndex = 2;
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.emergencyContactForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  formatMobileNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.emergencyContactForm.patchValue({
      phoneNumber: formattedValue
    });
  }

  postFamilyMember() {
    debugger;
    if (this.familyMemberForm.valid) {
      // Collect form data
      const familyMemberForm = { ...this.familyMemberForm.value }; // Create a shallow copy of the form data

      // Convert zipCode from number to string
      if (typeof familyMemberForm.zipCode === 'number') {
        familyMemberForm.zipCode = familyMemberForm.zipCode.toString();
      }
      familyMemberForm.userId = this.userId;

      debugger;
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
          this.familyMemberForm.reset();
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.familyMemberForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
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
    debugger;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getEmergencyContactById(userInfo.userId).subscribe((data: any) => {
      if (data) { // Check if data is not null or undefined
        console.log("This is emergency contact", data);
        this.emergencyContactForm.patchValue(data); // Patch the data to the form
      } else {
        console.log("No emergency contact found");
        // No need to patch the form as data is null/undefined
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
    this.patientService.getPatientInformationById(userInfo.userId).subscribe((data: any) => {
      if (data) {
        debugger
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
    debugger;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getFamilyMember(userInfo.userId).subscribe((data: any) => {
      this.familyMemberData = data.patientFamilyMember;
      console.log("family data:", this.familyMemberData)
    })
  }
  editItem(index: number) {
    debugger
    const editData = this.familyMemberData[index]
    this.familyMemberForm.patchValue(editData)
  }

  deleteItem(id) {
    this.patientService.deleteFamilyMember(id).subscribe(data => {
      this.getFamilyMemberList();
      this.notificationService.showSuccess("Deleted Successfully");
    });
  }




}
