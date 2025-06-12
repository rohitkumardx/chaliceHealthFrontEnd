import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/Services/admin.service';
//import { ExportToCsv } from 'export-to-csv';
//import * as XLSX from 'xlsx';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  amountData: any
  totalAmountCount: any
facilityData: any[] = [];
filteredFacilities: any[] = [];
facilitySearchTerm: string = '';
 
// selectedFacility: number | null = null;
selectedFacilityName: string = '';
  chartData:any;
  yearOptions: any[];
  selectedFacilityId: any;
  isClick:boolean=false;
  constructor(private adminService: AdminService) { }
  currentYear: number = new Date().getFullYear();
  selectedFacility: string = "";
  ngOnInit() {
    this.getFacilityList();
    this.yearOptions = this.getYearDropdown();
   this.getAmountData();
   this.getTotalCount();
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
    this.selectedFacility;
    if (type === 'year') {
      year = event.target.value;  // Update the year if the change was from the year dropdown
      this.selectedFacilityId = this.selectedFacilityId;
      this.getAdminChartData(this.selectedFacilityId, year); // Keep the current facility ID as is
    } else if (type === 'facility') {
      facilityId = event.target.value;  // Update selected facility if the change was from the facility dropdown
      this.currentYear = this.currentYear; // Keep the current year as is
      this.getAdminChartData(facilityId, this.currentYear);
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
 
filterFacilityOptions() {
  const term = this.facilitySearchTerm.toLowerCase();
  this.filteredFacilities = this.facilityData.filter(facility =>
    facility.facilityName.toLowerCase().includes(term)
  );
}
 
selectFacility(facility: any) {
  this.selectedFacility = facility.id;
  this.selectedFacilityName = facility.facilityName;
  this.onChange({ target: { value: facility.id } }, 'facility');
}
  getAdminChartData(id,year) {
    this.adminService.getAdminDashboardData(id,year).subscribe((response: any) => {
      this.chartData = response.monthly; // Assuming response contains the monthly data
      this.calculateBarThickness(this.chartData);
    });
  }
 
  downloadCSV(){
  this.isClick=true;
  }
  preview() {
    const csvContent = this.convertToCSV();
    const tableHtml = this.convertCSVToTable(csvContent);
 
    // Open a new window for the preview
    const previewWindow = window.open('', 'CSV Preview', 'width=800,height=600');
    previewWindow.document.write(`
      <html>
        <head>
          <title>CSV Preview</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            button {
              margin-top: 20px;
              padding: 10px;
              background-color: #00876F;
              color: white;
              border: none;
              cursor: pointer;
              border-radius: 5px;
            }
            button:hover {
              background-color: #006f4f;
            }
          </style>
        </head>
        <body>
          <h2>CSV Preview</h2>
          ${tableHtml}
         
        </body>
      </html>
    `);
    previewWindow.document.close();
  }
   //  <button onclick="window.opener.download()">Download CSV</button>
  // Method to convert CSV content into an HTML table
  convertCSVToTable(csvContent) {
    const rows = csvContent.split('\n');
    const table = document.createElement('table');
   
    rows.forEach((row, index) => {
      const tr = document.createElement('tr');
      const cells = row.split(',');
 
      cells.forEach(cell => {
        const td = document.createElement(index === 0 ? 'th' : 'td');
        td.textContent = cell;
        tr.appendChild(td);
      });
 
      table.appendChild(tr);
    });
 
    return table.outerHTML;
  }
 
closePopUp(){
  this.isClick=false;
}
 
  download() {
    const csvContent = this.convertToCSV();
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    link.download = 'all_chart_data.csv';
    link.click();
    this.isClick=false;
  }
 
  // Convert the data into CSV format
  convertToCSV(): string {
    // CSV headers
    const headers = [
      'Month',
      'Total Booked Appointments',
      'Total Cancelled Appointments',
      'Total Completed Appointments',
      'Total Incomplete Appointments',
      'Total Booking Amount',
      'Total Booking By Patients'
    ];
 
    // Extract booking counts and amounts from barChartData1 and barChartData2
    const bookingCounts = this.barChartData1[0]?.data || []; // Assuming it's in barChartData1[0].data
    const bookingAmounts = this.barChartData2[0]?.data || []; // Assuming it's in barChartData2[0].data
 
    // Loop through each month in chartData and build the rows
    const rows = Object.keys(this.chartData).map((month, index) => {
      const monthData = this.chartData[month]; // Access the data for each month
      const bookingCount = bookingCounts[index] || 0;
      const bookingAmount = bookingAmounts[index] || 0;
 
      return [
        month, // Month
        monthData.totalBookedAppointment, // Total Booked Appointments
        monthData.totalCancelledAppointment, // Total Cancelled Appointments
        monthData.totalCompletedAppointment, // Total Completed Appointments
        monthData.totalIncompleteAppointment, // Total Incomplete Appointments
        bookingCount, // Monthly Booking Count from barChartData1
        bookingAmount // Monthly Booking Amount from barChartData2
      ].join(',');
    }).join('\n');
 
    // Return the CSV content
    return headers.join(',') + '\n' + rows;
  }
 
 
 
 
  calculateBarThickness(Data) {
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
        this.facilityData = response
        this.filteredFacilities = [...this.facilityData];
      this.currentYear = this.yearOptions[0];  // Default to the first year
      //this.selectedFacilityId = this.facilityData[0]?.id || 0;  // Default to the first facility
      // Now call the function with the default values
      this.getAdminChartData(this.selectedFacilityId, this.currentYear);
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
        offset: -4
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
 
 