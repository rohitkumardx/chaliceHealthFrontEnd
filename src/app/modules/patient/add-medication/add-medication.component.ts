import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
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
      drugName: ['', Validators.required],
      strength: ['', Validators.required],
      startDate: ['', Validators.required],
      duration: ['', Validators.required],
      direction: [''],
    })
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
  }


  postMedicationData() {
    debugger;
    if (this.medicationForm.valid) {
      // Collect form data
      const medicationForm = this.medicationForm.value;
      medicationForm.userId = this.userId;


      this.patientService.postMedicationData(medicationForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
          // this.getAllergyDataList();
          // Check if the doctor profile ID is null
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
}
