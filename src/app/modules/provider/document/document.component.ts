import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {

  applicationConsentForm: FormGroup;
  isLoading: boolean = false;
  selectedFileName: string = '';


  ConsentForm: FormGroup;
  IntakeForm: FormGroup;
  applicationIntakeForm: FormGroup;
  showEditTimeFile: boolean;
  editDocument: any;
  editDocument1: any;
  editConsentDocument: any;
  showConsentEditTimeFile: boolean;
  showEditTimeFile1: boolean;
  userId: any;
  documentData: any;
  selectedForm: string = '';
  selectedForm1: string = '';
  consentData: any;
  isLoading1: boolean = false;
  intakeData: any// Variable to hold the selected form option
  oneFormAtTime: boolean = false;
  oneFormAtTime1: boolean = false;
  activeData: any;
  selectedFormType: string = '';


  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService,
    private adminService: AdminService,
    private providerService: ProviderService
  ) {

  }

  ngOnInit() {
    this.applicationConsentForm = this.fb.group({
      id: ['0'],
      documentName: [''],
      documentType: [''],

    })
    this.ConsentForm = this.fb.group({
      id: ['0'],
      documentName: [''],
      documentType: [''],

    })

    this.IntakeForm = this.fb.group({
      id: ['0'],
      documentName: [''],
      documentType: [''],

    })
    this.applicationIntakeForm = this.fb.group({
      id: ['0'],
      userId: ['0'],
      documentName: [''],
      documentType: [''],

    })
    this.getAdminDocumentByUserId();
    // this.getProviderActiveDocuments();

    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
  }
  
  // getProviderActiveDocuments() {
  //   this.providerService.getProviderActiveDocuments().subscribe((data: any) => {
  //     this.activeData = data;

  //     this.activeData.forEach(item => {
  //       if (item.documentType == "ConsentForm") {
  //         if (item.profileType == "Admin") {

  //           this.applicationConsentForm.patchValue({
  //             id: item.id,
  //             userId: item.userId,
  //             documentName: item.documentName || '',
  //             documentType: item.documentType || '',
  //           });
  //           if (item.fileName) {
  //             this.editConsentDocument = {
  //               id: item.id,
  //               userId: item.userId,
  //               filePath: environment.fileUrl + item.filePath, // Corrected file path
  //               fileName: item.fileName,
  //             };
  //             this.showConsentEditTimeFile = false;
  //           }

  //           this.selectedForm = 'applicationForm'
  //           this.oneFormAtTime = true
  //         }
  //       }
  //     });
  //     console.log("active  data :", this.activeData)
  //   })

  // }



  postActivateStatus(id: any) {
    ;
    const userInfo = this.authService.getUserInfo()
    const requestData = {
      userId: userInfo.userId,
      adminDocumentId: id || 0
    };

    this.providerService.postActivateStatus(requestData).subscribe(
      response => {
        this.notificationService.showSuccess("Status activated successfully")
        console.log('Status activated successfully', response);
      },
      error => {
        console.error('Error activating status', error);
      }
    );
  }

  id: any;
  getAdminDocumentByUserId() {
    ;
    this.adminService.getAdminDocumentByUserId()?.subscribe(
      (data: any) => {
        console.log('data', data);
        ;
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
                this.editDocument1 = {
                  id: document.id,
                  userId: document.userId,
                  filePath: environment.fileUrl + document.filePath, // Corrected file path
                  fileName: document.fileName,
                };
                this.showEditTimeFile = false;
              }
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
                  filePath: environment.fileUrl + document.filePath,
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

  getproviderIntakeForm() {
    //  this.getAdminDocumentByUserId();
    this.selectedForm1;

    this.oneFormAtTime = false;
    this.oneFormAtTime1 = true;
    this.providerService.getproviderConsentForm()?.subscribe(
      (data: any) => {
        this.intakeData = data;

        // documentType
        // Assuming consentData is your array of objects
        if (this.intakeData) {
          const hasIntakeForm = this.intakeData.find(doc => doc.documentType === "IntakeForm");
          const hasConsentForm = this.intakeData.find(doc => doc.documentType === "ConsentForm");
          if (hasIntakeForm) {
            console.log("Only IntakeForm is present.");
          } if (hasIntakeForm) {
            this.editDocument = {
              fileName: hasIntakeForm.fileName,
              filePath: environment.fileUrl + hasIntakeForm.filePath,
            };
            this.applicationIntakeForm.patchValue({
              id: hasIntakeForm.id,
              userId: data.userId,
              ...hasIntakeForm,

            });
            console.log("This is intake form", data);
          } else {
            console.log("Neither document type is present.");
          }
        }

      },
      (error) => {
        console.error('Failed to fetch consent data:', error);
        this.notificationService.showDanger(getErrorMessage(error));
      }
    );
  }

  getproviderConsentForm() {
     this.getAdminDocumentByUserId();
    this.oneFormAtTime = true;
    this.oneFormAtTime1 = false;
    this.providerService.getproviderConsentForm()?.subscribe(
      (data: any) => {
        ;
        this.consentData = data;
        // documentType
        // Assuming consentData is your array of objects
        if (this.consentData) {
          const hasIntakeForm = this.consentData.find(doc => doc.documentType === "IntakeForm");
          const hasConsentForm = this.consentData.find(doc => doc.documentType === "ConsentForm");
          if (hasIntakeForm) {
            console.log("Only IntakeForm is present.");
          } if (hasConsentForm) {
            this.editDocument = {
              fileName: hasConsentForm.fileName,
              filePath: environment.fileUrl + hasConsentForm.filePath,
            };
            this.applicationConsentForm.patchValue({
              id: hasConsentForm.id,
              userId: data.userId,
              ...hasConsentForm,

            });
          } else {
            console.log("Neither document type is present.");
          }
        }

      },
      (error) => {
        console.error('Failed to fetch consent data:', error);
        this.notificationService.showDanger(getErrorMessage(error));
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

  // toggleFormSection() {
  //   console.log('Selected Form:', this.selectedForm);
  // }



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
          this.editConsentDocument = null;
          if (formValue.id === '0') {
            this.notificationService.showSuccess('Document added successfully.');
          } else {
            this.notificationService.showSuccess('Document updated successfully.');
          }
          this.isLoading = false;
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
      this.applicationConsentForm.patchValue({ fileName: file.name }); // Update form control
    }
  }

  consentDocument = [];
  onConsentDocumentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.consentDocument = [file]; // Store the file for processing
      this.selectedFileName = file.name; // Update UI display
      this.ConsentForm.patchValue({ fileName: file.name }); // Update form control
      this.ConsentForm.get('fileName')?.updateValueAndValidity(); // Trigger validation update
    }
  }
  

  deleteDocument(file) {
    this.adminService.deleteAdminDocument(file.id).subscribe((data: any) => {
      this.editDocument = null
      this.notificationService.showSuccess("Document deleted");
    })
  }

  deleteDocument1(file) {
    this.adminService.deleteAdminDocument(file.id).subscribe((data: any) => {
      this.editDocument1 = null
      this.notificationService.showSuccess("Document deleted");
    })
  }

  // deleteConsentDocument(file) {
  //   ;
  //   this.adminService.deleteAdminDocument(file.id).subscribe((data: any) => {
  //     this.editConsentDocument = null
  //     this.notificationService.showSuccess("Document deleted");
  //   })
  // }
  deleteConsentDocument(file) {
    this.adminService.deleteAdminDocument(file.id).subscribe((data: any) => {
      this.editConsentDocument = null;  
      this.ConsentForm.patchValue({ fileName: '' }); // Clear form field
      this.notificationService.showSuccess("Document deleted");
      this.editConsentDocument = null;
    });
  }
  
  

  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

  downloadFile1(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

  downloadConsentFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }
}
