import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { environment } from 'src/environments/environment';
import { AddReviewComponent } from '../add-review/add-review.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';


@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit {
  patientId: any;
  ratingData : any;
  loading: boolean = false;
  filteredItems = [] 
    searchTerm = '';
    sortColumn: string = '';
    sortOrder: string = 'asc';
     _ = _ ;
    paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
      pageNumber: 1,
      pageSize: 8,
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
        private router: Router,
        private providerService: ProviderService,
        private patientService: PatientService,
        private route:ActivatedRoute,
        private authService:AuthService,
         private modalService: NgbModal,
   
      ) { }

  ngOnInit(): void {
    this.getReviewAndRatingByPatientId()
  }


  getReviewAndRatingByPatientId() {
    this.ratingData = [];
    this.loading = true;
  
    this.patientService.getReviewAndRatingByPatientId(
      this.searchTerm,
      this.paginator.pageNumber,
      this.paginator.pageSize,
      this.sortColumn,
      this.sortOrder
    ).subscribe(
      (data: any) => {
        if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
          // Append file URL to each item
          this.ratingData = data.items.map((item: any) => ({
            ...item,
            filePath: environment.fileUrl + item.filePath
          }));
  
          this.filteredItems = [...this.ratingData];
  
          this.paginator = {
            ...this.paginator,
            pageNumber: data.pageNumber,
            totalCount: data.totalCount,
            totalPages: data.totalPages,
          };
        } else {
          this.ratingData = [];
          this.filteredItems = [];
        }
  
        this.loading = false;
        console.log(this.ratingData);
      },
      (error) => {
        this.loading = false;
        console.error("Error fetching reviews and ratings:", error);
      }
    );
  }
  
 
  
  editItem(id: any){
    ;
      const obj = {
        Id : id,
      }
      const modalRef = this.modalService.open(AddReviewComponent, {
        backdrop: 'static',
        size: 'md',
        centered: true
      });
      modalRef.componentInstance.reviewObj = obj;
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.getReviewAndRatingByPatientId();
      });
    }

}
