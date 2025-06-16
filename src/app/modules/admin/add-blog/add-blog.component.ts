import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Title } from 'chart.js';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-add-blog',
  templateUrl: './add-blog.component.html',
  styleUrls: ['./add-blog.component.css']
})
export class AddBlogComponent implements OnInit {
  document = [];
  selectedItems: any[] = [];
  selectedRole: any[] = [];
  checkedLanguageIds: any[] = [];
  blogAdd!: FormGroup;
  loading: boolean;
  hovering: boolean = false;
  userId: any;
  blogList: any;
  shouldDeleteOldFile: boolean = false;

  showEditTimeFile: boolean;
  editDocument: any;

  userList = [];
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
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private route: ActivatedRoute,
    private globalModalService: GlobalModalService,
    private authServise: AuthService,
    private modalService: NgbModal,

  ) { }


  ngOnInit() {
    this.route.queryParams.subscribe((parama: any) => {
      this.userId = parama.userId;
    });

    this.blogAdd = this.fb.group({
      id: ['0'],
      heading: [''],
      title: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      content: ['', [Validators.required, Validators.pattern, Validators.minLength(100)]],
      postFile: [null],
      shouldDeleteOldFile: [false]
    });

    this.getBlogList();

  }

  submitBlogAdd() {
  if (this.blogAdd.invalid) {
    this.notificationService.markFormGroupTouched(this.blogAdd);

    if (!this.blogAdd.get('postFile')?.value && !this.shouldDeleteOldFile) {
      this.blogAdd.get('postFile')?.setErrors({ required: true });
    }

    this.loading = false;
    this.notificationService.showDanger('Please fill all the required fields correctly.');
    return;
  }

  this.loading = true;
  const userInfo = this.authServise.getUserInfo();

  const formData = new FormData();
  formData.append('id', this.blogAdd.get('id')?.value || 0);
  formData.append('heading', this.blogAdd.get('heading')?.value);
  formData.append('Title', this.blogAdd.get('title')?.value);
  formData.append('Content', this.blogAdd.get('content')?.value);
  formData.append('userId', this.userId || userInfo.userId);
  formData.append('shouldDeleteOldFile', this.shouldDeleteOldFile ? 'true' : 'false');

  const postFileValue = this.blogAdd.get('postFile')?.value;
  if (postFileValue) {
    formData.append('PostFile', postFileValue);
  }

  const blogRequest = this.blogAdd.get('id')?.value == 0
    ? this.adminService.postblogAdd(formData)
    : this.adminService.updateBlog(formData);


  blogRequest.subscribe(
    (data) => {
      this.notificationService.showSuccess('Blog post saved successfully.');
      this.getBlogList();
      this.loading = false;
      this.blogAdd.reset();
      this.editDocument=null
      const fileInput = document.getElementById('postFileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      this.blogAdd.get('postFile')?.setValue(null);
      this.shouldDeleteOldFile = false; // reset flag
    },
    (error) => {
      this.notificationService.showDanger(getErrorMessage(error));
      this.loading = false;
    }
  );
}

  getBlogList() {
      // this.blogList = []
      this.adminService.getBlogList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
        this.blogList = null;
        if (data.items.length > 0) {
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.blogList = data.items
          console.log("This is blog",this.blogList);
          if (data && data.items && Array.isArray(data.items)) {
            this.blogList = data.items;
            this.filteredItems = [...this.blogList];
          }
        }       
  
      })
    }

  // In your component
  isContentLong(item: any): boolean {
    return item.content && item.content.split(/\s+/).length > 30;
  }

  toggleContent(item: any) {
    item.showFullContent = !item.showFullContent;
  }

  getFirstNWords(text: string, n: number): string {
    const words = text.split(/\s+/);
    return words.slice(0, n).join(' ');
  }

getBlogById(id: number) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  this.adminService.getBlogById(id).subscribe((data: any) => {
      this.blogAdd.patchValue(data);

    // Check and assign file if it exists
    if (data.postFileUrl) {
      this.editDocument = {
        filePath: environment.fileUrl + data.postFileUrl.replace(/\\/g, '/'),
        postFile: data.fileName
      };
    } else {
      this.editDocument = {
        filePath: null,
        postFile: null
      };
    }
   
  });
}

  deleteBlog(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Blog'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getBlogList();
    });
  }


onDeleteOldFile() {
  this.shouldDeleteOldFile = true;
  this.blogAdd.get('postFile')?.setValue(null);

  const fileInput = document.getElementById('postFileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
          this.editDocument=null
  }
}

  onDocumentSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.blogAdd.patchValue({ postFile: file });
      this.blogAdd.get('postFile')?.updateValueAndValidity();
    }
  }

  deleteDocument(file) {
    this.adminService.deleteAdminDocument(file.id).subscribe((data: any) => {
      this.editDocument = null
      this.notificationService.showSuccess("Document deleted");
    })
  }

  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getBlogList();
  }


}

