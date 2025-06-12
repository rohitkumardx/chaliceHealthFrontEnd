import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { ProviderMedicalLicenseInfoComponent } from '../provider-medical-license-info/provider-medical-license-info.component';
import { ProviderDocumentsComponent } from '../provider-documents/provider-documents.component';



@Component({
  selector: 'app-provider-services',
  templateUrl: './provider-services.component.html',
  styleUrls: ['./provider-services.component.css']
})
export class ProviderServicesComponent implements OnInit {

  serviceForm!: FormGroup
  specialitySeviceForm!: FormGroup
  loading: boolean = false;
  loading1: boolean = false;
  specialities: any
  @Output() dialogClosed = new EventEmitter<void>();
  userId : any
  userInfo :any

  constructor(private fb: FormBuilder,
    public activeModel: NgbActiveModal,
    public notificationService: NotificationService,
    public authService: AuthService,
        private modalService: NgbModal,
    public providerService: ProviderService
  ) { }

  ngOnInit() {

    this.serviceForm = this.fb.group({
      serviceInterestedType: ['', Validators.required],
      serviceDuration: ['', Validators.required],
      telehealthVisitPrice: ['', Validators.required],
      visitExistingPatient: [''],
      inHomeVisitPrice: [''],
      officeVisitPrice: [''],
      agesTreated: [''],
      servicePricing: [''],
    });

    const userInfo = this.authService.getUserInfo()
    this.userInfo = userInfo
    if (userInfo.accountType == "IndependentProvider") {
      this.userId = userInfo.userId
   
    }
    if (localStorage.getItem('NewProviderId')){
      this.userId = localStorage.getItem('NewProviderId')
    }
    if(userInfo.accountType != "IndependentProvider" && !localStorage.getItem('NewProviderId')){
      this.userId = userInfo.userId
    }

    this.getSpecialityDropDown()
    this.getEditServiceData()
  }

  isTooltipVisible = false;

  showTooltip() {
    this.isTooltipVisible = true;
  }

  hideTooltip() {
    this.isTooltipVisible = false;
  }

  toggleTooltip() {
    this.isTooltipVisible = !this.isTooltipVisible;
  }


  isDisabled : boolean = false
  getEditServiceData() {
    this.providerService.getServiceDataById(this.userId).subscribe((response: any) => {
     
      this.serviceForm.patchValue(response)
      if (response.serviceDetail != null) {
        this.serviceRows = [];
        response.serviceDetail.forEach((item: any) => {
          this.serviceRows.push({
            specialtyServiceId: item.specialtyServiceId,
            price: item.price
          });
        });
      }

      // this.serviceForm.disable();
      // this.isDisabled = true
    })
  }
  serviceRows = [{ specialtyServiceId: '', price: null }];
  validationMessages = [{ specialtyServiceId: false, price: false }];

  addService(index: number) {
    const currentService = this.serviceRows[index];
    if (currentService.specialtyServiceId && currentService.price) {
      this.validationMessages[index] = { specialtyServiceId: false, price: false };

      this.serviceRows.push({ specialtyServiceId: '', price: null });
      this.validationMessages.push({ specialtyServiceId: false, price: false });
    } else {

      this.validationMessages[index] = {
        specialtyServiceId: !currentService.specialtyServiceId,
        price: !currentService.price
      };
    }
  }


  deleteService(index: number) {
    if (this.serviceRows.length > 1) {
      this.serviceRows.splice(index, 1);
      this.validationMessages.splice(index, 1);
    }
  }


  getSpecialityDropDown() {
    this.providerService.getSpecialSpeciality().subscribe((response: any) => {
      this.specialities = response
    })
  }

  submitData() {
    if (this.serviceForm.invalid) {
      this.notificationService.markFormGroupTouched(this.serviceForm);
      return;
    }
    this.loading = true;
    const serviceForm = this.serviceForm.value;
    serviceForm.serviceDuration = Number(serviceForm.serviceDuration);
    if (typeof serviceForm.serviceInterestedType === 'number') {
      serviceForm.serviceInterestedType = serviceForm.serviceInterestedType.toString();
    }
    if (typeof serviceForm.telehealthVisitPrice === 'number') {
      serviceForm.telehealthVisitPrice = serviceForm.telehealthVisitPrice.toString();
    }
    if (typeof serviceForm.visitExistingPatient === 'number') {
      serviceForm.visitExistingPatient = serviceForm.visitExistingPatient.toString();
    }
    if (typeof serviceForm.inHomeVisitPrice === 'number') {
      serviceForm.inHomeVisitPrice = serviceForm.inHomeVisitPrice.toString();
    }
    if (typeof serviceForm.officeVisitPrice === 'number') {
      serviceForm.officeVisitPrice = serviceForm.officeVisitPrice.toString();
    }

    serviceForm.ServiceDetail = []
    const convertedServiceRows = this.serviceRows
      .filter(row => !(row.price == null))
      .map(row => ({
        ...row,
        specialtyServiceId: Number(row.specialtyServiceId)
      }));

    serviceForm.ServiceDetail.push(...convertedServiceRows);
    this.providerService.postServiceAndPriceData(serviceForm,this.userId).subscribe((data: any) => {
      this.notificationService.showSuccess("Service Info added successfully.");
      if(this.userInfo.accountType == 'Admin'){
        this.openDocumentPopUp();
      }
      else{
        this.modalClose()
      }
      

      
    },
      (error) => {
        this.notificationService.showDanger(getErrorMessage(error));
        this.loading = false;
      }
    )
  }

  openMedicalPopUp() {
    this.activeModel.close();
    this.modalService.open(ProviderMedicalLicenseInfoComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
    openDocumentPopUp() {
      this.activeModel.close();
      this.modalService.open(ProviderDocumentsComponent, {
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
