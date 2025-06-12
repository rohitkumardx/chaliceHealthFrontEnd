import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';

import {  tap } from 'rxjs/operators';
export function noPastDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // If no value, let required validator handle it

    const selectedDate = new Date(control.value);
    const today = new Date();
    
    // Reset time to 00:00:00 for an accurate date-only comparison
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  };
}
export enum Frequency {
  OnceDaily = 1,
  TwiceDaily = 2,
  ThriceDaily = 3,
  EveryFourHours = 4,
  EverySixHours = 5,
  EveryEightHours = 6,
  AsNeeded = 7,
  Weekly = 8,
  Monthly = 9,
  EveryOtherDay = 10
}

export enum doseForm {
  Tablet = 1,
  Injection = 2,
  Capsule = 3,
  Syrup = 4,
  Gel = 5,
  Inhaler = 6,
}

export enum doseStrength {
  Mg50 = 1,
  Mg100 = 2,
  Mg150 = 3,
  Mg200 = 4,

}


@Component({
  selector: 'app-add-prescription-by-provider',
  templateUrl: './add-prescription-by-provider.component.html',
  styleUrls: ['./add-prescription-by-provider.component.css']
})
export class AddPrescriptionByProviderComponent {


  prescriptionForm!: FormGroup;
  editItemIndex: any;
  Loading = false;
  bookingId : any
  frequencyEnum = Frequency;
  frequencies = Object.keys(Frequency)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
      // Format the key by adding a space before each capital letter
      key: key.replace(/([A-Z])/g, ' $1').trim(),
      value: Frequency[key as keyof typeof Frequency],
    }));


  doses = Object.keys(doseForm).filter((key) => isNaN(Number(key))).map((key) => ({
    key: key,
    value: doseForm[key as keyof typeof doseForm]
  }));

  strength = Object.keys(doseStrength).filter((key) => isNaN(Number(key))).map((key) => ({
    key: key,
    value: doseStrength[key as keyof typeof doseStrength]
  }));
  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    itemsShowLimit: 3,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
  };

  private apiUrl = 'https://api.fda.gov/drug/ndc.json';


  @ViewChild('signaturePad', { static: false }) signaturePad!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  isSignatureFilled = false;

  medicines: any[] = [];
  private searchTerms = new Subject<string>();
  signatureUrl: any;
  hash: any

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private providerService: ProviderService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.prescriptionForm = this.fb.group({
      medicationCode: ['', Validators.required],
      medicationName: ['', Validators.required],
      frequency: ['', Validators.required],
      doseForm: ['', Validators.required],
      doseStrength: ['', Validators.required],
      duration: ['', [Validators.required,,noPastDateValidator()]],
      directionOfUse: ['', Validators.required],
      remarks: [''],
      signature: [''],
      // userId: [''],
      id: ['0']
    })
    this.route.queryParams.subscribe((parama: any) => {
      this.bookingId = parama.appointmentId;
      this.hash = parama.hash;
    });

    if (this.hash) {
      this.providerService.decodeAppointmentId(this.hash).subscribe((response: any) => {
       this.bookingId = response.appointmentId
      })
    }
  }


  search(event: any): void {
    this.medicines = []
    const query = event.target.value;

    if (query) {
      this.authService.getMedication(query).subscribe((data:any)=>{
        
        this.medicines = data.medications;
        console.log("This is medicines",this.medicines);
        this.activeIndex = -1; 
    
      })
     
      this.medicines = []; 
    }
  }
  activeIndex: number = -1;
  navigateList(direction: 'up' | 'down') {
    if (this.medicines.length === 0) return;

    if (direction === 'down') {
        this.activeIndex = (this.activeIndex + 1) % this.medicines.length;
    } else if (direction === 'up') {
        this.activeIndex = (this.activeIndex - 1 + this.medicines.length) % this.medicines.length;
    }
}

