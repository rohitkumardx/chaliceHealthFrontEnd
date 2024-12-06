import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

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
  state: any;
  @Output() dialogClosed = new EventEmitter<void>();

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
    private providerService: ProviderService
  ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      city: ['', Validators.required],
      stateId: ['', Validators.required],
      postalCode: ['', [
        Validators.required,
        Validators.maxLength(6),
        Validators.pattern('^[0-9]*$')  
    ]],
      address: ['', Validators.required],
      practiceEmail: ['', [Validators.email]],
      practiceAddress: [''],
      practiceWebsite: ['', websiteUrlValidator()],
      practicePhoneNumber: ['', phonePatternValidator()],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      practiceStateId: [''],
      practiceCity: [''],
      practiceZipCode: ['']
    })
    const userInfo = this.authService.getUserInfo()
    const formattedPhone = this.globalModalService.formatPhoneNumberForDisplay(userInfo.phoneNumber);
    userInfo.phoneNumber = formattedPhone;
    this.contactForm.get('phoneNumber').setValue(userInfo.phoneNumber)
    this.getState();
    this.getEditContactFormData();
    
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
    this.contactForm.patchValue({ address: suggestion });
    this.suggestions = [];  // Clear suggestions once an address is selected
  }

  
  onAddressChange1(event: any): void {
    debugger
    const query = event.target.value; 
  
    if (query.length > 2) {  
      this.http.get(`${this.HERE_API_URL}?q=${query}&apiKey=${this.API_KEY}`)
        .subscribe((response: any) => {
          this.suggestions1 = response.items;
        });
    } else {
      this.suggestions1 = [];
    }
  }
  

  selectSuggestionPractice(suggestion: any): void {
    // Set the selected address in the form
    this.contactForm.patchValue({ practiceAddress: suggestion });
    this.suggestions1 = [];  // Clear suggestions once an address is selected
  }



  getEditContactFormData() {
    this.providerService.getContactDetailsById().subscribe((response: any) => {
      const formattedPhone = this.globalModalService.formatPhoneNumberForDisplay(response.phoneNumber);
      response.phoneNumber = formattedPhone;
      const formattedPhone1 = this.globalModalService.formatPhoneNumberForDisplay(response.practicePhoneNumber);
      response.practicePhoneNumber = formattedPhone1;
      this.contactForm.patchValue(response)
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
    debugger;
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


    const userInfo = this.authService.getUserInfo()
    contactForm.userId = userInfo.userId
    this.providerService.postContactDetails(contactForm).subscribe((resposne: any) => {
      this.notificationService.showSuccess("Contact Info updated successfully.");
      this.modalClose();
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

  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}
