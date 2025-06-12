import { DatePipe } from '@angular/common';
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { race } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
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
  immunisationForm!: any;
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
  screeningData: any;
  immunisationData: any;
  medicalHistoryData: any;
  chronicCondition: any;
  ChronicConditionData: any;
  ongoingTreatment: string = '';
  obj = Object.keys(obj).filter(key => (Number(key)))
    .map(key => ({
      id: key,
      value: String(obj[key as keyof typeof obj])
        .replace(/([a-z])([A-Z])/g, '$1 $2')
    }));
  loading: boolean;
  filteredItems = []
  searchTerm = '';
  searchTerm1 = '';
  searchTerm2 = '';
  searchTerm3 = '';
  searchTerm4 = '';
  searchTerm5 = '';
  searchTerm6 = '';

  sortColumn: string = '';
  sortOrder: string = 'asc';
  dynamicDateTime: any;
  _ = _;
  paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  };
  roles: {
    id: number,
    numOfUsers: number,
    name: string,
    status: string
  }[] = [];
  // @ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;
  @ViewChild('tabGroup', { static: false }) tabGroup!: MatTabGroup;


  constructor(
    private router: Router,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private authService: AuthService,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService,
    private patientService: PatientService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.allergyForm = this.fb.group({
      id: ['0'],
      allergyType: [''],
      allergen: [''],
      reaction: [''],
      note: [''],
    })
    this.vitalForm = this.fb.group({
      id: [''],
      height: [],
      weight: [],
      heartRate: [],
      bloodPressure: [],
      bloodPressureDiastolic: [],
      pulseOximeter: [],
      respiration: [],
      temperature: [],
      vitalDate: [],

    })
    this.socialForm = this.fb.group({
      id: ['0'],
      alcohol: [''],
      tobacco: [''],
      drugs: [''],
      occupation: [''],
      travel: [''],

    })
    this.medicalForm = this.fb.group({
      id: ['0'],
      conditionName: [''],
      dateOfDiagnosis: [],
      currentStatus: ['', Validators.required],
      treatmentDetails: [''],

    })

    this.screeningForm = this.fb.group({
      id: ['0'],
      screeningTest: [''],
      datePerformed: [],
      result: ['', Validators.required],
      nextDueDate: [],
      notes: ['']

    })
    this.immunisationForm = this.fb.group({
      id: ['0'],
      vaccineName: [''],
      vaccineCode: [''],
      dose: [''],
      lotNumber: [],
      startDate: [],
      endDate: []

    })
    this.chronicForm = this.fb.group({
      id: ['0'],
      conditionName: [''],
      dateOfDiagnosis: [],
      severity: [''],
      onGoingTreatment: [],
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
  selectedTab: string = ''
  onTabChange(event: any) {
    const selectedIndex = event.index;
    if (selectedIndex === 0) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedTab = 'Allergy';
      this.getAllergyDataList(); 
    } else if (selectedIndex === 1) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedTab = 'Vitals';
      this.getVitalDataList();  
    } else if (selectedIndex === 2) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedTab = 'Social History';
      this.getSocialDataList();  
    }
    else if (selectedIndex === 3) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedTab = 'Medical History';
      this.getMedicalDataList(); 

    }
    else if (selectedIndex === 4) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedTab = 'Screening and preventive care';
      this.getScreeningDataList();  

    }
    else if (selectedIndex === 5) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedTab = 'Immunisations';
      this.getImmunisationDataList(); 

    }
    else if (selectedIndex === 6) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedTab = 'Chronic Condition';
      this.getChronicConditionList(); 

    }

  }
  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }

    if (this.selectedTab == 'Allergy') {
      this.getAllergyDataList();
    }
    if (this.selectedTab == 'Vitals') {
      this.getVitalDataList();
    }
    if (this.selectedTab == 'Social History') {
      this.getSocialDataList();
    }
    if (this.selectedTab == 'Medical History') {
      this.getMedicalDataList();
    }
    if (this.selectedTab == 'Screening and preventive care') {
      this.getScreeningDataList();
    }
    if (this.selectedTab == 'Immunisations') {
      this.getImmunisationDataList();
    }
    if (this.selectedTab == 'Chronic Condition') {
      this.getChronicConditionList();
    }

  }

  expanded = false;

  getShortText(text: string): string {
    if (!text) return '';
    let words = text.split(' ');
    return words.length > 8 ? words.slice(0, 8).join(' ') + '...' : text;
  }


  shouldShowToggle(text: string): boolean {
    return text && text.split(' ').length > 8; // Only show toggle if more than 7 words
  }

  toggleExpand1(event: Event): void {
    event.preventDefault(); // Prevents page reload when clicking the link
    this.expanded = !this.expanded;
  }

  postAllergyData() {

    if (this.allergyForm.valid) {
      // Collect form data
      const allergyForm = this.allergyForm.value;
      allergyForm.userId = this.userId;
      if (this.allergyForm.value.id === null) {
        this.allergyForm.value.id = 0
      }

      this.patientService.postAllergyData(allergyForm).subscribe(
        (response: any) => {
          console.log('Post successful', response);
          this.getAllergyDataList();


          // Check if the doctor profile ID is null
          if (this.allergyForm.value.id === 0 || this.allergyForm.value.id === null) {
            this.notificationService.showSuccess("Allergy added successfully");
          } else {
            this.notificationService.showSuccess("Allergy updated successfully");
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
    this.patientService.getPatientAllergyDataList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      this.allergyData = null;
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.allergyData = data.items;
        if (data && data.items && Array.isArray(data.items)) {
          this.allergyData = data.items;
          this.filteredItems = [...this.allergyData];
        }
      }
      console.log("allergy data:", this.allergyData)
    },
      (error) => {
        console.error("Error fetching today appointments:", error);
      })
  }


  editAllergyData(index: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const editData = this.allergyData[index]
    this.allergyForm.patchValue(editData)
  }

  deleteAllergyData(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Allergy Data'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getAllergyDataList();
    });
  }


  postVitalData() {

    if (this.vitalForm.valid) {
      // Collect form data

      const hasValidValue = this.vitalForm.value
        && Object.values(this.vitalForm.value).some(val => val !== null && val !== undefined && val !== '');
      if (!hasValidValue) {
        const vitalForm = {
          id: 0,
          heartRate: 0,
          bloodPressure: 0,
          bloodPressureDiastolic: 0,
          respiration: 0,
          userId: this.userId
        };
        if (this.vitalForm.value.id === null) {
          this.vitalForm.value.id = 0
        }
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
      }
      else {
        this.vitalForm.value.id = 0
        this.vitalForm.value.userId = this.userId
        console.log(this.vitalForm.value)
        this.patientService.postVitalData(this.vitalForm.value).subscribe(
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
      }



    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.vitalForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  getVitalDataList() {

    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientVitalDataList(this.searchTerm3, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.vitalData = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.vitalData = data.items;
          this.filteredItems = [...this.vitalData];
        }
      }

      // this.vitalData = data;
      console.log("vital data:", this.vitalData)
    })
  }

  toggleVitalStatus(id: any, status: boolean) {

    const toggledStatus = !status;

    this.patientService.vitalStatus(id, toggledStatus).subscribe((response) => {
      this.notificationService.showSuccess("Vital status updated successfully.");
      this.getVitalDataList();
    }, (error) => {
      this.notificationService.showDanger("Failed to update vital status.");
    });
  }

  editVitalData(index: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const editVitalData = this.vitalData[index]
    this.vitalForm.patchValue(editVitalData)
  }

  deleteVitalData(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Vital Data'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getVitalDataList();
    });
  }

  postSocialData() {

    if (this.socialForm.valid) {
      // Collect form data
      const socialForm = this.socialForm.value;
      socialForm.userId = this.userId;
      if (this.socialForm.value.id === null) {
        this.socialForm.value.id = 0
      }
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

    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientSocialDataList(this.searchTerm2, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
         debugger;
          this.socialData=null;
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.socialData = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.socialData = data.items;
          this.filteredItems = [...this.socialData];
        }
      }

      console.log("Social data:", this.socialData)
    })
  }
  toggleSocialStatus(id: any, status: boolean) {

    const toggledStatus = !status;

    this.patientService.socialStatus(id, toggledStatus).subscribe((response) => {
      this.notificationService.showSuccess("Social status updated successfully.");
      this.getSocialDataList();
    }, (error) => {
      this.notificationService.showDanger("Failed to update social status.");
    });
  }

  editSocialData(index: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const editSocialData = this.socialData[index]
    this.socialForm.patchValue(editSocialData)
  }

  deleteSocialData(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Social Data'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getSocialDataList();
    });
  }
  postScreeningData() {
    if (this.screeningForm.valid) {
      // Collect form data
      const screeningForm = this.screeningForm.value;  // Use screeningForm, not socialForm
      screeningForm.userId = this.userId;
      if (this.screeningForm.value.id === null) {
        this.screeningForm.value.id = 0
      }
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

    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientScreeningDataList(this.searchTerm5, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      this.screeningData = null;
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.screeningData = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.screeningData = data.items;
          this.filteredItems = [...this.screeningData];
        }
      }
      // this.screeningData = data;
      console.log("Screening data:", this.screeningData)
    })
  }

  editScreeningData(index: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const editScreeningData = this.screeningData[index]
    this.screeningForm.patchValue(editScreeningData)
  }

  deleteScreeningData(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Screening Data'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getScreeningDataList();
    });
  }


  postImmunisationData() {
    if (this.immunisationForm.valid) {
      // Collect form data
      const immunisationForm = this.immunisationForm.value;  // Use screeningForm, not socialForm
      immunisationForm.userId = this.userId;
      if (this.immunisationForm.value.id === null) {
        this.immunisationForm.value.id = 0
      }
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

    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientImmunisationDataList(this.searchTerm1, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      this.immunisationData = null;
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.immunisationData = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.immunisationData = data.items;
          this.filteredItems = [...this.immunisationData];
        }
      }
      // this.immunisationData = data;
      console.log("immunisation data:", this.immunisationData)
    })
  }



  toggleimmunizationStatus(id: any, status: boolean) {

    const toggledStatus = !status;

    this.patientService.immunizationStatus(id, toggledStatus).subscribe((response) => {
      this.notificationService.showSuccess("Immunization status updated successfully.");
      this.getImmunisationDataList();
    }, (error) => {
      this.notificationService.showDanger("Failed to update immunization status.");
    });
  }

  editImmunisationData(index: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const editImmunisationData = this.immunisationData[index]
    this.immunisationForm.patchValue(editImmunisationData)
  }

  deleteImmunisationData(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Immunization Data'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getImmunisationDataList();
    });
  }

  postMedicalData() {

    if (this.medicalForm.valid) {
      // Collect form data
      const medicalForm = this.medicalForm.value;  // Use screeningForm, not socialForm
      medicalForm.userId = this.userId;
      if (this.medicalForm.value.id === null) {
        this.medicalForm.value.id = 0
      }
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

    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientMedicalHistoryDataList(this.searchTerm4, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
       this.medicalHistoryData = null;
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.medicalHistoryData = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.medicalHistoryData = data.items;
          this.filteredItems = [...this.medicalHistoryData];
        }
      }


      // this.medicalHistoryData = data;
      console.log("medical history data:", this.medicalHistoryData)
    })
  }

  editMedicalHistoryData(index: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const editMedicalHistoryData = this.medicalHistoryData[index]
    this.medicalForm.patchValue(editMedicalHistoryData)
    this.medicalForm.get('currentStatus').setValue(editMedicalHistoryData.status)
  }

  deleteMedicalHistoryData(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Medical History Data'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getMedicalDataList();
    });
  }





  postChronicConditionData() {

    if (this.chronicForm.valid) {
      // Collect form data
      const chronicForm = this.chronicForm.value;  // Use screeningForm, not socialForm
      chronicForm.userId = this.userId;
      if (this.chronicForm.value.id === null) {
        this.chronicForm.value.id = 0
      }

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

    const userInfo = this.authService.getUserInfo()
    this.patientService.getChronicConditionDataList(this.searchTerm6, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      this.chronicCondition = null;
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.chronicCondition = data.items;
        if (data && data.items && Array.isArray(data.items)) {
          this.chronicCondition = data.items;
          this.filteredItems = [...this.chronicCondition];
        }
      }
      // this.chronicCondition = data;
      console.log("chronic condition data:", this.chronicCondition)
    })
  }

  editChronicConditionData(index: number) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const editChronicConditionData = this.chronicCondition[index]
    this.chronicForm.patchValue(editChronicConditionData)
  }

  deleteChronicConditionData(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Chronic Condition Data'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getChronicConditionList();
    });
  }






  formatPhoneNumber(event: any): void {
    // const input = event.target as HTMLInputElement;
    // const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    // this.generalForm.get('phoneNumber').setValue(formattedValue);
  }

  formatMobileNumber(id) { }

  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }
  deleteImage(file) {

  }
  onProfileSelected(event: any) {
    // const file = event.target.files[0];
    // if (file) {
    //   this.generalForm.get(`profilePictureName`).setValue(file)
    // }
  }


  ngAfterViewInit() {
    const buttons = document.querySelectorAll('.mat-mdc-tab-header-pagination');

    buttons.forEach(button => {
      this.renderer.listen(button, 'mouseenter', () => {
        button.setAttribute('title', 'See More');
      });

      this.renderer.listen(button, 'mouseleave', () => {
        button.removeAttribute('title');
      });
    });
  }

  isExpanded: any;
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }




}
