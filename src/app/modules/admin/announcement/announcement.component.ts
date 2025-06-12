import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {

  selectedFilePath: any
  selectedFile: any

  announcementForm: FormGroup

  announcementList = []

  loading: boolean = false
  loading1: boolean = false
  filteredItems = []
  searchTerm = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
  _ = _;
  paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  };
  roles: {
    id: number,
    numOfUsers: number,
    name: string,
    status: string
  }[] = [];




  constructor(private adminService: AdminService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private modalService: NgbModal,
  ) {

  }

  ngOnInit() {
    this.announcementForm = this.fb.group({
      id: ['0'],
      sendTo: ['', Validators.required],
      title: ['', [Validators.required, Validators.pattern(/\S+/)]],
      body: [''],
      attachmentsFileName: ['']

    });


    this.getAnnouncementList()

  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getAnnouncementList();
  }
  submitted = false;

  addAnnouncement() {
    this.submitted = true;
    if (this.announcementForm.invalid) {
      this.notificationService.markFormGroupTouched(this.announcementForm);
      return;
    }
    this.loading1 = true

    const announcementForm = this.announcementForm.value;
    const formData = new FormData;
    Object.keys(announcementForm).forEach(key => {
      formData.append(key, announcementForm[key]);
    });

    for (let i = 0; i < this.profilePicture.length; i++) {
      formData.append('AttachmentsFileName', this.profilePicture[i]);
    }
    this.adminService.addAnnouncement(formData).subscribe((response: any) => {
      this.loading1 = false
      this.announcementForm.reset()
      this.submitted = false; // Reset after successful submit
      this.selectedFile = null;
      this.selectedFilePath = null;
      this.notificationService.showSuccess('Announcement added successfully.')
      this.getAnnouncementList()
    }, (error) => {
      this.loading1 = false;
      this.notificationService.showDanger(getErrorMessage(error));
      this.loading1 = false;
    });
  }


  getAnnouncementList() {
    this.announcementList = []
    this.adminService.getAnnouncementList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.announcementList = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.announcementList = data.items;
          this.filteredItems = [...this.announcementList];
        }
      }
      this.loading = false
      this.announcementList.forEach(announcement => {
        if (announcement.sendTo === 'AllOfThem') {
          announcement.sendTo = 'All Of Them';
        }
      });

    })
  }
selectedFileId :any

  editItem(id: any) {
          this.selectedFileId = null;
    // ✅ Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.adminService.getAnnouncementById(id).subscribe((response: any) => {
      console.log('data',response)
      // Handle file if exists
      if (response.attachmentsFileName) {
        this.selectedFilePath = environment.fileUrl + response.attachmentsFilePath;
        this.selectedFile = response.attachmentsFileName;
      } else {
        this.selectedFilePath = null;
        this.selectedFile = null;
      }

      // Normalize sendTo value (if your dropdown uses numbers 1–4)
      if (typeof response.sendTo === 'string') {
        switch (response.sendTo.toLowerCase()) {
          case 'patients':
            response.sendTo = 1;
            break;
          case 'providers':
            response.sendTo = 2;
            break;
          case 'facilities':
            response.sendTo = 3;
            break;
          case 'allofthem':
          case 'all of them':
            response.sendTo = 4;
            break;
        }
      }

this.selectedFileId = response.id
      // Patch the form safely
      this.announcementForm.patchValue({
        sendTo: response.sendTo,
        title: response.title,
        body: response.body,
        id:response.id,
        attachmentsFileName: response.attachmentsFileName
      });
    });
  }


  deleteItem(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Annoucement'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getAnnouncementList();
    });
  }

    deleteImage() {
    this.adminService.deleteAnnoucementDoc(this.selectedFileId).subscribe((data: any) => {
      this.selectedFilePath = null;
      this.selectedFile = null;
      this.profilePicture = [];
      this.notificationService.showSuccess("Attachment Deleted Successfully");
    })
  }

  profilePicture = []

  onSelected(event: any) {
    this.selectedFile = null
    this.selectedFilePath = null
    this.profilePicture = []
    const file = event.target.files[0];
    if (file) {
      this.profilePicture.push(file)
      this.announcementForm.get('attachmentsFileName').setValue(file);
    }
  }


  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

}
