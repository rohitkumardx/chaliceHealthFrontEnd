import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AdminService } from 'src/app/Services/admin.service';
import { ProviderService } from 'src/app/Services/provider.service';

Chart.register(...registerables, ChartDataLabels);
@Component({
  selector: 'app-clinic-dashboard',
  templateUrl: './clinic-dashboard.component.html',
  styleUrls: ['./clinic-dashboard.component.css']
})
export class ClinicDashboardComponent implements OnInit {
  amountData: any
  totalAmountCount: any
  facilityData:any[];
  chartData:any;
  yearOptions: any[];
  selectedFacilityId: any;
  totalAmount: any;
  constructor(private adminService: AdminService,
    private providerService: ProviderService
  ) { 
    
  }
  currentYear: number = new Date().getFullYear();

  ngOnInit() {
    this.getproviderAmountByUserId();
    this.getFacilityList();
    this.yearOptions = this.getYearDropdown();
   this.getAmountData();
   this.getTotalCount();
   
  
  
  }


  getproviderAmountByUserId() {  
    this.providerService.getClinicDashboardByUserId().subscribe((data: any) => {
    this.totalAmount = data;
    console.log('Total amount data:', this.totalAmount);
  });
} 
  getYearDropdown(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    // Add the current year and the previous 5 years
    for (let i = 0; i <= 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  }
  onChange(event: any, type: string) {
    let year: any;
    let facilityId: any;
  
    if (type === 'year') {
      year = event.target.value;  // Update the year if the change was from the year dropdown
      this.selectedFacilityId = this.selectedFacilityId;
      this.getAdminChartData(year); // Keep the current facility ID as is
    } else if (type === 'facility') {
      facilityId = event.target.value;  // Update selected facility if the change was from the facility dropdown
      this.currentYear = this.currentYear; // Keep the current year as is
      this.getAdminChartData(this.currentYear);
    }
  }
  
  
  
  getAmountData() {
    this.adminService.getAmountData().subscribe((response: any) => {
      this.amountData = response;
      this.barChartData1 = [
        // { data: this.amountData.monthlyTotalAmounts, label: 'Total Amount' ,
        { data: this.amountData.monthlyBookingAmounts, label: 'Total Amount' ,
          backgroundColor: '#C2E2F5',
          

        },
      ]
    })
  }

  getTotalCount() {
    this.adminService.getAmountTotalCountData().subscribe((response: any) => {
      this.totalAmountCount = response

      this.barChartData2 = [
        { data: this.totalAmountCount.monthlyBookingCounts, label: 'Count of Booking ',
          backgroundColor: '#37A6A0',
         },
      ]
    })
  }

  getAdminChartData(year) {
    ;
    this.adminService.getClinicDasboardItems(year).subscribe((response: any) => {
      this.chartData = response.monthly; // Assuming response contains the monthly data
      this.calculateBarThickness(this.chartData);
    });
  }
  
  calculateBarThickness(Data) {
    ;
    const canvasWidth = window.innerWidth; // Get the window width
    const numberOfBars = Object.keys(Data).length * 4; // 4 bars per month (Booked, Cancelled, Completed, Incomplete)
   
  //const barThickness = Math.max(10, canvasWidth / (numberOfBars * 2)); // Decrease the divisor to 6 for thicker bars

    const barChartLabels = ['Booked', 'Cancelled', 'Completed', 'Incomplete']; // Common labels for all months
    this.barChartData = [];

    // Initialize empty data for each category (Booked, Cancelled, Completed, Incomplete)
    const bookedData = [];
    const cancelledData = [];
    const completedData = [];
    const incompleteData = [];

    // Iterate over months and push corresponding data values into the arrays
    Object.keys(Data).forEach(month => {
        bookedData.push(Data[month].totalBookedAppointment);
        cancelledData.push(Data[month].totalCancelledAppointment);
        completedData.push(Data[month].totalCompletedAppointment);
        incompleteData.push(Data[month].totalIncompleteAppointment);
    });
                                                                                                                                                          
    // Add the dataset for each category with common labels
    this.barChartData.push(
      {
        data: bookedData, 
        label: 'Booked Appointments',
        backgroundColor: '#00a98d', 
       // barThickness: barThickness,
        borderRadius: 3,
      },
      {
        data: cancelledData, 
        label: 'Cancelled Appointments',
        backgroundColor: '#d35400', 
      // barThickness: barThickness,
        borderRadius: 3, 
      },
      {
        data: completedData, 
        label: 'Completed Appointments',
        backgroundColor: '#85c1e9',  
       // barThickness: barThickness,
        borderRadius: 3, 
      },
      {
        data: incompleteData, 
        label: 'Incomplete Appointments',
        backgroundColor: '#FDDE55', 
     //  barThickness: barThickness,
        borderRadius: 3, 
      }
    );

    this.barChartLabels2 = Object.keys(Data); // Set the chart labels to the months
}
  getFacilityList() {
    this.adminService.getFacilityList().subscribe((response: any) => {
      ;
      this.facilityData = response
      this.currentYear = this.yearOptions[0];  // Default to the first year
      this.selectedFacilityId = this.facilityData[0]?.id || 0;  // Default to the first facility
      // Now call the function with the default values
      this.getAdminChartData(this.currentYear);
    })
  }

  public barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: true 
        }
      },
      y: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: true 
        }
      }
    },
    plugins: {
      datalabels: {
        display: true, 
        color: '#000', 
        font: {
          size: 12, 
          weight: 'normal'
        },
        anchor: 'end', 
        align: 'top', 
      }
    }
  };

  
  public barChartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  public barChartLabels2 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

 public barChartOptions2: any = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: false,  // Do not stack bars, as you want them side by side
      ticks: {
        font: {
          size: 12,  // Font size for X-axis ticks (labels for months)
        },
        autoSkip: true, // Automatically skips labels if they overlap
        maxRotation: 45, // Rotate labels if they overlap
        minRotation: 0, // Minimum rotation for labels
      },
      grid: {
        display: true,  // Make sure grid is displayed
        drawBorder: false,  // Do not draw the border on X-axis
      },
    },
    y: {
      stacked: false,  // Ensure Y-axis is not stacked (bars will be separate)
      ticks: {
        font: {
          size: 12,  // Font size for Y-axis ticks
        },
        stepSize: 1,  // Adjust this based on your data's range
        beginAtZero: true,  // Start Y-axis at 0 for consistency
      },
      grid: {
        display: false,  // Ensure grid lines are displayed
        borderDash: [5, 5],  // Dashed pattern for the grid lines
        lineWidth: 1,  // Optional: control line width
        color: 'rgba(0,0,0,0.1)',  
        drawOnChartArea: true,  // Ensure grid lines are drawn on the chart area
      },
    },
  },
  plugins: {
    datalabels: {
      display: false,  // Disable the data labels (numbers on the bars)
    },
  },
};

  
  public barChartData1: any[] = [];
  public barChartData2: any[] = [];
  public barChartLegend = true;
  public barChartData = [];


}
