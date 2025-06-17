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
import * as _ from 'lodash';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';

function fileValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const filePaths = control.value as File[];
    if (filePaths.length == 0) {
      return { 'noFilesSelected': true };
    }
    return null;
  };
}
enum Obj {
  IdentificationCardForm = 1,
  MedicalHistory = 2,
  MedicationList = 3,
  Labs = 4,
  Others = 5,
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
  obj = Object.entries(Obj)
    .filter(([key, value]) => typeof value === "number") // Filter only numeric keys
    .map(([key, value]) => ({
      id: value as number,
      value: String(key)
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
        .replace("Card Form", "Card / Form") // Replace "Card Form" with "Card / Form"
    }));


  _ = _;

  paginator = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  };
  filteredItems = []
  // searchTerm: string = '';
  searchTerm: string = '';

  sortColumn: string = '';
  sortOrder: string = 'asc';
  roles: {
    id: number;
    numOfUsers: number;
    name: string;
    status: string;
  }[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.documentForm = this.fb.group({
      patientCategory: ['', Validators.required],
      expiryDate: [''],
      fileName: ['',],
      title: ['',[Validators.required, Validators.pattern(/\S+/)]],
      notes: [''],
      // userId: [''],
      id: ['0']
    })
    this.getPatientDocumentsList();
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
  }

  shareItem(obj: any) {
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


  formatCategory(category: string): string {
    if (!category) return '';
    return category.replace(/([a-z])([A-Z])/g, '$1 $2');
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
    debugger;
    this.documentData = []
    this.patientService.getPatientDocumentsList(this.searchTerm,this.paginator.pageNumber,this.paginator.pageSize,this.sortColumn,this.sortOrder).subscribe((data: any) => {

      if (data && data.items) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.documentData = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.documentData = data.items;
          this.filteredItems = [...this.documentData];
        }
        this.documentData.forEach((item: any) => {
          item.filePath = environment.fileUrl + item.filePath
        })
      }
      this.loading = false;
    },
      (error) => {
        this.documentData = [];
        this.loading = false;
      }
    );
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
          // ✅ Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  deleteDocument(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Document'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
    this.getPatientDocumentsList();
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

    sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getPatientDocumentsList();
  }

}
