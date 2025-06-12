import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { ShowDetailsPopupComponent } from '../show-details-popup/show-details-popup.component';
import { Subscription } from 'rxjs';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { ProviderProfileComponent } from '../provider-profile/provider-profile.component';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {

  loading: boolean = false;
  totalRefundAmount: any;
  filteredItems = []
  searchTerm = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
   _=_ ;
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
  selectedValue: any = '6Months'
  transactionHistoryList = []
  transactionCountData: any
  totalAmount: any
  totalAmount1: any
  private notifyCloseSubscription: Subscription;

  constructor(
    private adminService: AdminService,
    private modalService: NgbModal,

  ) { }

  ngOnInit() {
    this.getTransactionHistory();
    this.getRefundAmount()

  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getTransactionHistory();
  }

  viewProfile(id: any) {
    const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
      // windowClass: 'custom-modal'
  
    });
    modalRef.componentInstance.patientId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getTransactionHistory();
    });
  }
  viewProviderProfile(id: any) {
    
    const modalRef = this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.providerId = id;
  modalRef.componentInstance.dialogClosed.subscribe(() => {
    this.getTransactionHistory();
  });
   
  }

  // transactionTotalData() {
  //   // this.loading = true;
  //   this.adminService.getTransactionTotalCount(this.selectedValue).subscribe((data: any) => {
  //     this.transactionCountData = data;

  //     // console.log('data', this.transactionCountData);
  //     // this.loading = false;

  //     // // Destroy previous charts if they exist
  //     // if (this.donutChart) {
  //     //   this.donutChart.destroy();
  //     // }
  //     // if (this.donutChart1) {
  //     //   this.donutChart1.destroy();
  //     // }
  //     // if (this.donutChart2) {
  //     //   this.donutChart2.destroy();
  //     // }

  //     // // Now, initialize the donut charts with the new data
  //     // // this.initializeDonutChart();
  //   });
  // }
  getRefundAmount(){
    this.adminService.getRefundAmount().subscribe((data: any) => {
      this.totalRefundAmount = data;
      console.log('Total refund amount data:', this.totalRefundAmount);
    });
  }

  getTransactionHistory() {
    //  this.transactionTotalData()
    this.loading = true
    this.adminService.getTransactionsHistory(this.selectedValue, this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.transactionHistoryList = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.transactionHistoryList = data.items;
          this.filteredItems = [...this.transactionHistoryList];
        }
      }
      this.loading = false
    console.log("transaction history data", this.transactionHistoryList)

      this.initializeDonutChart2()
      this.initializeDonutChart1()
    })
  }

  showDetails(id: any) {
    const modalRef = this.modalService.open(ShowDetailsPopupComponent, {
      size: 'md',
      centered: true,
      // windowClass: 'custom-modal'
    });

    modalRef.componentInstance.transactionId = id;
    //  modalRef.componentInstance.dialogClosed.subscribe(() => {
    //    this.getWeekPlanData();
    //  });
  }

  formatConsulationType(consultationType: string): string {
    return consultationType ? consultationType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }


  barChartType: string = 'bar';
  public donutChart: any;
  public donutChart1: any;

  public barChartOptions = {
    responsive: true,
  };
  public barChartLabels = ['January', 'February', 'March', 'April', 'May', 'June'];


  totalUsers = 0
  initializeDonutChart2() {
    this.adminService.getTransactionTotalCount(this.selectedValue).subscribe((data: any) => {
      this.totalAmount = data.totalAmount
      this.totalUsers = data.totalPatient + data.totalProvider + data.totalFacility + data.totalPrivatePractices
      if (this.donutChart) {
        this.donutChart.destroy();
      }

      const ctx = document.getElementById('donutChart') as HTMLCanvasElement;

      // Original labels and data
      const originalLabels = ['Patients', 'Providers', 'Facility', 'Private Practice'];
      const originalData = [data.totalPatient, data.totalProvider, data.totalFacility, data.totalPrivatePractices];
      const originalColors = ['#37A6A0', '#2B7C85', '#C3E0E5', '#6CB0A8'];

      // Filter labels, data, and colors where data is not 0
      const filteredLabels = [];
      const filteredData = [];
      const filteredColors = [];

      originalData.forEach((value, index) => {
        if (value !== 0) {
          filteredLabels.push(originalLabels[index]);
          filteredData.push(value);
          filteredColors.push(originalColors[index]);
        }
      });

      this.donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: filteredLabels,
          datasets: [
            {
              data: filteredData,
              backgroundColor: filteredColors,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 12,
                  family: 'Arial',
                },
                boxWidth: 15,
                padding: 5,
              },
            },
            tooltip: {
              position: 'nearest',
              yAlign: 'center',
              callbacks: {
                label: (tooltipItem: any) => {
                  return `${tooltipItem.label}: ${tooltipItem.raw}`;
                },
              },
            },
            datalabels: {
              color: 'white',
              font: {
                weight: 'bold',
                size: 14,
              },
              formatter: (value, context) => {
                return value; // Show the count directly on the segment
              },
            },
          },
          // cutout: '70%', // Inner circle
        },
        plugins: [
          ChartDataLabels,
          {
            id: 'customInnerCircle',
            afterDraw: (chart: any) => {
              const ctx = chart.ctx;
              const chartArea = chart.chartArea;
              const centerX = (chartArea.left + chartArea.right) / 2;
              const centerY = (chartArea.top + chartArea.bottom) / 2;

              // Text inside the circle
              ctx.font = 'bold 14px Arial';
              ctx.textAlign = 'center';
              ctx.fillStyle = '#333';
              ctx.fillText('Total Users', centerX, centerY - 15);
              ctx.font = ' 16px Arial';
              ctx.fillText(`${this.totalUsers}`, centerX, centerY + 15);
            },
          },
        ],
      });
    });
  }




  initializeDonutChart1() {
    this.adminService.getTransactionList(this.selectedValue).subscribe((response: any) => {
      if (this.donutChart1) {
        this.donutChart1.destroy();
      }
  
      const ctx = document.getElementById('donutChart1') as HTMLCanvasElement;
      ctx.style.height = '300px'; // You can set the desired height
      ctx.style.width = 'auto'; // Maintain width proportionally
      // Original labels and data
      const originalLabels = ['Gateway Fee', 'Provider Fee', 'Platform Service Fee'];
      const originalData = [
        response.gateWayProcessingFess,
        response.providerFess,
        response.platFormServicesFess,
      ];
      const originalColors = ['#5885af', '#2B7C85', '#C3E0E5'];
  
      // Filter labels, data, and colors where data is not 0
      const filteredLabels = [];
      const filteredData = [];
      const filteredColors = [];
  
      originalData.forEach((value, index) => {
        if (value !== 0) {
          filteredLabels.push(originalLabels[index]);
          filteredData.push(value);
          filteredColors.push(originalColors[index]);
        }
      });
  
      this.donutChart1 = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: filteredLabels,
          datasets: [
            {
              data: filteredData,
              backgroundColor: filteredColors,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 12,
                  family: 'Arial',
                },
                boxWidth: 15,
                padding: 5,
              },
            },
            tooltip: {
              position: 'nearest',
              yAlign: 'center',
              callbacks: {
                label: (tooltipItem: any) => {
                  return `${tooltipItem.label}: ${tooltipItem.raw}`;
                },
              },
            },
            datalabels: {
              color: 'white',
              font: {
                weight: 'bold',
                size: 12,
              },
              formatter: (value, context) => {
                return value; // Show the count directly on the segment
              },
            },
          },
          // cutout: '70%', // Uncomment to create an inner circle
        },
        plugins: [
          ChartDataLabels,
          {
            id: 'customInnerCircle',
            afterDraw: (chart: any) => {
              const ctx = chart.ctx;
              const chartArea = chart.chartArea;
              const centerX = (chartArea.left + chartArea.right) / 2;
              const centerY = (chartArea.top + chartArea.bottom) / 2;
  
              // Text inside the circle
              ctx.font = 'bold 14px Arial';
              ctx.textAlign = 'center';
              ctx.fillStyle = '#333';
              ctx.fillText('Total Amount', centerX, centerY - 15);
              ctx.font = ' 16px Arial';
              ctx.fillText(`$${response.amountPatientBooking}`, centerX, centerY + 15);
            },
          },
        ],
      });
    });
  }
  


}
