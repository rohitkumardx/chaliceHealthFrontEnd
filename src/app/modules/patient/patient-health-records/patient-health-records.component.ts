import { DatePipe } from '@angular/common';
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
// import { NgSelectModule } from '@ng-select/ng-select';

enum obj {
  Normal = 1,
  Average = 2,
  Critical = 3,
  Improving = 4

}

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
  selector: 'app-patient-health-records',
  templateUrl: './patient-health-records.component.html',
  styleUrls: ['./patient-health-records.component.css']
})
export class PatientHealthRecordsComponent implements OnInit {

  selectedSpecialties = [];
  isLoading = false;
  allergyForm!: FormGroup;
  vitalForm!: FormGroup;
  socialForm!: FormGroup;
  medicalForm!: FormGroup;
  screeningForm!: any;
  immunisationForm! : any;
  chronicForm!: FormGroup;
  selectedFile: File | null = null;  
  errorMessage: string | null = null;
  userId: any;
  state: any;
  familyMemberData: any;
  language: any;
  states: any[] = [];
  languages: any[] = [];
  showEditTimeFile: boolean;
  editProfilePicture: any;
  allergyData: any;
  vitalData: any;
  socialData: any;
  screeningData : any;
  immunisationData : any;
  medicalHistoryData : any;
  chronicCondition : any;
  ChronicConditionData : any;
  ongoingTreatment: string = ''; 
  obj = Object.keys(obj).filter(key => (Number(key)))
    .map(key => ({
      id: key,
      value: String(obj[key as keyof typeof obj])
        .replace(/([a-z])([A-Z])/g, '$1 $2')
    }));


