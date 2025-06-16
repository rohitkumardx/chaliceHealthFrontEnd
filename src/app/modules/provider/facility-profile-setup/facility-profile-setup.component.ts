import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { ClinicService } from 'src/app/Services/clinic.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
 
export function urlValidator(control: AbstractControl): ValidationErrors | null {
  const url = control.value;
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    control.setValue(`https://${url}`);
  }
  return null;
}
 
@Component({
  selector: 'app-facility-profile-setup',
  templateUrl: './facility-profile-setup.component.html',
  styleUrls: ['./facility-profile-setup.component.css']
})
export class FacilityProfileSetupComponent implements OnInit {
  facilityProfileForm!: FormGroup;
  showEditTimeFile: boolean;
  editProfilePicture: any;
  userId: any;
  state: any;
  states: any[] = [];
  isLoading: boolean = false;
  // ProfilePicture: any;
 
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
    private providerService: ProviderService,
    private patientService: PatientService,
    private clinicService: ClinicService,
    private http: HttpClient,
  ) { }
  ngOnInit() {
    this.facilityProfileForm = this.fb.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      phoneNumber: ['', Validators.required],
      note: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      StateId: ['', Validators.required],
      country: ['', Validators.required],
      // ssn:  ['', [Validators.required, Validators.required]],
      ssn: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]] ,// Only 9 digits allowed
 
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]] ,// Only 5 digits allowed
 
      // postalCode: ['', [Validators.required,Validators.required]],
      dateOfBirth: ['', [Validators.required,Validators.required ]],
      webSiteURL: ['', [Validators.required, urlValidator]],
 
    });
 
    this.facilityProfileForm.patchValue({
      webSiteURL: 'https://'
    })
    this.getState();
    this.getClinicInfo();
    const userInfo = this.authService.getUserInfo()
    console.log("clinic local storage", userInfo)
    if (userInfo) {
      this.facilityProfileForm.patchValue({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phoneNumber: userInfo.phoneNumber,
      });
    }
    this.userId = userInfo.userId
  }
 
  limitZipCodeLength(event: any) {
    let value = event.target.value;
    if (value.length > 5) {
      event.target.value = value.slice(0, 5);
      this.facilityProfileForm.get('postalCode')?.setValue(value.slice(0, 5));
    }
  }
 
  limitSSNLength(event: any) {
    let value = event.target.value;
    if (value.length > 9) {
      event.target.value = value.slice(0, 9);
      this.facilityProfileForm.get('ssn')?.setValue(value.slice(0, 9));
    }
  }
 
  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.facilityProfileForm.get('phoneNumber').setValue(formattedValue);
  }
 
  getClinicInfo() {
    const userInfo = this.authService.getUserInfo();
    const formattedUserPhone = this.globalModalService.formatPhoneNumberForDisplay(userInfo.phoneNumber);
    userInfo.phoneNumber = formattedUserPhone;
 
    console.log('userinfo clinic', userInfo);
    this.facilityProfileForm.patchValue(userInfo);
 
    this.providerService.getClinicInfo().subscribe((data: any) => {
      console.log("This is my profile1", data);
      const dateOfBirth = data.dateOfBirth;
        const formattedDate = this.datePipe.transform(dateOfBirth, 'yyyy-MM-dd');
      const formattedPhone = this.globalModalService.formatPhoneNumberForDisplay(data.phoneNumber);
 
      this.facilityProfileForm.patchValue({
        id: data.id,
        webSiteURL: data.webSiteURL,
        address: data.address,
        city: data.city,
        email: data.email,
        ssn: data.ssn,
        firstName: data.firstName,
        lastName: data.lastName,
        note: data.note ?? '',
        // note: data.note,
        phoneNumber: formattedPhone, // Corrected usage
        profilePictureName: data.profilePictureName,
        profilePicturePath: data.profilePicturePath,
        StateId: data.stateId,
        postalCode:data.postalCode,
        country: data.country,
        dateOfBirth:formattedDate
      });
 
      if (data.profilePictureName != null) {
        this.editProfilePicture = {
          userId: this.userId,
          filePath: environment.fileUrl + data.profilePicturePath,
          fileName: data.profilePictureName
        };
        this.showEditTimeFile = false;
      }
    });
  }
 
 
  getStateId(city: string, countryCode: any, type: number) {
    this.patientService.getStateByCityAndCountry(city, countryCode).subscribe((response: any) => {
      // Extract the state from the response
      const findState = this.patientService.getStateFromResponse(response.items);
     
      const state = this.states.find(state => state.name === findState);
      if (state) {
        this.facilityProfileForm.patchValue({
          StateId: state.id,
        })
      } else {
        console.log('Unknown type:', type);
      }
    })
  }
  PostClinicInformation() {
   
    if (this.facilityProfileForm.valid) {
      this.isLoading = true; // Set loader to true when starting the request
 
      const facilityProfileForm = this.facilityProfileForm.value;
      // if (facilityProfileForm.phoneNumber) {
      //   facilityProfileForm.phoneNumber = facilityProfileForm.phoneNumber.replace(/\D/g, '');
      // }
 
      if (facilityProfileForm.phoneNumber) {
        facilityProfileForm.phoneNumber = facilityProfileForm.phoneNumber.replace(/\D/g, '');
      }
 
      facilityProfileForm.userId = this.userId;
      const formData = new FormData();
 
      // Append form data fields
      Object.keys(facilityProfileForm).forEach((key) => {
        formData.append(key, facilityProfileForm[key]);
      });
 
      // Append profile pictures to formData
      for (let i = 0; i < this.profilePicture.length; i++) {
        formData.append('profilePictureName', this.profilePicture[i]);
      }
 
      this.providerService.postClinicInfo(formData).subscribe(
        (response: any) => {
          console.log('Post successful', response);
 
          // Show success notification
          if (this.facilityProfileForm.value.id == 0) {
            this.notificationService.showSuccess('Provider Information added successfully.');
          } else {
            this.notificationService.showSuccess('Provider Information updated successfully.');
          }
 
          // Check and handle user info from localStorage
          const userInfoString = localStorage.getItem('userInfo');
          if (!userInfoString) {
            console.error('No user info found in local storage');
          } else {
            const userInfo = JSON.parse(userInfoString);
            // Update the planName and subscriptionPlanId as needed
            // localStorage.setItem('userInfo', JSON.stringify(userInfo));
          }
 
          this.getClinicInfo(); // Call your method to fetch clinic info
          this.isLoading = false; // Set loader to false after successful response
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
          this.isLoading = false; // Set loader to false if the request fails
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.facilityProfileForm.markAllAsTouched(); // Show validation errors for all fields
    }
  }
 
 
  formatMobileNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.facilityProfileForm.patchValue({
      phoneNumber: formattedValue
    });
  }
  getState() {
 
    this.patientService.getState().subscribe((response: any) => {
      this.states = response.items;
      console.log("states :", this.state)
    });
  }
 
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
    this.clinicService.deleteClinicProfilePicture(file.userId).subscribe((data: any) => {
      this.editProfilePicture = null
      this.notificationService.showSuccess("Profile Picture Deleted Successfully");
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
 
   selectedIndex = -1;
 
  onKeyDown(event: KeyboardEvent) {
    if (this.suggestions.length === 0) return;
 
    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.selectedIndex >= 0) {
      this.selectSuggestion(this.suggestions[this.selectedIndex]);
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
 
 
    selectSuggestion(suggestion: any): void {
    debugger
     const mainAddress = suggestion.address?.split(",")[0]?.trim();
     const addressWithCountry = mainAddress + ', ' + suggestion.country;
    this.facilityProfileForm.get('address')?.setValue(addressWithCountry);
    this.suggestions = [];
    this.selectedIndex = -1;
 
    const postalCode = suggestion.postalCode?.includes('-')
      ? suggestion.postalCode.split('-')[0]
      : suggestion.postalCode;
    const country = suggestion.country;
 
    this.states.forEach((temp) => {
      if (temp.name === suggestion.state) {
        this.facilityProfileForm.patchValue({ stateId: temp.id });
      }
    });
 
    this.facilityProfileForm.patchValue({
      address: addressWithCountry,
      city: suggestion.city,
      postalCode: postalCode,
      country: country // Use the extracted country
    });
 
    this.suggestions = []; // Clear suggestions after selection
  }
}
 
 