selectHighlightedMedicine() {
    if (this.activeIndex !== -1 && this.medicines.length > 0) {
        this.selectMedicine(this.medicines[this.activeIndex]);
    }
}
  selectMedicine(medicine: any): void {
    
    this.prescriptionForm.patchValue({
      medicationName: medicine,
   
    });
    this.medicines = []; 
  }
  removeDuplicates(results: any[]): any[] {
    
    return results.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.generic_name === value.generic_name // Ensure uniqueness based on generic_name
      ))
    );
  }
  searchMedicines(query: string): Observable<any> {
    const url = `${this.apiUrl}?search=generic_name:${query}*&limit=10`;
    return this.http.get<any>(url).pipe(
      tap(response => console.log('API response:', response)) // Log the response for debugging
    );
  }


  getFrequencyKey(value: number): string {
    const key = Object.keys(Frequency).find(
      (key) => Frequency[key as keyof typeof Frequency] === value
    ) || '';

    // Add spaces before each capital letter in the key for display
    return key.replace(/([A-Z])/g, ' $1').trim();
  }

  getDoseStrengthKey(value: number): string {
    return (
      Object.keys(doseStrength).find(
        (key) => doseStrength[key as keyof typeof doseStrength] === value
      ) || ''
    );
  }

  getDoseFormKey(value: number): string {
    return (
      Object.keys(doseForm).find(
        (key) => doseForm[key as keyof typeof doseForm] === value
      ) || ''
    );
  }
  ngAfterViewInit() {
    if (this.signaturePad) {
      this.ctx = this.signaturePad.nativeElement.getContext('2d')!;
    }
  }
  prescriptionsList: any[] = []; // Temporary storage for prescriptions
  postPrescriptionToList() {
    ;
    this.Loading = true;

    if (this.prescriptionForm.invalid) {
      this.notificationService.markFormGroupTouched(this.prescriptionForm);
      this.Loading = false;
      this.notificationService.showDanger('Please fill all the required fields correctly.');
      return;
    }

    if (this.prescriptionForm.valid) {
      const selectedFrequency = Number(this.prescriptionForm.value.frequency);
      const frequencyName = this.getFrequencyKey(selectedFrequency);

      const selectedDoseStrength = Number(this.prescriptionForm.value.doseStrength);
      const doseStrengthName = this.getDoseStrengthKey(selectedDoseStrength);

      const selectedDoseForm = Number(this.prescriptionForm.value.doseForm);
      const doseFormName = this.getDoseFormKey(selectedDoseForm);

      const prescriptionData = {
        medicationCode: this.prescriptionForm.value.medicationCode,
        medicationName: this.prescriptionForm.value.medicationName,
        doseForm: selectedDoseForm,
        doseFormName: doseFormName,
        frequency: selectedFrequency,
        frequencyName: frequencyName, // Set frequency name as a string
        doseStrength: selectedDoseStrength,
        doseStrengthName: doseStrengthName,
        duration: this.prescriptionForm.value.duration,
        directionOfUse: this.prescriptionForm.value.directionOfUse,
        remarks: this.prescriptionForm.value.remarks,
        id: this.prescriptionForm.value.id,
      };

      const existingPrescriptionIndex = this.prescriptionsList.findIndex((_, index) => index === this.editItemIndex);

      if (existingPrescriptionIndex !== -1 && existingPrescriptionIndex !== undefined) {
        this.prescriptionsList[this.editItemIndex] = prescriptionData;
        this.notificationService.showSuccess("Prescription updated successfully.");
      } else {
        this.prescriptionsList.push(prescriptionData);
        this.notificationService.showSuccess("Prescription added successfully.");
      }

      this.Loading = false;
      this.editItemIndex = null;
      this.prescriptionForm.reset();
    }
  }


  editPrescription(index: number) {

    this.editItemIndex = index;
    const prescription = this.prescriptionsList[index];
    this.prescriptionForm.patchValue(prescription);
  }
  deletePrescription(index: number){
    this.prescriptionsList.splice(index, 1);
     this.notificationService.showSuccess("Prescription deleted successfully.");
  }
  
  submitAllPrescriptions() {
    this.saveSignature();  // Ensure the signature is saved before sending the payload
    const payload = {
      bookAppointmentId: this.bookingId,
      prescriptions: this.prescriptionsList,
      signature: this.signature,  // Add the saved signature here
    };
    console.log('payload', payload)
    this.providerService.postPrescription(payload).subscribe(
      (response: any) => {
        this.notificationService.showSuccess("Prescriptions submitted successfully");
        this.prescriptionsList = [];
        this.signature = null;
        window.close();
      },
      (error: any) => {
        this.notificationService.showDanger('Failed to submit prescriptions');
        console.error(error);
      }
    );
  }







  startDrawing(event: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    this.ctx.beginPath();
    this.draw(event); // Start drawing immediately at the initial position
    this.isSignatureFilled = true;
  }

  stopDrawing() {
    this.isDrawing = false;
    this.ctx.beginPath(); // Reset the path after finishing drawing
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;

    // Get the canvas's bounding rectangle to calculate the exact coordinates
    const rect = this.signaturePad.nativeElement.getBoundingClientRect();

    // Calculate x and y positions relative to the canvas
    const x = 'touches' in event ? event.touches[0].clientX - rect.left : (event as MouseEvent).clientX - rect.left;
    const y = 'touches' in event ? event.touches[0].clientY - rect.top : (event as MouseEvent).clientY - rect.top;

    // Draw on the canvas
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }


  clearSignature() {
    this.ctx.clearRect(0, 0, this.signaturePad.nativeElement.width, this.signaturePad.nativeElement.height);
    this.isSignatureFilled = false;  // Reset flag when cleared
  }

  signature: any
  saveSignature() {
    const dataUrl = this.signaturePad.nativeElement.toDataURL('image/png');
    const base64String = dataUrl.split(',')[1];
    this.signature = base64String
    console.log('Signature saved as: ', dataUrl);
  }


}

