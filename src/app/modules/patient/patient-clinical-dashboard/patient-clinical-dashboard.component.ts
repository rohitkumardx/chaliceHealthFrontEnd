import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';
import { PatientService } from 'src/app/Services/patient.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-patient-clinical-dashboard',
  templateUrl: './patient-clinical-dashboard.component.html',
  styleUrls: ['./patient-clinical-dashboard.component.css']
})
export class PatientClinicalDashboardComponent implements OnInit {
  @Output() dialogClosed = new EventEmitter<void>();
  @Input() bookingId: any;
  @Input() patientId: any;
  @Input() userId: any;
  showAll: boolean = false;

  patientList: any;

  documentList: any[] = [];
  visibleDocuments: any[] = [];
  constructor(
    private activeModel: NgbActiveModal,
    private patientService: PatientService,
    private adminService: AdminService) { }
  ngOnInit() {
    if (this.patientId == undefined) {
      this.getPatientByBookingId();
      this.getPatientDocumentsByBookingId();
    }
    else {
      this.getPatientData()
    }

  }


  getPatientData() {
    this.adminService.getPatientDashboardByPatientId(this.patientId).subscribe(
      (response: any) => {
        this.patientList = {
          ...response,
          formattedDateOfBirth: this.formatDate(response.dateOfBirth),
          age: this.calculateAge(response.dateOfBirth),
          profilePicturePath: response.profilePicturePath ? environment.fileUrl + response.profilePicturePath : undefined
          // profilePicturePath: undefined
        };
        
        console.log("Formatted dashboard data :", this.patientList);
      },
      (error: any) => {
        console.error("Error fetching patient data:", error);
      }
    );
  }

  getPatientByBookingId() {
    this.patientService.getPatientDashboardByBookingId(this.bookingId).subscribe(
      (response: any) => {
        this.patientList = {
          ...response,
          formattedDateOfBirth: this.formatDate(response.dateOfBirth),
          age: this.calculateAge(response.dateOfBirth),
           profilePicturePath:environment.fileUrl+response.profilePicturePath
          // profilePicturePath: undefined
        };
        console.log("Formatted dashboard data :", this.patientList);
      },
      (error: any) => {
        console.error("Error fetching patient data:", error);
      }
    );
  }

  formatServiceType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

  formatProviderName(providerName: string): string {
    return providerName ? providerName.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

  getVisibleAppointments() {
    return this.showAll ? this.patientList.appointmentDetails : this.patientList.appointmentDetails.slice(0, 1);
}

toggleAppointments() {
    this.showAll = !this.showAll;
}
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }


  calculateAge(dateString: string): number {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }


  getPatientDocumentsByBookingId() {
    this.patientService.getPatientDashboardDocumentsByBookingId(this.bookingId).subscribe((response: any) => {
      this.documentList = response.map((doc: any) => {
        return {
          ...doc,
          filePath: doc.filePath ? environment.fileUrl + doc.filePath : undefined,
        };
      });

      // Set the initial visible documents (first 5 items)
      this.updateVisibleDocuments();
      console.log(this.documentList);
    });
  }
  updateVisibleDocuments() {
    if (this.showMore) {
      this.visibleDocuments = [...this.documentList];  // Show all documents
    } else {
      this.visibleDocuments = this.documentList.slice(0, 5);  // Show first 5 documents
    }
  }
  maxDocsToShow = 5;
  showMore = false;

  // showMoreDocuments() {
  //   if (this.showMore) {
  //     this.maxDocsToShow = 5;
  //   } else {
  //     this.maxDocsToShow = this.documentList.length;

  //   }
  //   this.showMore = !this.showMore;
  // }
  showMoreDocuments() {
    this.showMore = !this.showMore;
    this.updateVisibleDocuments();  // Update visible documents based on the flag
  }




  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}
