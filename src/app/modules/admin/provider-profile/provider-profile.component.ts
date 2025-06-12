import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { PatientService } from 'src/app/Services/patient.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-provider-profile',
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.css']
})
export class ProviderProfileComponent {
  @Output() dialogClosed = new EventEmitter<void>();
  @Input() bookingId: any;
  @Input() patientId: any;
  @Input() providerId: any;
  showAll: boolean = false;
  expandedBio: boolean = false;
  userInfo: any;


  providerList: any;
  appointmentDetails: any;
  stars: number[] = [1, 2, 3, 4, 5];

  documentList: any[] = [];
  visibleDocuments: any[] = [];
  constructor(
    private activeModel: NgbActiveModal,
    private patientService: PatientService,
    private adminService: AdminService,
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthService) { }
  ngOnInit() {
    // if (this.patientId == undefined) {
    //   this.getPatientByBookingId();
    //   this.getPatientDocumentsByBookingId();
    // }
    // else {
    //   this.getProviderProfileData()
    // }
    this.userInfo = this.authService.getUserInfo();


    this.providerId;
    this.getProviderProfileData()
  }

  getStarType(index: number, rating: number): 'full' | 'half' | 'empty' {
    const floorRating = Math.floor(rating);
    const decimal = rating - floorRating;

    if (index <= floorRating) {
      return 'full';
    }
    else if (index === floorRating + 1 && decimal >= 0.25) {
      return 'half';
    }
    else {
      return 'empty';
    }
  }

  getProviderProfileData() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // Offset in ms
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1); // Remove 'Z'

    // Split into date and time
    const [datePart, timeWithMs] = localISOTime.split('T');
    const timePart = timeWithMs.split('.')[0];
    // alert(this.providerId);
    this.adminService.getProviderProfileData(this.providerId,datePart,timePart).subscribe(
      (response: any) => {

        this.providerList = {
          ...response,

          profilePicturePath: environment.fileUrl + response.profilePicturePath
          // profilePicturePath: undefined
        };
        console.log("provider profile data :", this.providerList);
      },
      (error: any) => {
        console.error("Error fetching patient data:", error);
      }
    );
  }
  formatServiceType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }
  // This function toggles the expandedBio flag, allowing the text to show more or less.
  toggleBio() {
    this.expandedBio = !this.expandedBio;
  }
  bookAppointmentId: any;
  redirectToMessage(id: any) {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll(); // Closes the currently open modal
    }

    if (this.userInfo.accountType == "Admin") {
      this.router.navigate(['/admin/messages'], { queryParams: { userId: id } });
    }
    if (this.userInfo.accountType == "Patient") {
      // alert(this.bookingId)
      this.router.navigate(['/patient/message'], { queryParams: { appointmentId: this.bookingId, userId: id } });
    }
    // if(this.userInfo.accountType == "IndependentProvider"){
    //   this.router.navigate(['/provider/dashboard'], { queryParams: { request: 'ProviderPortal' } });
    // }

  }
  // viewChat(userId:any,id :any){
  //   this.router.navigate(["/provider/message"] ,{ queryParams: { userId: userId ,appointmentId :id} })
  // }

  // This function checks if the text is long enough to need the "See more" functionality.
  isBioLong(bio: string): boolean {
    return bio.length > 100;  // Adjust the length as needed
  }
  formatProviderName(providerName: string): string {
    return providerName ? providerName.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
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

      console.log(this.documentList);
    });
  }







  getVisibleAppointments() {
    return this.showAll ? this.providerList.appointmentDetails : this.providerList.appointmentDetails.slice(0, 1);
  }

  toggleAppointments() {
    this.showAll = !this.showAll;
  }






  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }


}
