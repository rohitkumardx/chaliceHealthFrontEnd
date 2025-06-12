import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';
import { PatientService } from 'src/app/Services/patient.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-announcement-popup',
  templateUrl: './announcement-popup.component.html',
  styleUrls: ['./announcement-popup.component.css']
})
export class AnnouncementPopupComponent {
  transactionDetails: any
  @Input() announcementData: any
  @Output() dialogClosed = new EventEmitter<void>();

  constructor(public activeModel: NgbActiveModal,
    private patientService: PatientService
  ) { }

  ngOnInit() {
    console.log(this.announcementData)
    this.readAnnouncement()
  }

  readAnnouncement() {
    const obj = {
      isRead: true,
      id: this.announcementData.id
    }
    this.patientService.readAnnouncementByUserId(obj).subscribe((response: any) => [

    ])
  }
  download(){
    const filePath  =this.announcementData.attachmentsFilePath + environment.fileUrl
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

  // getDetails() {
  //   this.adminService.getHistoryDetails(this.transactionId).subscribe((response: any) => {
  //     this.transactionDetails = response
  //   })
  // }




  closePopup() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}

