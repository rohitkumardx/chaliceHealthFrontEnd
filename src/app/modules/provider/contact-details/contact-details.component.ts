import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { ProviderMedicalLicenseInfoComponent } from '../provider-medical-license-info/provider-medical-license-info.component';
import { ProviderProfileComponent } from '../provider-profile/provider-profile.component';
 
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
export function websiteUrlValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const urlPattern = /^(https?:\/\/)?(www\.[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?)$/i;
    const valid = urlPattern.test(value);
    return valid ? null : { 'invalidUrlPattern': { value } };
  };
}
 
@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent implements OnInit {
 
  contactForm!: FormGroup
  loading: boolean = false;
  loading1: boolean = false;
  loading2: boolean = false;
  loading3: boolean = false;
  state: any;
  @Output() dialogClosed = new EventEmitter<void>();
  userId: any
  userInfo: any
 
  suggestions: any[] = [];
  suggestions1: any[] = [];
 
  private HERE_API_URL = 'https://autocomplete.search.hereapi.com/v1/autocomplete';
  private API_KEY = 't58P7DlKUdXX1Wlcn1C9bRO7U9t1tC-Y3M2Q1T2m3Ac';
 
  constructor(private fb: FormBuilder,
    private activeModel: NgbActiveModal,
    private patientService: PatientService,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService,
    private authService: AuthService,
    private http: HttpClient,
    private modalService: NgbModal,
    private providerService: ProviderService
  ) { }
 
  ngOnInit() {
    this.contactForm = this.fb.group({
      city: ['', [Validators.required, Validators.pattern(/\S+/)]],
      stateId: ['', Validators.required],
      postalCode: ['', [
        Validators.required,
        Validators.maxLength(5),
        Validators.pattern('^[0-9]*$')
      ]],
      address: ['', [Validators.required, Validators.pattern(/\S+/)]],
      practiceEmail: ['', [Validators.email]],
      practiceAddress: [''],
      practiceWebsite: ['', websiteUrlValidator()],
      practicePhoneNumber: ['', phonePatternValidator()],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      practiceStateId: [],
      practiceCity: [''],
      practiceZipCode: ['']
    })
    const userInfo = this.authService.getUserInfo()
    this.userInfo = userInfo
    if (userInfo.accountType == "IndependentProvider") {
      const formattedPhone = this.globalModalService.formatPhoneNumberForDisplay(userInfo.phoneNumber);
      userInfo.phoneNumber = formattedPhone;
      this.contactForm.get('phoneNumber').setValue(userInfo.phoneNumber)
      this.userId = userInfo.userId
 
    }
    if (localStorage.getItem('NewProviderId')) {
      this.userId = localStorage.getItem('NewProviderId')
    }
    if (userInfo.accountType != "IndependentProvider" && !localStorage.getItem('NewProviderId')) {
      this.userId = userInfo.userId
    }
    this.getState();
    this.getEditContactFormData();
 
  }
 
 
 
 
 
 
 
  onAddressChange1(event: any): void {
    const query = event.target.value;
    if (query.length > 2) {
     this.providerService.getAddressSearch(query).subscribe((response:any)=>{
     
      this.suggestions1 = response
     });
   
    } else {
      this.suggestions = [];
    }
  }
 
 
  selectSuggestionPractice(suggestion: any): void {
     const mainAddress = suggestion.address?.split(",")[0]?.trim();
     const addressWithCountry = mainAddress + ', ' + suggestion.country;
    this.contactForm.get('practiceAddress')?.setValue(addressWithCountry);
    const postalCode = suggestion.postalCode?.includes('-')
      ? suggestion.postalCode.split('-')[0]  // Extract part before the hyphen if present
      : suggestion.postalCode;  // Use the full postal code if no hyphen
 
    const country = suggestion.country; // Ensure country is properly assigned
 
    // this.getStateId(suggestion.city, suggestion.countryCode, 3);
  this.state.map((temp)=>{
    if(temp.name==suggestion.state){
     const StateId=temp.id
     this.contactForm.patchValue({
      practiceStateId:StateId
     }
     )
    }
  })
    this.contactForm.patchValue({
      practiceAddress: addressWithCountry,
      practiceCity: suggestion.city,
      practiceZipCode: postalCode,
   
      country: country  // Use the extracted country
 
    });
 
    this.suggestions = [];  // Clear suggestions once an address is selected
 
  }
 
 
  getStateId(city: string, countryCode: any, type: number) {
    this.patientService.getStateByCityAndCountry(city, countryCode).subscribe((response: any) => {
      // Extract the state from the response
      const findState = this.patientService.getStateFromResponse(response.items);
      ;
      const state = this.state.find(state => state.name === findState);
      if (state) {
        // Check the type and patch the corresponding form
        if (type == 1) {
          this.contactForm.patchValue({
            stateId: state.id,
          });
        } else if (type == 2) {
          this.contactForm.patchValue({
            practiceStateId: state.id,
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
 
  getEditContactFormData() {
    this.providerService.getContactDetailsById(this.userId).subscribe((response: any) => {
      const formattedPhone = this.globalModalService.formatPhoneNumberForDisplay(response.phoneNumber);
      response.phoneNumber = formattedPhone;
      const formattedPhone1 = this.globalModalService.formatPhoneNumberForDisplay(response.practicePhoneNumber);
      response.practicePhoneNumber = formattedPhone1;
      this.contactForm.patchValue(response)
      if (this.userInfo.accountType == 'Admin') {
        // this.contactForm.disable()
      }
 
    })
  }
 
  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.contactForm.get('phoneNumber').setValue(formattedValue);
  }
  formatPracticePhoneNumber(event: any) {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.contactForm.get('practicePhoneNumber').setValue(formattedValue);
  }
  getState() {
    this.patientService.getState().subscribe((data: any) => {
      this.state = data.items;
    })
  }
 
  submitData() {
    ;
    this.notificationService.markFormGroupTouched(this.contactForm);
    if (this.contactForm.invalid) {
      this.notificationService.markFormGroupTouched(this.contactForm);
      return;
    }
    this.loading = true
    const contactForm = this.contactForm.value;
    if (typeof contactForm.postalCode === 'number') {
      contactForm.postalCode = contactForm.postalCode.toString();
    }
    if (typeof contactForm.practiceZipCode === 'number') {
      contactForm.practiceZipCode = contactForm.practiceZipCode.toString();
    }
    if (contactForm.phoneNumber !== undefined && contactForm.phoneNumber !== null && contactForm.phoneNumber !== undefined && contactForm.phoneNumber !== null) {
      contactForm.phoneNumber = contactForm.phoneNumber.replace(/\D/g, '');
      contactForm.practicePhoneNumber = contactForm.practicePhoneNumber.replace(/\D/g, '');
    }
 
    contactForm.userId = this.userId
    this.providerService.postContactDetails(contactForm).subscribe((resposne: any) => {
      this.notificationService.showSuccess("Contact Info updated successfully.");
      if(this.userInfo.accountType == 'Admin'){
        this.openMedicalPopUp();
      }
      else{
        this.modalClose()
      }
      // this.modalClose();
    },
      (error) => {
        this.notificationService.showDanger(getErrorMessage(error));
        this.loading = false;
      }
    )
  }
  cancel() {
    this.activeModel.close();
  }
  openMedicalPopUp() {
    this.activeModel.close();
    this.modalService.open(ProviderMedicalLicenseInfoComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
 
  openProfilePopUp() {
    this.activeModel.close();
    this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
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
    this.contactForm.get('address')?.setValue(addressWithCountry);
    this.suggestions = [];
    this.selectedIndex = -1;
 
    const postalCode = suggestion.postalCode?.includes('-')
      ? suggestion.postalCode.split('-')[0]
      : suggestion.postalCode;
    const country = suggestion.country;
 
    this.state.forEach((temp) => {
      if (temp.name === suggestion.state) {
        this.contactForm.patchValue({ stateId: temp.id });
      }
    });
 
    this.contactForm.patchValue({
      address: addressWithCountry,
      city: suggestion.city,
      postalCode: postalCode,
      country: country // Use the extracted country
    });
 
    this.suggestions = []; // Clear suggestions after selection
  }
}
 
 