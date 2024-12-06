import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientService } from 'src/app/Services/patient.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-patient-clinical-dashboard',
  templateUrl: './patient-clinical-dashboard.component.html',
  styleUrls: ['./patient-clinical-dashboard.component.css']
})
export class PatientClinicalDashboardComponent implements OnInit{
  @Output() dialogClosed = new EventEmitter<void>();
  @Input() bookingId: any;
  patientList: any;
  documentList: any;

  constructor(
    private activeModel: NgbActiveModal,
  private patientService: PatientService) { }
  ngOnInit(): void {
    this.getPatientByBookingId();
    this.getPatientDocumentsByBookingId();
    console.log("my id", this.bookingId)
    throw new Error('Method not implemented.');
    
  }
  getPatientByBookingId() {
    this.patientService.getPatientDashboardByBookingId(this.bookingId).subscribe(
      (response: any) => {
        this.patientList = {
          ...response,
          formattedDateOfBirth: this.formatDate(response.dateOfBirth),
          age: this.calculateAge(response.dateOfBirth),
          profilePicturePath:environment.fileUrl+response.profilePicturePath
        };
        console.log("Formatted dashboard data :", this.patientList);
      },
      (error: any) => {
        console.error("Error fetching patient data:", error);
      }
    );
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
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


  // getPatientByBookingId() {
  //   this.patientService.getPatientDashboardByBookingId(this.bookingId).subscribe(
  //     (response: any) => {
  //       // Since the response contains an object and not a list, wrap it in an array
  //       this.patientList = response;
  //       console.log("Formatted dashboard data :", this.patientList);
  //     },
  //     (error: any) => {
  //       console.error("Error fetching patient data:", error);
  //     }
  //   );
  // }
  getPatientDocumentsByBookingId() {
    this.patientService.getPatientDashboardDocumentsByBookingId(this.bookingId).subscribe((response: any) => {
      // Ensure response is an array and update the filePath for each document
      this.documentList = response.map((doc: any) => {
        return {
          ...doc,
          filePath: doc.filePath ? environment.fileUrl + doc.filePath : undefined,
        };
      });
      console.log("my dashboard documents data :", this.documentList);
    });
  }
  

  // getPatientDocumentsByBookingId(){
  //   this.patientService.getPatientDashboardDocumentsByBookingId(this.bookingId).subscribe((response: any) => {
  //     this.documentList = response
  //     console.log("my dashboard documents data :", this.documentList)
  //   })
  // }

  
   





  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}