  // @ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;
  @ViewChild('tabGroup', { static: false }) tabGroup!: MatTabGroup;
 
 
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private authService: AuthService,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService,
    private patientService: PatientService,
  ) { }

  ngOnInit() {
    this.allergyForm = this.fb.group({
      id: ['0'],
      allergyType: ['', Validators.required],
      allergen: ['', Validators.required],
      reaction: ['', Validators.required],
      note: [''],
    })
    this.vitalForm = this.fb.group({
      id: ['0'],
      height: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      weight: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      heartRate: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      bloodPressure: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      bloodPressureDiastolic: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      pulseOximeter: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      respiration: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      temperature: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      vitalDate: ['', Validators.required],

    })
    this.socialForm = this.fb.group({
      id: ['0'],
      alcohol: ['', Validators.required],
      tobacco: ['', Validators.required],
      drugs: ['', Validators.required],
      occupation: ['', Validators.required],
      travel: ['', Validators.required],

    })
    this.medicalForm = this.fb.group({
      id: ['0'],
      conditionName: ['', Validators.required],
      dateOfDiagnosis: ['', Validators.required],
      currentStatus: ['', Validators.required],
      treatmentDetails: ['', Validators.required],

    })

    this.screeningForm = this.fb.group({
      id: ['0'],
      screeningTest: ['', Validators.required],
      datePerformed: ['', Validators.required],
      result: ['', Validators.required],
      nextDueDate: ['', Validators.required],
      notes: ['']

    })
    this.immunisationForm = this.fb.group({
      id: ['0'],
      vaccineName: ['', Validators.required],
      vaccineCode: ['', Validators.required],
      dose: ['', Validators.required],
      lotNumber: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]

    })
    this.chronicForm = this.fb.group({
      id: ['0'],
      conditionName: ['', Validators.required],
      dateOfDiagnosis: ['', Validators.required],
      severity: ['', Validators.required],
      onGoingTreatment: [''],
      notes: [''],

    })
    this.getAllergyDataList();
    this.getVitalDataList();
    this.getSocialDataList();
    this.getMedicalDataList();
    this.getScreeningDataList();
    this.getImmunisationDataList();
    this.getChronicConditionList();

    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    
  }

  postAllergyData() {
    debugger;
    if (this.allergyForm.valid) {
      // Collect form data
      const allergyForm = this.allergyForm.value;
       allergyForm.userId = this.userId;
     

      this.patientService.postAllergyData(allergyForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
          this.getAllergyDataList();
          // Check if the doctor profile ID is null
          if (this.allergyForm.value.id == 0) {
            this.notificationService.showSuccess("Allergy added successfully");
          } else {
            this.notificationService.showSuccess("Allergy Updated Successfully");
          }
          this.allergyForm.reset();
          
         
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.allergyForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  toggleStatus(id: any, status: boolean) {
    debugger;
    const toggledStatus = !status;
    
    this.patientService.allergyStatus(id, toggledStatus).subscribe((response) => {
      this.notificationService.showSuccess("Allergy status updated successfully.");
      this.getAllergyDataList();
    }, (error) => {
      this.notificationService.showDanger("Failed to update allergy status.");
    });
  }
  

  getAllergyDataList() {
    debugger;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientAllergyDataList(userInfo.userId).subscribe((data: any) => {
      this.allergyData = data;
      console.log("allergy data:", this.allergyData)
    })
  }
  editAllergyData(index: number){
    debugger
    const editData = this.allergyData[index]
    this.allergyForm.patchValue(editData)
  }

  deleteAllergyData(id){
     this.patientService.deletePatientAllergyData(id).subscribe(data => {
      this.getAllergyDataList();
      this.notificationService.showSuccess("Deleted successfully");
    });
  }


  postVitalData() {
    debugger;
    if (this.vitalForm.valid) {
      // Collect form data
      const vitalForm = this.vitalForm.value;
      vitalForm.userId = this.userId;

      this.patientService.postVitalData(vitalForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
           this.getVitalDataList();
          // Check if the doctor profile ID is null
          if (this.vitalForm.value.id == 0) {
            this.notificationService.showSuccess("Vital Form added successfully");
          } else {
            this.notificationService.showSuccess("Vital Form updated successfully");
          }
          this.vitalForm.reset();
          
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.vitalForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  getVitalDataList() {
    debugger;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientVitalDataList(userInfo.userId).subscribe((data: any) => {
      this.vitalData = data;
      console.log("vital data:", this.vitalData)
    })
  }

  toggleVitalStatus(id: any, status: boolean) {
    debugger;
    const toggledStatus = !status;
    
    this.patientService.vitalStatus(id, toggledStatus).subscribe((response) => {
      this.notificationService.showSuccess("Vital status updated successfully.");
      this.getVitalDataList();
    }, (error) => {
      this.notificationService.showDanger("Failed to update vital status.");
    });
  }
 
  editVitalData(index: number){
    debugger
    const editVitalData = this.vitalData[index]
    this.vitalForm.patchValue(editVitalData)
  }

  deleteVitalData(id){
    this.patientService.deletePatienVitalData(id).subscribe(data => {
      this.getVitalDataList();
      this.notificationService.showSuccess("Deleted Successfully");
    });
  }

  postSocialData() {
    debugger;
    if (this.socialForm.valid) {
      // Collect form data
      const socialForm = this.socialForm.value;
       socialForm.userId = this.userId;
     
      this.patientService.postSocialData(socialForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
           this.getSocialDataList();
          // Check if the doctor profile ID is null
          if (this.socialForm.value.id == 0) {
            this.notificationService.showSuccess("social form added successfully");
          } else {
            this.notificationService.showSuccess("social form  Updated Successfully");
          }
          this.socialForm.reset();
          
         
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.socialForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  getSocialDataList() {
    debugger;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientSocialDataList(userInfo.userId).subscribe((data: any) => {
      this.socialData = data;
      console.log("Social data:", this.socialData)
    })
  }
  toggleSocialStatus(id: any, status: boolean) {
    debugger;
    const toggledStatus = !status;
    
    this.patientService.socialStatus(id, toggledStatus).subscribe((response) => {
      this.notificationService.showSuccess("Social status updated successfully.");
      this.getSocialDataList();
    }, (error) => {
      this.notificationService.showDanger("Failed to update social status.");
    });
  }

  editSocialData(index: number){
    debugger
    const editSocialData = this.socialData[index]
    this.socialForm.patchValue(editSocialData)
  }

  deleteSocialData(id){
    this.patientService.deletePatientSocialData(id).subscribe(data => {
      this.getSocialDataList();
      this.notificationService.showSuccess("Deleted Successfully");
    });
  }
  postScreeningData() {
    if (this.screeningForm.valid) {
      // Collect form data
      const screeningForm = this.screeningForm.value;  // Use screeningForm, not socialForm
      screeningForm.userId = this.userId;
  
      this.patientService.postScreeningData(screeningForm).subscribe(
        (response: any) => {
          console.log('screening data', response);
          this.getScreeningDataList();
          
          // Show a success notification based on whether it's an add or update operation
          if (this.screeningForm.value.id === 0) {
            this.notificationService.showSuccess("Screening form added successfully");
          } else {
            this.notificationService.showSuccess("Screening form updated successfully");
          }
          this.screeningForm.reset();
  
        
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.screeningForm.markAllAsTouched();  // Mark all fields to show validation errors
    }
  }

  getScreeningDataList() {
    debugger;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientScreeningDataList(userInfo.userId).subscribe((data: any) => {
      this.screeningData = data;
      console.log("Screening data:", this.screeningData)
    })
  }

  editScreeningData(index: number){
    debugger
    const editScreeningData = this.screeningData[index]
    this.screeningForm.patchValue(editScreeningData)
  }

  deleteScreeningData(id){
    this.patientService.deletePatientScreeningData(id).subscribe(data => {
      this.getScreeningDataList();
      this.notificationService.showSuccess("Deleted Successfully");
    });
  }
  

  postImmunisationData(){
    if (this.immunisationForm.valid) {
      // Collect form data
      const immunisationForm = this.immunisationForm.value;  // Use screeningForm, not socialForm
      immunisationForm.userId = this.userId;
  
      this.patientService.postImmunisationData(immunisationForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
           this.getImmunisationDataList();
          
          // Show a success notification based on whether it's an add or update operation
          if (this.immunisationForm.value.id === 0) {
            this.notificationService.showSuccess("immunisation Form added successfully");
          } else {
            this.notificationService.showSuccess("immunisation Form updated successfully");
          }
          this.immunisationForm.reset();
  
         
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.immunisationForm.markAllAsTouched();  // Mark all fields to show validation errors
    }
  }

  getImmunisationDataList() {
    debugger;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientImmunisationDataList(userInfo.userId).subscribe((data: any) => {
      this.immunisationData = data;
      console.log("immunisation data:", this.immunisationData)
    })
  }

  toggleimmunizationStatus(id: any, status: boolean) {
    debugger;
    const toggledStatus = !status;
    
    this.patientService.immunizationStatus(id, toggledStatus).subscribe((response) => {
      this.notificationService.showSuccess("Immunization status updated successfully.");
      this.getImmunisationDataList();
    }, (error) => {
      this.notificationService.showDanger("Failed to update immunization status.");
    });
  }

  editImmunisationData(index: number){
    debugger
    const editImmunisationData = this.immunisationData[index]
    this.immunisationForm.patchValue(editImmunisationData)
  }

  deleteImmunisationData(id){
    this.patientService.deletePatientImmunisationData(id).subscribe(data => {
      this.getImmunisationDataList();
      this.notificationService.showSuccess("Deleted Successfully");
    });
  }

  postMedicalData(){
    if (this.medicalForm.valid) {
      // Collect form data
      const medicalForm = this.medicalForm.value;  // Use screeningForm, not socialForm
      medicalForm.userId = this.userId;
  
      this.patientService.postMedicalData(medicalForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
           this.getMedicalDataList();
          
          // Show a success notification based on whether it's an add or update operation
          if (this.medicalForm.value.id === 0) {
            this.notificationService.showSuccess("medical Form added successfully");
          } else {
            this.notificationService.showSuccess("medical Form updated successfully");
          }
          this.medicalForm.reset();
  
         
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.medicalForm.markAllAsTouched();  // Mark all fields to show validation errors
    }
  }

  getMedicalDataList() {
    debugger;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientMedicalHistoryDataList(userInfo.userId).subscribe((data: any) => {
      this.medicalHistoryData = data;
      console.log("medical history data:", this.medicalHistoryData)
    })
  }

  editMedicalHistoryData(index: number){
    debugger
    const editMedicalHistoryData = this.medicalHistoryData[index]
    this.medicalForm.patchValue(editMedicalHistoryData)
    this.medicalForm.get('currentStatus').setValue(editMedicalHistoryData.status)
  }

  deleteMedicalHistoryData(id){
    this.patientService.deletePatientMedicalHistoryData(id).subscribe(data => {
      this.getMedicalDataList();
      this.notificationService.showSuccess("Deleted Successfully");
    });
  }





  postChronicConditionData(){
    debugger;
    if (this.chronicForm.valid) {
      // Collect form data
      const chronicForm = this.chronicForm.value;  // Use screeningForm, not socialForm
      chronicForm.userId = this.userId;
  
      this.patientService.postChronicConditionData(chronicForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
           this.getChronicConditionList();
          
          // Show a success notification based on whether it's an add or update operation
          if (this.chronicForm.value.id === 0) {
            this.notificationService.showSuccess("Chronic condition Form added successfully");
          } else {
            this.notificationService.showSuccess("Chronic condition Form updated successfully");
          }
           this.chronicForm.reset();
  
        
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.chronicForm.markAllAsTouched();  // Mark all fields to show validation errors
    }
  }

  getChronicConditionList() {
    debugger;
    const userInfo = this.authService.getUserInfo()
    this.patientService.getChronicConditionDataList(userInfo.userId).subscribe((data: any) => {
      this.chronicCondition = data;
      console.log("chronic condition data:", this.chronicCondition)
    })
  }

  editChronicConditionData(index: number){
    debugger
    const editChronicConditionData = this.chronicCondition[index]
    this.chronicForm.patchValue(editChronicConditionData)
  }

  deleteChronicConditionData(id){
    this.patientService.deleteChronicConditionData(id).subscribe(data => {
      this.getChronicConditionList();
      this.notificationService.showSuccess("Deleted Successfully");
    });
  }


 



  formatPhoneNumber(event: any): void {
    // const input = event.target as HTMLInputElement;
    // const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    // this.generalForm.get('phoneNumber').setValue(formattedValue);
  }

  formatMobileNumber(id){}

  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }
  deleteImage(file){

  }
   onProfileSelected(event: any) {
    // const file = event.target.files[0];
    // if (file) {
    //   this.generalForm.get(`profilePictureName`).setValue(file)
    // }
  }

}
