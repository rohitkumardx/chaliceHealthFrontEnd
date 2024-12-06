import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientService } from 'src/app/Services/patient.service';

@Component({
  selector: 'app-viewsoapnotes',
  templateUrl: './viewsoapnotes.component.html',
  styleUrls: ['./viewsoapnotes.component.css']
})
export class ViewsoapnotesComponent implements OnInit {

  @Output() dialogClosed = new EventEmitter<void>();
  @Input() bookingId: any
  soapNotesData: any
  prescriptionsList: any[] = [];
  signatureUrl: any;

  constructor(
    private activeModel: NgbActiveModal,
    private patientService: PatientService) { }
  ngOnInit() {
    this.getSOAPNotesDetails()
    this.getPrescriptionById()
  }
  getPrescriptionById() {
    this.patientService.getPrescriptionById(this.bookingId).subscribe((data: any) => {
      this.prescriptionsList = data.prescriptions
      const signatureImage = data.signature;

      if (signatureImage) {
        this.signatureUrl = `data:image/png;base64,${signatureImage}`;
      }
      console.log('currency', data)
    },
    (error) => {
      console.error("Error fetching upcoming appointments:", error);
    })
  }
  getSOAPNotesDetails() {
    this.patientService.getSOAPNotesByAppointmentId(this.bookingId).subscribe((response: any) => {
      this.soapNotesData = response
    },
    (error) => {
      console.error("Error fetching upcoming appointments:", error);
    })
  }
  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
  formatDOB(dob: string): string {
    const date = new Date(dob);
    return date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
  }

  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
