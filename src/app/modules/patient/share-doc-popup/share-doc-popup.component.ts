import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';

@Component({
  selector: 'app-share-doc-popup',
  templateUrl: './share-doc-popup.component.html',
  styleUrls: ['./share-doc-popup.component.css']
})
export class ShareDocPopupComponent implements OnInit {
  dialogClosed: any;
  providerList = [];
  selectedProviderId: number | null = null;


  @Input() documentData: any
  constructor(
    public activeModel: NgbActiveModal,
    private providerService: ProviderService,
    private patientService: PatientService,
    private authService:AuthService
  ) { }

  ngOnInit() {
    this.getProviderList()
    console.log('doc data ', this.documentData)
  }
  getProviderList() {
    this.providerService.getProvidersForShareDocument().subscribe((response: any) => {
      this.providerList = response
    })
  }

  ShareDocument() 
  
  {
    debugger
    if (!this.selectedProviderId) {
      // alert('Please select a provider.');
      return;
    }
  const userInfo=this.authService.getUserInfo()
    const sharedDocumentData = {
      id: 0, 
      patientId: userInfo.userId,
      providerId: this.selectedProviderId,
      patientDocumentId: this.documentData.data.id

    };

    this.patientService.addSharedDocuments(sharedDocumentData).subscribe(
      (response) => {
        alert('Document shared successfully!');
        this.closePopup();
      },
      (error) => {
        console.error('Error sharing document:', error);
      }
    );
  }


  // ShareDocument() {

  // }

  cancel() {

  }
  closePopup() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}
