import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  IntakeForm: FormGroup;
  isLoading: boolean = false;
  isLoading1: boolean =  false;
  ConsentForm: FormGroup;
  showEditTimeFile: boolean;
  editDocument: any;
  editConsentDocument:any;
  showConsentEditTimeFile: boolean;
  userId: any;
  documentData:any;

  constructor( private router: Router,
        private fb: FormBuilder,
        private authService: AuthService,
        private notificationService: NotificationService,
        private globalModalService: GlobalModalService,
        private adminService: AdminService){ }


        ngOnInit() {
          this.IntakeForm = this.fb.group({
            id: ['0'],
            documentName: ['', Validators.required],
            documentType: [''],
          })
          this.ConsentForm = this.fb.group({
            id: ['0'],
            documentName: ['', Validators.required],
            documentType: [''],
          })
           this.getAdminDocumentByUserId();
          const userInfo = this.authService.getUserInfo()
           this.userId = userInfo.userId
        }


        getAdminDocumentByUserId() {
          this.adminService.getAdminDocumentByUserId()?.subscribe(
            (data: any) => {
              console.log('data', data);
        
              if (data && Array.isArray(data)) {
                for (let document of data) {
                  if (document.documentType === 'IntakeForm') {
                    this.IntakeForm.patchValue({
                      id: document.id,
                      userId: document.userId,
                      documentName: document.documentName || '',
                      documentType: document.documentType || '',
                    });
        
                    if (document.fileName) {
                      this.editDocument = {
                        id: document.id,
                        userId: document.userId,
                        filePath: environment.fileUrl + document.filePath, // Corrected file path
                        fileName: document.fileName,
                      };
                      this.showEditTimeFile = false;
                    }
        
                continue
                  }
        
                  if (document.documentType === 'ConsentForm') {
                    this.ConsentForm.patchValue({
                      id: document.id,
                      userId: document.userId,
                      documentName: document.documentName || '',
                      documentType: document.documentType || '',
                    });
        
                    if (document.fileName) {
                      this.editConsentDocument = {
                        id: document.id,
                        userId: document.userId,
                        filePath: environment.fileUrl + document.filePath, // Corrected file path
                        fileName: document.fileName,
                      };
                      this.showConsentEditTimeFile = false;
                    }
        
                    continue; 
                  }
                }
              }
            },
            (error: any) => {
              console.error('Failed to fetch document data:', error);
            }
          );
        }
        
        
        PostIntakeInformation() {
          if (this.IntakeForm.valid) {
            this.isLoading1 = true;
            const formData = new FormData();
            const formValue = this.IntakeForm.value;
      
            formValue.userId = this.userId;
            formValue.documentType = 1; // Static value
      
            // Append form fields
            Object.keys(formValue).forEach((key) => {
              formData.append(key, formValue[key]);
            });
      
            // Append file to the FormData
            if (this.document.length > 0) {
              formData.append('fileName', this.document[0]);
            }
      
            this.adminService.postAdminDocumentInfo(formData).subscribe(
              (response: any) => {
                if (formValue.id === '0') {
                  this.notificationService.showSuccess('Document added successfully.');
                } else {
                  this.notificationService.showSuccess('Document updated successfully.');
                }
                this.isLoading1 = false;
                window.location.reload();

              },
              (error: any) => {
                console.error('Post failed', error);
                this.notificationService.showDanger(getErrorMessage(error));
                this.isLoading1 = false;
              }
            );
          } else {
            this.notificationService.showDanger(
              'Form is invalid. Please fill all required fields correctly.'
            );
            this.IntakeForm.markAllAsTouched();
          }
        }


        PostConsentFormInformation() {
       
          if (this.ConsentForm.valid) {
            this.isLoading = true;
            const formData = new FormData();
            const formValue = this.ConsentForm.value;
      
            formValue.userId = this.userId;
            formValue.documentType = 2; // Static value
      
            // Append form fields
            Object.keys(formValue).forEach((key) => {
              formData.append(key, formValue[key]);
            });
      
            // Append file to the FormData
            if (this.consentDocument.length > 0) {
              formData.append('fileName', this.consentDocument[0]);
            }
      
            this.adminService.postAdminDocumentInfo(formData).subscribe(
              (response: any) => {
                if (formValue.id === '0') {
                  this.notificationService.showSuccess('Document added successfully.');
                } else {
                  this.notificationService.showSuccess('Document updated successfully.');
                }
                this.isLoading = false;
                window.location.reload();
              },
              (error: any) => {
                console.error('Post failed', error);
                this.notificationService.showDanger(getErrorMessage(error));
                this.isLoading = false;
              }
            );
          } else {
            this.notificationService.showDanger(
              'Form is invalid. Please fill all required fields correctly.'
            );
            this.ConsentForm.markAllAsTouched();
          }
        }
        
            


  document = []
  onDocumentSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.document = [file]; // Store the file for processing
      this.IntakeForm.patchValue({ fileName: file.name }); // Update form control
    }
  }

  consentDocument = [];
  onConsentDocumentSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.consentDocument = [file]; // Store the file for processing
      this.ConsentForm.patchValue({ fileName: file.name }); // Update form control
    }
  }

  deleteDocument(file) {
    this.adminService.deleteAdminDocument(file.id).subscribe((data: any) => {
      this.editDocument = null
      this.notificationService.showSuccess("Document deleted");
    })
  }

  deleteConsentDocument(file) {
    this.adminService.deleteAdminDocument(file.id).subscribe((data: any) => {
      this.editConsentDocument = null
      this.notificationService.showSuccess("Document deleted");
    })
  }

  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

  downloadConsentFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

}
