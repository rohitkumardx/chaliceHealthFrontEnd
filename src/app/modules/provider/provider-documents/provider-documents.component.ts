import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';

enum obj {
  MedicalLicense = 1,
  ProofOfMalpracticeInsurance = 2,
  ProofOfSupervisingPhysician = 3,
  ProofOfCertification = 4,
  ProofOfEducation = 5,
  DriverLicense = 6,
}

function fileValidator(isEditMode: boolean): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const fileValue = control.value;

    // In create mode, ensure a file is selected
    if (!isEditMode) {
      if (!fileValue || (Array.isArray(fileValue) && fileValue.length === 0)) {
        return { 'noFilesSelected': true };
      }
    } else {
      // In edit mode, ensure at least a file name is present
      if (!fileValue) {
        return { 'noFileName': true };
      }
    }
    return null;
  };
}

@Component({
  selector: 'app-provider-documents',
  templateUrl: './provider-documents.component.html',
  styleUrls: ['./provider-documents.component.css']
})
export class ProviderDocumentsComponent implements OnInit {
  selectedFile: any
  documentForm!: FormGroup
  loading: boolean = false;
  loading1: boolean = false;
  userId: any;
  documentData: any;
  showEditTimeFile: boolean;
  editProfilePicture: any;
  isEditMode = false
  obj = Object.keys(obj).filter(key => (Number(key)))
    .map(key => ({
      id: key,
      value: String(obj[key as keyof typeof obj])
        .replace(/([a-z])([A-Z])/g, '$1 $2')
    }));
  @Output() dialogClosed = new EventEmitter<void>();
  states: any;

  constructor(public activeModel: NgbActiveModal,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private providerService: ProviderService
  ) { }
  ngOnInit(): void {
    const isEditMode = this.isEditMode;
    this.documentForm = this.fb.group({
      category: ['', Validators.required],
      expiryDate: ['', Validators.required],
      fileName: [null, fileValidator(isEditMode)],
      notes: [''],
      userId: [''],
      id: ['0']

    })
    // this.getState();
    this.getDocumentsList();

    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId

  }
  getState() {
    this.patientService.getState().subscribe((data: any) => {
      this.states = data.items;
      console.log("states :", this.states)
    })
  }

  

  submitData() {
  debugger
    if (this.documentForm.valid || this.documentForm.value.fileName != null) {
      this.loading = true
      this.selectedFile = null
      const documentForm = this.documentForm.value;
      documentForm.userId = this.userId;
      const formData = new FormData();

      Object.keys(documentForm).forEach(key => {
        formData.append(key, documentForm[key]);
      });
      for (let i = 0; i < this.profilePicture.length; i++) {
        formData.append('FileName', this.profilePicture[i]);
      }

      this.providerService.postDocuments(formData).subscribe(
        (response: any) => {  
          this.isEditMode = false
          console.log('Post successful', response);
          this.getDocumentsList()
          this.loading = false
          // Check if the patient ID is null
          if (this.documentForm.value.id == null) {
            this.notificationService.showSuccess("Document created successfully.");
          } else {
            this.notificationService.showSuccess("Document updated successfully.");
          }

          // Reset the form
          this.documentForm.reset();

        },
        (error: any) => {
          this.loading = false
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.documentForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }
  profilePicture = []
  onProfileSelected(event: any) {
    this.selectedFile = null
    this.selectedFilePath = null
    this.profilePicture = []
    const file = event.target.files[0];
    if (file) {
      this.profilePicture.push(file)
      this.documentForm.get('fileName').setValue(file);
    }
  }


  downloadFile(filePath: string): any {

    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

  getDocumentsList() {
    this.documentData = []
    const userInfo = this.authService.getUserInfo()
    this.providerService.getDocumentsList(userInfo.userId).subscribe((data: any) => {
      if (data != null) {
        this.documentData = data;
        this.documentData.forEach((item: any) => {
          item.filePath = environment.fileUrl + item.filePath
        })
      }
    })
  }
  editItem(index: number) {
    this.selectedFile = null
    this.selectedFilePath = null

    const editData = this.documentData[index];

    this.documentForm.patchValue({
      category: editData.category,
      expiryDate: editData.expiryDate,
      notes: editData.notes,
      id: editData.id,
    });
    this.isEditMode = true
    this.selectedFile = editData.fileName
    this.selectedFilePath = editData.filePath
    this.documentForm.get('fileName').setValue(this.selectedFilePath);
  }
  selectedFilePath: any

  deleteItem(id) {
    this.providerService.deleteDocument(id).subscribe(data => {
      this.getDocumentsList();
      this.notificationService.showSuccess("Deleted Successfully");
    });
  }



  cancel() {
    this.activeModel.close();
  }
  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}
