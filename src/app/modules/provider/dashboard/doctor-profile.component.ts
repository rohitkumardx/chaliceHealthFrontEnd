import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProviderProfileComponent } from '../provider-profile/provider-profile.component';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { ProviderMedicalLicenseInfoComponent } from '../provider-medical-license-info/provider-medical-license-info.component';
import { ProviderServicesComponent } from '../provider-services/provider-services.component';
import { AuthService } from 'src/app/Services/auth.service';
import { ProviderDocumentsComponent } from '../provider-documents/provider-documents.component';
import { ProviderService } from 'src/app/Services/provider.service';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class dashboard implements OnInit {

  userInfo: any

   currentStep: any = 1

  constructor(private modalService: NgbModal,
    private authService: AuthService,
    private providerService: ProviderService,
  ) { }
  ngOnInit() {
    this.userInfo = this.authService.getUserInfo()
     this.getCredentialStatus()
  }

  getCredentialStatus() {
    this.providerService.getCredetialCompletedSteps(this.userInfo.userId).subscribe((response: any) => {
      this.currentStep = response.stepNumber
    })
  }
  openProfilePopUp() {
    this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
  openContactPopUp() {
    this.modalService.open(ContactDetailsComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
  openMedicalPopUp() {
    this.modalService.open(ProviderMedicalLicenseInfoComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }

  openServicePopUp() {
    this.modalService.open(ProviderServicesComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
  openDocumentPopUp() {
    this.modalService.open(ProviderDocumentsComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }


  nextStep(): void {
    if (this.currentStep == 1) {
      const modalRef = this.modalService.open(ProviderProfileComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      // modalRef.componentInstance.unassignedData = obj
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.currentStep++;
      });
    }

    if (this.currentStep == 2) {
      const modalRef = this.modalService.open(ContactDetailsComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      // modalRef.componentInstance.unassignedData = obj
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.currentStep++;
      });
    }

    if (this.currentStep == 3) {
      const modalRef = this.modalService.open(ProviderMedicalLicenseInfoComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      // modalRef.componentInstance.unassignedData = obj
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.currentStep++;
      });
    }

    if (this.currentStep == 4) {
      const modalRef = this.modalService.open(ProviderServicesComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      // modalRef.componentInstance.unassignedData = obj
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.currentStep++;
      });
    }

    if (this.currentStep == 5) {
      const modalRef = this.modalService.open(ProviderDocumentsComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      // modalRef.componentInstance.unassignedData = obj
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.currentStep++;


        if (!localStorage.getItem('enable-calendar')) {
          localStorage.setItem('enable-calendar', 'true');
          window.location.reload();
        } else {
          localStorage.removeItem('enable-calendar');}
      });
    }


  }



  // submit() {
  //   alert("Form submitted!");
  // }
}