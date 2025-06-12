import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { noWhitespaceValidator } from 'src/app/shared/validators/no-whitespace-validator';
import { getErrorMessage } from 'src/app/utils/httpResponse';
@Component({
  selector: 'app-add-medication',
  templateUrl: './add-medication.component.html',
  styleUrls: ['./add-medication.component.css']
})
export class AddMedicationComponent implements OnInit {
  medicationForm!: FormGroup;
  loading: boolean = false;
  loading1: boolean = false;
  userId: any;
  @Output() dialogClosed = new EventEmitter<void>();
  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private patientService: PatientService,
    private notificationService: NotificationService,
    private authService: AuthService,
  ) { }
  ngOnInit(): void {
    this.medicationForm = this.fb.group({
      id: ['0'],
      drugName: ['', [
        Validators.required,
        Validators.pattern(/.*\S.*/)  // Ensures at least one non-whitespace character
      ]],  // Apply both required and noWhitespaceValidator,
      strength: ['', [Validators.required, noWhitespaceValidator()]],
      startDate: ['', Validators.required],
      duration: ['', Validators.required],
      direction: [''],
    }, { validator: this.dateValidator }
    )
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
  }
  dateValidator(form: AbstractControl) {
    const startDate = form.get('startDate')?.value;
    const duration = form.get('duration')?.value;
    if (startDate && duration && new Date(duration) < new Date(startDate)) {
      form.get('duration')?.setErrors({ dateInvalid: true });
    } else {
      form.get('duration')?.setErrors(null);
    }
    return null;
  }
  postMedicationData() {
    if (this.medicationForm.valid) {
      const medicationForm = this.medicationForm.value;
      medicationForm.userId = this.userId;
      this.patientService.postMedicationData(medicationForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
          if (this.medicationForm.value.id == 0) {
            this.notificationService.showSuccess("Medication added successfully");
          } else {
            this.notificationService.showSuccess("Medication Updated Successfully");
          }
          this.medicationForm.reset();
          this.modalClose();
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.medicationForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }
  modalClose(): void {
    this.activeModal.close();
    this.dialogClosed.emit();
  }
  cancel(): void {
    this.activeModal.close();
  }
  medicines: any[] = [];
  search(event: any): void {
    
    this.medicines = []
    const query = event.target.value;
    if (query) {
      this.authService.getMedication(query).subscribe((data: any) => {
        this.medicines = data.medications;
        console.log("This is medicines", this.medicines);
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
    
scrollToSelected() {
  setTimeout(() => {
    const selectedItem = document.querySelector('.medicine-item.active');
    if (selectedItem) {
      selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 0);
}

  
    handleKeydown1(event: KeyboardEvent) {
    if (this.medicines.length === 0) return;
  
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = this.activeIndex === null || this.activeIndex >= this.medicines.length - 1
        ? 0
        : this.activeIndex + 1;
      this.scrollToSelected();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = this.activeIndex === null || this.activeIndex <= 0
        ? this.medicines.length - 1
        : this.activeIndex - 1;
      this.scrollToSelected();
    } else if (event.key === 'Enter' && this.activeIndex !== null) {
 
      this.medicationForm.value.drugName=this.medicines;
    }
  }
  
  selectSuggestion(suggestion: any, index: number): void {
    this.activeIndex = index;
    // this.location = suggestion.address;
    this.medicines = [];
    this.activeIndex = null;
  }
  selectHighlightedMedicine() {
    if (this.activeIndex !== -1 && this.medicines.length > 0) {
      this.selectMedicine(this.medicines[this.activeIndex]);
    }
  }
  selectMedicine(medicine: any): void {
    this.medicationForm.patchValue({
      drugName: medicine,
    });
    this.medicines = [];
  }
}
