import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';
import { ClinicService } from 'src/app/Services/clinic.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-delete-popup',
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.css']
})
export class DeletePopupComponent implements OnInit {

  @Input() deletePropertyId: any
  @Input() deleteProperty: any
  @Input() stationId: any
  @Input() type: any
  @Output() dialogClosed = new EventEmitter<void>();

  constructor(public activeModel: NgbActiveModal,
    private clinicService: ClinicService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private providerService: ProviderService,
    private adminService: AdminService
  ) { }
  ngOnInit(): void {
  }

  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }

  delete() {
    if (this.deleteProperty == 'Provider') {
      const userId = this.deletePropertyId;
      this.clinicService.deleteClinicProvider(userId).subscribe((data) => {
        this.notificationService.showSuccess("Provider deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Complaint') {
      const complaintId = this.deletePropertyId;
      this.patientService.deleteComplaintData(complaintId).subscribe((data) => {
        this.notificationService.showSuccess("Complaint deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Document') {
      const id = this.deletePropertyId;
      this.patientService.deletePatientDocument(id).subscribe((data) => {
        this.notificationService.showSuccess("Document deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Allergy Data') {
      const id = this.deletePropertyId;
      this.patientService.deletePatientAllergyData(id).subscribe((data) => {
        this.notificationService.showSuccess("Allergy Data deleted successfully.");
        this.modalClose()
        // This will refresh the whole page
        window.location.reload();
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Vital Data') {
      const id = this.deletePropertyId;
      this.patientService.deletePatienVitalData(id).subscribe((data) => {
        this.notificationService.showSuccess("Vital Data deleted successfully.");
        this.modalClose()
        // This will refresh the whole page
        window.location.reload();
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Social Data') {
      const id = this.deletePropertyId;
      this.patientService.deletePatientSocialData(id).subscribe((data) => {
        this.notificationService.showSuccess("Social Data deleted successfully.");
        this.modalClose();
          // This will refresh the whole page
        window.location.reload();
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Screening Data') {
      const id = this.deletePropertyId;
      this.patientService.deletePatientScreeningData(id).subscribe((data) => {
        this.notificationService.showSuccess("Screening Data deleted successfully.");
        this.modalClose();
          // This will refresh the whole page
        window.location.reload();
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
    if (this.deleteProperty == 'Immunization Data') {
      const id = this.deletePropertyId;
      this.patientService.deletePatientImmunisationData(id).subscribe((data) => {
        this.notificationService.showSuccess("Immunization Data deleted successfully.");
        this.modalClose();
          // This will refresh the whole page
        window.location.reload();
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Medical History Data') {
      const id = this.deletePropertyId;
      this.patientService.deletePatientMedicalHistoryData(id).subscribe((data) => {
        this.notificationService.showSuccess("Medical History Data deleted successfully.");
        this.modalClose();
          // This will refresh the whole page
        window.location.reload();
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Chronic Condition Data') {
      const id = this.deletePropertyId;
      this.patientService.deleteChronicConditionData(id).subscribe((data) => {
        this.notificationService.showSuccess("Chronic Condition Data deleted successfully.");
        this.modalClose();
          // This will refresh the whole page
        window.location.reload();
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Family Member') {
      const id = this.deletePropertyId;
      this.patientService.deleteFamilyMember(id).subscribe((data) => {
        this.notificationService.showSuccess("Family Member deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Provider Document') {
      const id = this.deletePropertyId;
      this.providerService.deleteDocument(id).subscribe((data) => {
        this.notificationService.showSuccess("Provider Document deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
    if (this.deleteProperty == 'Annoucement') {
      const id = this.deletePropertyId;
      this.adminService.deleteAnnoucementData(id).subscribe((data) => {
        this.notificationService.showSuccess("Annoucement deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
 
 
    if (this.deleteProperty == 'Service') {
      const id = this.deletePropertyId;
      this.adminService.deleteServiceData(id).subscribe((data) => {
        this.notificationService.showSuccess("Service deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    } 
    if (this.deleteProperty == 'Condition') {
      const id = this.deletePropertyId;
      this.adminService.deleteCondition(id).subscribe((data) => {
        this.notificationService.showSuccess("Condition deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
    if (this.deleteProperty == 'Speciality') {
      const id = this.deletePropertyId;
      this.adminService.specialityDelete(id).subscribe((data) => {
        this.notificationService.showSuccess("Speciality deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
    if (this.deleteProperty == 'Delete Blog') {
      const id = this.deletePropertyId;
      this.adminService.deleteBlog(id).subscribe((data) => {
        this.notificationService.showSuccess("Blog deleted successfully.");
        this.modalClose()
      },
        (error) => {
          this.notificationService.showDanger(getErrorMessage(error));
        });
    }
  }
 


  
 

  


  

}

