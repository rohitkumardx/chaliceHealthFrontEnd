import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';
import { ShareDocPopupComponent } from '../share-doc-popup/share-doc-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

function fileValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const filePaths = control.value as File[];
    if (filePaths.length == 0) {
      return { 'noFilesSelected': true };
    }
    return null;
  };
}
enum obj {
  Bp = 1,
  HB = 2,
  Diabetic = 3,       
  Cardiac = 4,        
  Pediatric = 5,      
  Geriatric = 6
}

@Component({
  selector: 'app-patient-documents',
  templateUrl: './patient-documents.component.html',
  styleUrls: ['./patient-documents.component.css']
})
export class PatientDocumentsComponent implements OnInit {
documentForm!: FormGroup
selectedFile: any;
loading: boolean = false;
loading1: boolean = false;
userId: any;
documentData: any;
showEditTimeFile: boolean;
editProfilePicture: any;
selectedFilePath: any;
isEditMode = false;
profilePicture = []
obj = Object.keys(obj).filter(key => (Number(key)))
    .map(key => ({
      id: key,
      value: String(obj[key as keyof typeof obj])
        .replace(/([a-z])([A-Z])/g, '$1 $2')
    }));

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(){
    this.documentForm = this.fb.group({
      patientCategory: ['', Validators.required],
      expiryDate: ['', Validators.required],
      fileName: ['', ],
      title: ['', Validators.required],
      notes: [''],
      // userId: [''],
      id: ['0']
    })
    this. getPatientDocumentsList();
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
  }

  shareItem(obj : any) {
      const modalRef = this.modalService.open(ShareDocPopupComponent, {
        backdrop: 'static',
        size: 'md',
        centered: true
      });
      const data = {
        type: "Report",
        data: obj
      }
      modalRef.componentInstance.documentData = data;
  }
  
  submitData() {
    if (!this.isEditMode) {
        this.documentForm.get('fileName').setValidators(Validators.required);
        this.documentForm.get('fileName').updateValueAndValidity();
    }

    if (this.documentForm.valid) {
        this.selectedFile = null;
        const documentForm = this.documentForm.value;
        documentForm.userId = this.userId;
        const formData = new FormData();

        Object.keys(documentForm).forEach(key => {
            formData.append(key, documentForm[key]);
        });
        for (let i = 0; i < this.profilePicture.length; i++) {
            formData.append('FileName', this.profilePicture[i]);
        }

        this.patientService.postPatientDocument(formData).subscribe(
            (response: any) => {
                console.log('Post successful', response);
                this.getPatientDocumentsList();
                this.notificationService.showSuccess(this.isEditMode ? "Document updated successfully." : "Document created successfully.");
                this.documentForm.reset();
                this.isEditMode = false;
            },
            (error: any) => {
                console.error('Post failed', error);
                this.notificationService.showDanger(getErrorMessage(error));
            }
        );
    } else {
        this.documentForm.markAllAsTouched();
    }
}


  getPatientDocumentsList() {
    this.documentData = []
    const userInfo = this.authService.getUserInfo()
    this.patientService.getPatientDocumentsList(userInfo.userId).subscribe((data: any) => {
      if(data != null){
        this.documentData = data;
        this.documentData.forEach((item: any) => {
          item.filePath = environment.fileUrl + item.filePath
        })
      }  
    })
  }
  editDocument(index: number) {
    this.isEditMode = true;
    this.selectedFile = null;
    this.selectedFilePath = null;

    const editData = this.documentData[index];
    this.documentForm.patchValue({
        patientCategory: editData.category,
        title: editData.title,
        expiryDate: editData.expiryDate,
        notes: editData.notes,
        id: editData.id,
    });
    this.selectedFile = editData.fileName;
    this.selectedFilePath = editData.filePath;

    // Remove fileName validator during edit
    this.documentForm.get('fileName').clearValidators();
    this.documentForm.get('fileName').updateValueAndValidity();
}


  deleteDocument(id){
    this.patientService.deletePatientDocument(id).subscribe(data => {
      this.getPatientDocumentsList();
      this.notificationService.showSuccess("Deleted Successfully");
    });
  }

  
  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

  onProfileSelected(event: any) {
    this.isEditMode = false;
    this.selectedFile = null;
    this.selectedFilePath = null;
    this.profilePicture = [];
    const file = event.target.files[0];
    if (file) {
        this.profilePicture.push(file);
        this.documentForm.get('fileName').setValue(file);
    }
}

}
