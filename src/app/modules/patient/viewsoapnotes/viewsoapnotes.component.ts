import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import { Subscription } from 'rxjs';
import { PatientService } from 'src/app/Services/patient.service';
import { SignalRService } from 'src/app/Services/signalr.service';


@Component({
  selector: 'app-viewsoapnotes',
  templateUrl: './viewsoapnotes.component.html',
  styleUrls: ['./viewsoapnotes.component.css']
})
export class ViewsoapnotesComponent implements OnInit {

  @Output() dialogClosed = new EventEmitter<void>();
  @Input() bookingId: any
  // @Input() userId: any
  soapNotesData: any
  prescriptionsList: any[] = [];
  signatureUrl: any;

  private notificationSubscription: Subscription | undefined;
 
  constructor(
    private activeModel: NgbActiveModal,
    private patientService: PatientService,
    private signalRService: SignalRService) { }

  ngOnInit() {
    // 👇 Notification subscription
    this.notificationSubscription = this.signalRService.notificationCount$.subscribe(
      (notificationData) => {
        debugger;
        this.getSOAPNotesDetails();
      }
    );
 
 
    this.loadLogo();
    this.getSOAPNotesDetails()
    this.getPrescriptionById()
    this.signalRService.getNotificationCount();
  }
  loadLogo(): void {
    const img = new Image();
    img.src = '../../../../assets/svg/homepage/Chalice_Health_Logo.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      this.logoUrl = canvas.toDataURL('image/png'); // Convert to base64
    };
  }

  formatFrequencyType(frequency: string): string {
    return frequency ? frequency.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
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

  printPrescriptions(): void {
    const doc = new jsPDF();
    let y = 10; // Initial Y position
    doc.setFontSize(14);
    
    if (this.logoUrl) {
      const imgWidth = 34;
      const imgHeight = 10;
      const x = 10; // X position for top left corner
      doc.addImage(this.logoUrl, 'PNG', x, y, imgWidth, imgHeight);
      y += imgHeight + 10; // Adjust Y position for subsequent content
    }

    doc.text('Prescriptions List', 105, y, { align: 'center' });
    y += 10;
  
    // Table header
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFillColor(211, 211, 211);  // Light grey background
    doc.rect(10, y, 190, 10, 'F'); // Header background rectangle
    doc.text('Medicine Name', 12, y + 7);
    doc.text('Frequency', 60, y + 7);
    doc.text('Dosage', 90, y + 7);
    doc.text('Duration', 130, y + 7);
    doc.text('Direction Of Use', 160, y + 7);
    y += 12;
  
    // Table content
    doc.setFontSize(10);
    this.prescriptionsList.forEach((prescription) => {
      const rowHeight = this.calculateRowHeight1(prescription);
  
      // Draw table cells
      doc.rect(10, y, 50, rowHeight); // Medicine Name
      doc.rect(60, y, 30, rowHeight); // Frequency
      doc.rect(90, y, 40, rowHeight); // Dosage
      doc.rect(130, y, 30, rowHeight); // Duration
      doc.rect(160, y, 40, rowHeight); // Direction Of Use
  
      // Add text with word wrapping and proper padding
      this.addTextWithWrapping(doc, prescription.medicationName, 12, y + 5, 48); // 48 width to fit inside the cell
      this.addTextWithWrapping(doc, prescription.frequency, 62, y + 5, 28);
      this.addTextWithWrapping(
        doc,
        `${prescription.doseForm}, ${prescription.doseStrength}`,
        92,
        y + 5,
        38
      );
      this.addTextWithWrapping(doc, prescription.duration, 132, y + 5, 28);
      this.addTextWithWrapping(doc, prescription.directionOfUse, 162, y + 5, 38);
  
      y += rowHeight;
    });

      // Signature Section
      y += 10;
      doc.setFillColor(211, 211, 211);  
      doc.rect(10, y, 190, 10, 'F'); // Background for signature header
      doc.text("Physician's Signature", 12, y + 7);
      y += 12;
    
      // Signature Box
      if (this.signatureUrl) {
        doc.addImage(this.signatureUrl, 'PNG', 12, y, 50, 30); // Add signature image
      } else {
        doc.text('No signature available', 12, y + 10);
      }
    
  
    doc.save('Prescriptions.pdf');
  }
  
  private calculateRowHeight1(prescription: any): number {
    const lines = [
      prescription.medicationName,
      prescription.frequency,
      `${prescription.doseForm}, ${prescription.doseStrength}`,
      prescription.directionOfUse,
    ].map((text) => Math.ceil(text.length / 20)); 
    return Math.max(...lines) * 6; // Height per line
  }
  
  // Helper function to add word-wrapped text
  private addTextWithWrapping(doc: any, text: string, x: number, y: number, width: number): void {
    const lines = doc.splitTextToSize(text, width);
    lines.forEach((line, i) => {
      doc.text(line, x, y + i * 5); // Line height of 5
    });
  }


  logoUrl :any

  printPrescriptionsAndSoap(): void {

    const doc = new jsPDF();
    let y = 10; // Initial Y position
    doc.setFontSize(14);

    if (this.logoUrl) {
      const imgWidth = 64;
      const imgHeight = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = (pageWidth - imgWidth) / 2;
      doc.addImage(this.logoUrl, 'PNG', centerX, y, imgWidth, imgHeight);
      y += imgHeight + 10;
    }
    
    doc.setFontSize(14);
    doc.setFont('DM Sans', 'normal'); 
    
    // Title - "SOAP Notes"
    doc.setTextColor(0, 0, 0); // Black text
    doc.text('SOAP Notes', 105, y, { align: 'center' });
    y += 20;
    
  
    // Set grey color for headers
    const greyColor = [169, 169, 169]; // Light grey color
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFillColor(211, 211, 211);  // Light grey background
    doc.rect(10, y, 190, 10, 'F'); // Background for patient info header
    doc.setFont('DM Sans', 'bold'); // Bold font for headings
    doc.text('Patient Information', 12, y + 7);
    y += 15;
  
    // Patient details (Name, Gender, DOB, Date)
    doc.setFont('DM Sans', 'normal'); // Reset to normal font weight
    this.addTextWithWrapping(doc, `Patient Name: ${this.soapNotesData.patientName}`, 12, y, 180);
    y += 6;
    this.addTextWithWrapping(doc, `Gender: ${this.soapNotesData.gender}`, 12, y, 180);
    y += 6;
    this.addTextWithWrapping(doc, `DOB: ${this.formatDOB(this.soapNotesData.dob)} (${this.calculateAge(this.soapNotesData.dob)} yrs)`, 12, y, 180);
    y += 6;
    this.addTextWithWrapping(doc, `Date: ${this.soapNotesData.date}`, 12, y, 180);
    y += 8;
    
    // Encounter Details Section
    doc.setFillColor(211, 211, 211);  // Light grey background
    doc.rect(10, y, 190, 10, 'F'); // Background for encounter header
    doc.setFont('DM Sans', 'bold'); // Bold font for headings
    doc.text('Encounter Details', 12, y + 7);
    y += 15;
    
    // Subjective, Objective, Assessment, Plan
    doc.setFont('DM Sans', 'normal'); // Reset to normal font weight
    // Subjective
const subjectiveLines = doc.splitTextToSize(
  `Subjective: ${this.soapNotesData.subjective ? this.soapNotesData.subjective : '------'}`,
  180
);
doc.text(subjectiveLines, 12, y);
y += subjectiveLines.length * 6; // Update Y position based on number of lines

// Objective
const objectiveLines = doc.splitTextToSize(
  `Objective: ${this.soapNotesData.objective ? this.soapNotesData.objective : '------'}`,
  180
);
doc.text(objectiveLines, 12, y);
y += objectiveLines.length * 6;

// Assessment
const assessmentLines = doc.splitTextToSize(
  `Assessment: ${this.soapNotesData.assessment ? this.soapNotesData.assessment : '------'}`,
  180
);
doc.text(assessmentLines, 12, y);
y += assessmentLines.length * 6;

// Plan
const planLines = doc.splitTextToSize(
  `Plan: ${this.soapNotesData.plan ? this.soapNotesData.plan : '------'}`,
  180
);
doc.text(planLines, 12, y);
y += planLines.length * 6;

    
    // Prescriptions List Section
    doc.setFillColor(211, 211, 211);  // Light grey background
    doc.rect(10, y, 190, 10, 'F'); // Background for prescriptions header
    doc.setFont('DM Sans', 'bold'); // Bold font for headings
    doc.text('Prescriptions List', 12, y + 7);
    y += 12;
  
    // Prescription table header
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFillColor(211, 211, 211);  // Light grey background
    doc.rect(10, y, 190, 10, 'F'); // Header background rectangle
    doc.text('Medicine Name', 12, y + 7);
    doc.text('Frequency', 60, y + 7);
    doc.text('Dosage', 90, y + 7);
    doc.text('Duration', 130, y + 7);
    doc.text('Direction Of Use', 160, y + 7);
    y += 12;
  
    // Table content for prescriptions
    this.prescriptionsList.forEach((prescription) => {
      const rowHeight = this.calculateRowHeight(doc, prescription, 6);
      
      // Draw table cells
      doc.rect(10, y, 50, rowHeight); // Medicine Name
      doc.rect(60, y, 30, rowHeight); // Frequency
      doc.rect(90, y, 40, rowHeight); // Dosage
      doc.rect(130, y, 30, rowHeight); // Duration
      doc.rect(160, y, 40, rowHeight); // Direction Of Use
    
      // Add text with word wrapping
      this.addTextWithWrapping(doc, prescription.medicationName, 12, y + 5, 48);
      this.addTextWithWrapping(doc, prescription.frequency, 62, y + 5, 28);
      this.addTextWithWrapping(doc, `${prescription.doseForm} ${prescription.doseStrength}`, 92, y + 5, 38);
      this.addTextWithWrapping(doc, prescription.duration, 132, y + 5, 28);
      this.addTextWithWrapping(doc, prescription.directionOfUse, 162, y + 5, 38);
    
      y += rowHeight;
    });
    
    // Signature Section
    y += 10;
    doc.setFillColor(211, 211, 211);  
    doc.rect(10, y, 190, 10, 'F'); // Background for signature header
    doc.text("Physician's Signature", 12, y + 7);
    y += 12;
  
    // Signature Box
    if (this.signatureUrl) {
      doc.addImage(this.signatureUrl, 'PNG', 12, y, 50, 30); // Add signature image
    } else {
      doc.text('No signature available', 12, y + 10);
    }
  
    // Save the PDF
    doc.save('SOAP_Notes.pdf');
  }

  private calculateRowHeight(doc: jsPDF, prescription: any, lineHeight: number): number {
    const maxLines = Math.max(
      doc.splitTextToSize(prescription.medicationName, 48).length,
      doc.splitTextToSize(prescription.frequency, 28).length,
      doc.splitTextToSize(`${prescription.doseForm} ${prescription.doseStrength}`, 38).length,
      doc.splitTextToSize(prescription.duration, 28).length,
      doc.splitTextToSize(prescription.directionOfUse, 38).length
    );
    return maxLines * lineHeight;
  }
  
  
  
}
