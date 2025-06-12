import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';
import { ProviderServicesComponent } from '../provider-services/provider-services.component';
import { AdminService } from 'src/app/Services/admin.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';

enum obj {
  MedicalLicense = 1,
  ProofOfMalpracticeInsurance = 2,
  ProofOfSupervisingPhysician = 3,
  ProofOfCertification = 4,
  ProofOfEducation = 5,
  DriverLicense = 6,
  Other = 7
}

function fileValidator(isEditMode: boolean): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const fileValue = control.value;

    if (!isEditMode) {
      if (!fileValue || (Array.isArray(fileValue) && fileValue.length === 0)) {
        return { 'noFilesSelected': true };
      }
    } else {

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
  loading2: boolean = false;
  userId: any;
  documentData: any;
  showEditTimeFile: boolean;
  editProfilePicture: any;
  isEditMode = false
  userInfo: any
  obj = Object.keys(obj).filter(key => (Number(key)))
    .map(key => ({
      id: key,
      value: String(obj[key as keyof typeof obj])
        .replace(/([a-z])([A-Z])/g, '$1 $2')
    }));
  @Output() dialogClosed = new EventEmitter<void>();
  states: any;
  

  constructor(public activeModel: NgbActiveModal,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private adminService: AdminService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private providerService: ProviderService
  ) { }
  ngOnInit() {
    const isEditMode = this.isEditMode;
    this.documentForm = this.fb.group({
      category: ['', Validators.required],
      expiryDate: [''],
      fileName: [''],
      notes: [''],
      userId: [''],
      id: ['0']

    })
    // this.getState();


    const userInfo = this.authService.getUserInfo()
    this.userInfo = userInfo
    if (userInfo.accountType == "IndependentProvider") {
      this.userId = userInfo.userId
    }
    if (localStorage.getItem('NewProviderId')) {
      this.userId = localStorage.getItem('NewProviderId')
    }
    if (userInfo.accountType != "IndependentProvider" && !localStorage.getItem('NewProviderId')) {
      this.userId = userInfo.userId
    }
    this.getDocumentsList();

  }
  getState() {
    this.patientService.getState().subscribe((data: any) => {
      this.states = data.items;
    })
  }

  formatCategory(category: string): string {
    if (!category) return '';
    return category.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  submitData() {
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
          this.getDocumentsList()
          this.loading = false
          if (this.documentForm.value.id == null) {
            this.notificationService.showSuccess("Document created successfully.");
          } else {
            this.notificationService.showSuccess("Document updated successfully.");
          }
          this.documentForm.reset();

        },
        (error: any) => {
          this.loading = false
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.documentForm.markAllAsTouched();
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
    this.providerService.getDocumentsList(this.userId).subscribe((data: any) => {
      
      if (data != null) {
        this.documentData = data;
        this.documentData.forEach((item: any) => {
          item.filePath = environment.fileUrl + item.filePath
        })
      }
      if (this.userInfo.accountType == 'Admin') {
        // this.documentForm.disable()
      }
    })
  }
  editItem(index: number) {
    ;
    this.selectedFile = null;
    this.selectedFilePath = null;
  
    const editData = this.documentData[index];
  
    if(editData.notes==undefined||editData.notes==null){
      this.documentForm.patchValue({
        category: editData.category,
        notes: "",
        id: editData.id,
      })
    }
    else{
      this.documentForm.patchValue({
        category: editData.category,
        notes: editData.notes,
        id: editData.id,
      });
    }
  
    // Only patch expiryDate if it's not "01/01/0001"
    if ( editData.expiryDate == '0001-01-01') {
      this.documentForm.get('expiryDate').setValue(null);
    } else {
      this.documentForm.get('expiryDate').setValue(editData.expiryDate);// or skip entirely if your form handles undefined
    }
  
    this.isEditMode = true;
    this.selectedFile = editData.fileName;
    this.selectedFilePath = editData.filePath;
    this.documentForm.get('fileName').setValue(this.selectedFilePath);
  }
  
  selectedFilePath: any

  deleteItem(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Provider Document'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
    this.getDocumentsList();
    });
  }


  openServicePopUp() {
    this.activeModel.close();
    this.modalService.open(ProviderServicesComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
  objData: any
  onStatusChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.objData = {
      credentialStatus: selectedValue,
      userId: this.userId
    }
  }

  submitProfileStatus() {
    this.adminService.updateProfileStatus(this.objData).subscribe((response: any) => {
      this.notificationService.showSuccess("Profile status updated successfully.");
      this.adminService.notifyClose.emit();
      this.activeModel.close();
    })
  }


  cancel() {
    this.activeModel.close();
  }
  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}
