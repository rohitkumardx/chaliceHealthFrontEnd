import { Component, EventEmitter, numberAttribute, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { ProviderServicesComponent } from '../provider-services/provider-services.component';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { AdminService } from 'src/app/Services/admin.service';

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
  selector: 'app-provider-medical-license-info',
  templateUrl: './provider-medical-license-info.component.html',
  styleUrls: ['./provider-medical-license-info.component.css']
})
export class ProviderMedicalLicenseInfoComponent {

  medicalForm!: FormGroup
  collaboratingPhysicianForm!: FormGroup
  loading: boolean = false;
  loading1: boolean = false;
  loading2: boolean = false;
  loading3: boolean = false;
  qualifications: any
  speciality: any
  states: any
  states1: any

  mySelectedItems: string[] = [];
  selectedItems: any[] = [];
  checkedStateIds: any[] = [];
  mySelectedCollboratingItems: string[] = [];
  selectedCollaboratingItems: any[] = [];
  checkedCollaboratingStateIds: any[] = [];
  userId: any
  userInfo: any

  hovering: boolean = false;

  @Output() dialogClosed = new EventEmitter<void>();

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private activeModel: NgbActiveModal,
    private notificationService: NotificationService,
    private providerService: ProviderService,
    private authService: AuthService,
    private patientService: PatientService,
    private globalModalService: GlobalModalService,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.medicalForm = this.fb.group({
      experience: [''],
      NPI: ['', Validators.required],
      qualificationId: ['', Validators.required],
      specialtyId: ['', Validators.required],
      stateId: ['', Validators.required],
      // stateId: [[], Validators.required],
      medicalLicenseNo: ['', Validators.required],
      malpracticeInsurance: ['', Validators.required],
      malpracticeInsurance2: [],
      electronicMailRecord: ['', Validators.required],
      electronicPrescribingSoftware: ['', Validators.required],
      collaboratingPhysician: ['', Validators.required],
      collaboratingPhysician2: [],
      certify: ['', Validators.requiredTrue],
      questions: ['', Validators.required],
    })
    this.collaboratingPhysicianForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', phonePatternValidator()],
      medicalLicenseNo: ['', Validators.required],
      qualificationId: ['', Validators.required],
      specialtyId: ['', Validators.required],
      NPI: ['', Validators.required],
      statesId: ['', Validators.required],

    })

    const userInfo = this.authService.getUserInfo()
    this.userInfo = userInfo
    if (userInfo.accountType == "IndependentProvider") {
      this.userId = userInfo.userId

    }
    if (localStorage.getItem('NewProviderId')) {
      this.userId = localStorage.getItem('NewProviderId')
    }
    if (userInfo.accountType != "IndependentProvider" && !localStorage.getItem('NewProviderId')) {
      this.userId = userInfo.userId
    }



    this.getQualificationDropdown()
    this.getStates();
    this.getSpecialityDropdown()
    this.updateValidation();
    this.updateValidationForCollaborating()
    this.updateValidationForProvideBackground()
    this.updateValidationForCollaboratingSpeciality()
    this.updateValidationForSpeciality()

  }

  isTooltipVisible1 = false;

  showTooltip1() {
    this.isTooltipVisible1 = true;
  }

  hideTooltip1() {
    this.isTooltipVisible1 = false;
  }

  toggleTooltip1() {
    this.isTooltipVisible1 = !this.isTooltipVisible1;
  }

  isTooltipVisible2 = false;

  showTooltip2() {
    this.isTooltipVisible2 = true;
  }

  hideTooltip2() {
    this.isTooltipVisible2 = false;
  }

  toggleTooltip2() {
    this.isTooltipVisible2 = !this.isTooltipVisible2;
  }

  isTooltipVisible3 = false;

  showTooltip3() {
    this.isTooltipVisible3 = true;
  }

  hideTooltip3() {
    this.isTooltipVisible3 = false;
  }

  toggleTooltip3() {
    this.isTooltipVisible3 = !this.isTooltipVisible3;
  }

  isTooltipVisible4 = false;

  showTooltip4() {
    this.isTooltipVisible4 = true;
  }

  hideTooltip4() {
    this.isTooltipVisible4 = false;
  }

  toggleTooltip4() {
    this.isTooltipVisible4 = !this.isTooltipVisible4;
  }

  checkedBGIds = []
  isDisabled: boolean = false
  getMedicalDataById() {

    this.providerService.getMedicalDataById(this.userId).subscribe((response: any) => {
      // Safely format phone number
      response.phoneNumber = response.phoneNumber
        ? this.globalModalService.formatPhoneNumberForDisplay(response.phoneNumber)
        : '';
      if (response != null) {
        response.NPI = Number(response.npi);
        this.medicalForm.patchValue(response)
        this.medicalForm.get('certify').setValue(true)

        response.questions.forEach((item: any) => {
          this.checkedBGIds.push(item)
        })
        this.checkedStateIds = []
        const checkedStateIds = [];

        if (response.stateIds.length > 0) {
          response.stateIds.forEach((item) => {
            checkedStateIds.push(item);
          });
          this.states.forEach((item: any) => {
            if (checkedStateIds.includes(item.id)) {
              item.checked = true
              this.selectedItems.push(item.name);
              this.checkedStateIds.push(item.id);
            }
          });
          this.medicalForm.get('stateId').setValue(this.checkedStateIds)
        }

        const checkedSpecialityIds = [];

        if (response.stateIds.length > 0) {
          response.specialtyId.forEach((item) => {
            checkedSpecialityIds.push(item);
          });

          this.speciality.forEach((item: any) => {
            if (checkedSpecialityIds.includes(item.id)) {
              item.checked = true
              this.selectedSpecialityItems.push(item.name);
              this.checkedSpecialityIds.push(item.id);
            }
          })
        }
        if (response.collaboratingPhysicians != null) {
          response.collaboratingPhysicians.NPI = Number(response.npi);

          this.checkedCollaboratingStateIds = []
          const checkedCollaboratingStateIds = [];

          if (response.collaboratingPhysicians.statesId.length > 0) {
            response.collaboratingPhysicians.statesId.forEach((item) => {
              checkedCollaboratingStateIds.push(item);
            });
            // this.states1.forEach((item: any) => {
            //   if (checkedCollaboratingStateIds.includes(item.id)) {
            //     item.checked = true
            //     this.mySelectedCollboratingItems.push(item.name);
            //     this.checkedCollaboratingStateIds.push(item.id);
            //   }
            // })
            this.states1.forEach((item: any) => {
              if (checkedCollaboratingStateIds.includes(item.id)) {
                item.checked = true
                this.mySelectedCollboratingItems.push(item.name);
                this.checkedCollaboratingStateIds.push(item.id);
              }
            });
            this.collaboratingPhysicianForm.get('statesId').setValue(this.checkedCollaboratingStateIds)
          }


          this.checkedCollaboratingSpecialityIds = []
          const checkedCollaboratingSpecialityIds = [];

          if (response.collaboratingPhysicians.specialtyId.length > 0) {
            response.collaboratingPhysicians.specialtyId.forEach((item) => {
              checkedCollaboratingSpecialityIds.push(item);
            });
            this.speciality1.forEach((item: any) => {
              if (checkedCollaboratingSpecialityIds.includes(item.id)) {
                item.checked = true
                this.selectedCollaboratingSpeciality.push(item.name);
                this.checkedCollaboratingSpecialityIds.push(item.id);
              }
            })
          }

          this.collaboratingPhysicianForm.patchValue(response.collaboratingPhysicians)
        }
        // this.disableAllControls();
        // this.isDisabled = true
      }
    })
  }

  disableAllControls() {
    // Disable the entire medical form
    this.medicalForm.disable();

    // Disable the collaborating physician form if it exists
    if (this.collaboratingPhysicianForm) {
      this.collaboratingPhysicianForm.disable();
    }
  }

  getQualificationDropdown() {
    this.providerService.getQualifications().subscribe((response: any) => {
      this.qualifications = response.items.sort((a: any, b: any) => {
        return a.name.localeCompare(b.name);
      });
    });
  }
  speciality1 = []
  getSpecialityDropdown() {
    this.providerService.getSpeciality().subscribe((response: any) => {
      this.speciality = response
      this.speciality1 = response
    })
  }
  getStates() {
    this.patientService.getState().subscribe((response: any) => {
      this.states = response.items
      this.states1 = response.items
      this.getMedicalDataById();
    })
  }

  // formatPhoneNumber(event: any): void {
  //   const input = event.target as HTMLInputElement;
  //   const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
  //   this.collaboratingPhysicianForm.get('phoneNumber').setValue(formattedValue);
  // }
  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.collaboratingPhysicianForm.get('phoneNumber').setValue(formattedValue);
  }

  checkBackgroundIds = [];
  professionalBackground(value: number, event: any) {
    if (event.target.checked) {
      this.checkBackgroundIds.push(value);
    } else {
      const index = this.checkBackgroundIds.indexOf(value);
      if (index !== -1) {
        this.checkBackgroundIds.splice(index, 1);
      }
    }
    this.medicalForm.get('questions').setValue(this.checkBackgroundIds)
    this.updateValidationForProvideBackground();
  }

  updateValidationForProvideBackground() {
    if (this.checkBackgroundIds.length > 0) {
      this.medicalForm.get('questions').setErrors(null);
    } else {
      this.medicalForm.get('questions').setErrors({ 'required': true });
    }
  }



  submitData() {
    debugger;
    if (this.userInfo.accountType == 'Admin') {
      const medicalForm = this.medicalForm.value
      medicalForm.questions = this.checkBackgroundIds
      medicalForm.experience = String(medicalForm.experience);
      medicalForm.NPI = String(medicalForm.NPI);
      if (medicalForm.collaboratingPhysician == false) {
        medicalForm.collaboratingPhysician2 = false
      }
      if (medicalForm.malpracticeInsurance == false) {
        medicalForm.malpracticeInsurance2 = false
      }


      this.medicalForm.get('malpracticeInsurance')?.valueChanges.subscribe(value => {
        const malpracticeInsurance2Control = this.medicalForm.get('malpracticeInsurance2');
        if (value === true) {
          malpracticeInsurance2Control?.setValidators([Validators.required]);
        } else {
          malpracticeInsurance2Control?.clearValidators();
        }
        malpracticeInsurance2Control?.updateValueAndValidity();
      });

      this.medicalForm.get('collaboratingPhysician')?.valueChanges.subscribe(value => {
        const collaboratingPhysician2Control = this.medicalForm.get('collaboratingPhysician2');
        if (value === true) {
          collaboratingPhysician2Control?.setValidators([Validators.required]);
        } else {
          collaboratingPhysician2Control?.clearValidators();
        }

        collaboratingPhysician2Control?.updateValueAndValidity();
      });
      if (this.medicalForm.invalid) {
        this.notificationService.markFormGroupTouched(this.medicalForm);
        return;
      }
      if (medicalForm.collaboratingPhysician2 == true) {
        if (this.collaboratingPhysicianForm.invalid) {
          this.notificationService.markFormGroupTouched(this.collaboratingPhysicianForm);
          return;
        }
      }
      this.loading = true;
      if (medicalForm.collaboratingPhysician2 == true) {
        medicalForm.CollaboratingPhysicians = this.collaboratingPhysicianForm.value
        medicalForm.CollaboratingPhysicians.NPI = String(medicalForm.CollaboratingPhysicians.NPI)
        if (medicalForm.CollaboratingPhysicians.phoneNumber !== undefined && medicalForm.CollaboratingPhysicians.phoneNumber !== null) {
          medicalForm.CollaboratingPhysicians.phoneNumber = medicalForm.CollaboratingPhysicians.phoneNumber.replace(/\D/g, '');

        }
      }

      if (
        this.collaboratingPhysicianForm.value.phoneNumber !== undefined &&
        this.collaboratingPhysicianForm.value.phoneNumber !== null
      ) {
        this.collaboratingPhysicianForm.patchValue({
          phoneNumber: this.collaboratingPhysicianForm.value.phoneNumber.replace(/\D/g, ''),
          practicePhoneNumber: this.collaboratingPhysicianForm.value.practicePhoneNumber?.replace(/\D/g, '')
        });
      }

      this.adminService.updateMedicalInfo(medicalForm, this.userId).subscribe((response: any) => {
        this.notificationService.showSuccess("Medical License Info updated successfully.");
        if (this.userInfo.accountType == 'Admin') {
          this.openServicePopUp();
        }
        else {
          this.modalClose()
        }
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
          this.loading = false;
        }
      )
    }
    else {
      const medicalForm = this.medicalForm.value
      medicalForm.questions = this.checkBackgroundIds
      medicalForm.experience = String(medicalForm.experience);
      medicalForm.NPI = String(medicalForm.NPI);
      if (medicalForm.collaboratingPhysician == false) {
        medicalForm.collaboratingPhysician2 = false
      }
      if (medicalForm.malpracticeInsurance == false) {
        medicalForm.malpracticeInsurance2 = false
      }


      this.medicalForm.get('malpracticeInsurance')?.valueChanges.subscribe(value => {
        const malpracticeInsurance2Control = this.medicalForm.get('malpracticeInsurance2');
        if (value === true) {
          malpracticeInsurance2Control?.setValidators([Validators.required]);
        } else {
          malpracticeInsurance2Control?.clearValidators();
        }
        malpracticeInsurance2Control?.updateValueAndValidity();
      });

      this.medicalForm.get('collaboratingPhysician')?.valueChanges.subscribe(value => {
        const collaboratingPhysician2Control = this.medicalForm.get('collaboratingPhysician2');
        if (value === true) {
          collaboratingPhysician2Control?.setValidators([Validators.required]);
        } else {
          collaboratingPhysician2Control?.clearValidators();
        }

        collaboratingPhysician2Control?.updateValueAndValidity();
      });
      if (this.medicalForm.invalid) {
        this.notificationService.markFormGroupTouched(this.medicalForm);
        return;
      }
      if (medicalForm.collaboratingPhysician2 == true) {
        if (this.collaboratingPhysicianForm.invalid) {
          this.notificationService.markFormGroupTouched(this.collaboratingPhysicianForm);
          return;
        }
      }
      this.loading = true;
      if (medicalForm.collaboratingPhysician2 == true) {
        medicalForm.CollaboratingPhysicians = this.collaboratingPhysicianForm.value
        medicalForm.CollaboratingPhysicians.NPI = String(medicalForm.CollaboratingPhysicians.NPI)
        if (medicalForm.CollaboratingPhysicians.phoneNumber !== undefined && medicalForm.CollaboratingPhysicians.phoneNumber !== null) {
          medicalForm.CollaboratingPhysicians.phoneNumber = medicalForm.CollaboratingPhysicians.phoneNumber.replace(/\D/g, '');

        }
      }
           if (
        this.collaboratingPhysicianForm.value.phoneNumber !== undefined &&
        this.collaboratingPhysicianForm.value.phoneNumber !== null
      ) {
        this.collaboratingPhysicianForm.patchValue({
          phoneNumber: this.collaboratingPhysicianForm.value.phoneNumber.replace(/\D/g, ''),
          practicePhoneNumber: this.collaboratingPhysicianForm.value.practicePhoneNumber?.replace(/\D/g, '')
        });
      }
      this.providerService.postMedicalLicenseInfo(medicalForm, this.userId).subscribe((response: any) => {
        this.notificationService.showSuccess("Medical License Info updated successfully.");
        if (this.userInfo.accountType == 'Admin') {
          this.openServicePopUp();
        }
        else {
          this.modalClose()
        }
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
          this.loading = false;
        }
      )
    }

  }



  handleCB(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.mySelectedItems.push(checkbox.value);
    } else {
      this.mySelectedItems = this.mySelectedItems.filter(item => item !== checkbox.value);
    }

    const dropdownButton = document.getElementById('multiSelectDropdown') as HTMLElement;
    dropdownButton.innerText = this.mySelectedItems.length > 0
      ? this.mySelectedItems.join(', ')
      : 'Select Items';
  }



  updateValidation() {
    if (this.selectedItems.length > 0) {
      this.medicalForm.get('stateId').setErrors(null);
    } else {
      this.medicalForm.get('stateId').setErrors({ 'required': true });
    }
  }
  updateValidationForSpeciality() {
    if (this.selectedSpecialityItems.length > 0) {
      this.medicalForm.get('specialtyId').setErrors(null);
    } else {
      this.medicalForm.get('specialtyId').setErrors({ 'required': true });
    }
  }

  updateValidationForCollaboratingSpeciality() {
    if (this.checkedCollaboratingSpecialityIds.length > 0) {
      this.collaboratingPhysicianForm.get('specialtyId').setErrors(null);
    } else {
      this.collaboratingPhysicianForm.get('specialtyId').setErrors({ 'required': true });
    }
  }

  checkboxChange(event: any, clientName: string, stationId: string) {
    if (event.target.checked) {
      this.selectedItems.push(clientName);
      this.checkedStateIds.push(stationId);
    } else {
      const index = this.selectedItems.indexOf(clientName);
      if (index !== -1) {
        this.selectedItems.splice(index, 1);
        this.checkedStateIds.splice(index, 1);
      }
    }
    this.medicalForm.get('stateId').setValue(this.checkedStateIds)
    this.updateValidation();
  }



  checkboxChangeCollborating(event: any, clientName: string, stationId: string) {
    if (event.target.checked) {
      this.selectedCollaboratingItems.push(clientName);
      this.mySelectedCollboratingItems.push(clientName);
      this.checkedCollaboratingStateIds.push(stationId);
    } else {
      // Remove from selectedCollaboratingItems
      const nameIndex = this.selectedCollaboratingItems.indexOf(clientName);
      if (nameIndex !== -1) {
        this.selectedCollaboratingItems.splice(nameIndex, 1);
      }

      // Remove from mySelectedCollboratingItems
      const myNameIndex = this.mySelectedCollboratingItems.indexOf(clientName);
      if (myNameIndex !== -1) {
        this.mySelectedCollboratingItems.splice(myNameIndex, 1);
      }

      // Remove from checkedCollaboratingStateIds by stationId
      const stateIndex = this.checkedCollaboratingStateIds.indexOf(stationId);
      if (stateIndex !== -1) {
        this.checkedCollaboratingStateIds.splice(stateIndex, 1);
      }
    }

    this.collaboratingPhysicianForm.get('statesId')?.setValue(this.checkedCollaboratingStateIds);
    this.updateValidationForCollaborating();
  }

  selectedSpecialityItems = []
  checkedSpecialityIds = []
  checkboxChangeOfSpeciality(event: any, name: string, specialtyId: string) {

    if (event.target.checked) {
      this.selectedSpecialityItems.push(name);
      this.checkedSpecialityIds.push(specialtyId);
    } else {
      const index = this.selectedSpecialityItems.indexOf(name);
      if (index !== -1) {
        this.selectedSpecialityItems.splice(index, 1);
        this.checkedSpecialityIds.splice(index, 1);
      }
    }
    this.medicalForm.get('specialtyId').setValue(this.checkedSpecialityIds)
    this.updateValidationForSpeciality();
  }
  selectedCollaboratingSpeciality = []
  checkedCollaboratingSpecialityIds = []
  checkboxChangeCollboratingSpeciality(event: any, name: string, specialtyId: string) {
    if (event.target.checked) {
      this.selectedCollaboratingSpeciality.push(name);
      // this.selectedCollaboratingSpeciality.push(name)
      this.checkedCollaboratingSpecialityIds.push(specialtyId);
    } else {
      const index = this.selectedCollaboratingSpeciality.indexOf(name);
      if (index !== -1) {
        this.selectedCollaboratingSpeciality.splice(index, 1);
        this.checkedCollaboratingSpecialityIds.splice(index, 1);
        // this.mySelectedCollboratingItems.splice(index, 1)
      }
    }
    this.collaboratingPhysicianForm.get('specialtyId').setValue(this.checkedCollaboratingSpecialityIds)
    this.updateValidationForCollaboratingSpeciality();
  }

  updateValidationForCollaborating() {
    // if (this.selectedCollaboratingItems.length > 0) {
    //   this.collaboratingPhysicianForm.get('stateId').setErrors(null);
    // } else {
    //   this.collaboratingPhysicianForm.get('stateId').setErrors({ 'required': true });
    // }
    if (this.selectedCollaboratingItems.length > 0) {
      this.collaboratingPhysicianForm.get('statesId').setErrors(null);
    } else {
      this.collaboratingPhysicianForm.get('statesId').setErrors({ 'required': true });
    }
  }
  getDropdownWidth(): number {
    const button = document.getElementById('multiSelectDropdown');
    if (button) {
      return button.offsetWidth;
    }
    return 0;
  }

  openServicePopUp() {
    this.activeModel.close();
    this.modalService.open(ProviderServicesComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }

  openContactPopUp() {
    this.activeModel.close();
    this.modalService.open(ContactDetailsComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }


  cancel() {
    this.activeModel.close();
  }

  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}
