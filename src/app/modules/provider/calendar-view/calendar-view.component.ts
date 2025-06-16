import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddAvailabilityComponent } from '../add-availability/add-availability.component';
import { ProviderService } from 'src/app/Services/provider.service';
import { WeekDay } from '@angular/common';
import { NotificationService } from 'src/app/Services/notification.service';
import { AuthService } from 'src/app/Services/auth.service';
function getCentralAmericaDate(date?: string | Date): Date {
  const timeZone = 'America/Guatemala';
  const baseDate = date ? new Date(date) : new Date();
  const centralDate = new Date(baseDate.toLocaleString('en-US', { timeZone }));
 
  const utcDate = baseDate.getUTCDate();
  const centralDay = centralDate.getDate();
 
  if (centralDay < utcDate) {
    centralDate.setDate(centralDate.getDate() + 1);
  }
 
  return centralDate;
}
@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {


  daysArray: { date: Date; day: string }[] = [];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  visibleMonths: string[] = [];
  selectedYear: any;
  weeksInMonth: any;
  showWeek: boolean = false
  customDate: any
  currentDate: any;
  selectedMonth: any;
  planData: any
  monthlyData: any
  userInfo: any

  constructor(private modalService: NgbModal,
    private providerService: ProviderService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo()
    if (this.userInfo.accountType != 'IndependentProvider') {
      this.getFacilityProvidersList()
    }
    this.userId = this.userInfo.userId
    this.getCurrentDate();
    this.showCurrentMonth();
    this.showWeekData();
  //  this.getMonthlyPlanData();
  }
  onProviderSelect(event: Event): void {
    const selectedUserId = (event.target as HTMLSelectElement).value;
    
    if (selectedUserId) {
      this.userId = selectedUserId
      if(this.showWeek == true){
        this.getWeekPlanData()
      }
      else  {
        this.getMonthlyPlanData()
      }
   
    }
  }

  getCurrentDate(): string {
    
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    this.currentDate = `${year}-${month}-${day}`;
    this.customDate = this.currentDate
    return `${year}-${month}-${day}`;
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  isTooltipVisible = false;
  tooltipStyles = {};
  tooltipDate: string;
  tooltipFrequency: string;
  tooltipWeekDay: string;

  showTooltip(event: MouseEvent, item: any, date: string, frequency: string, weekDay: string) {
    // Set tooltip visibility and position

    if (item.status === 'Booked') {
      this.isTooltipVisible = true;
      this.tooltipStyles = {
        position: 'absolute',
        top: `${event.clientY + 10}px`,
        left: `${event.clientX + 10}px`
      };
    }
    // Set tooltip content
    this.tooltipDate = date;
    this.tooltipFrequency = frequency;
    this.tooltipWeekDay = weekDay;
  }
  handleOtherStatus(item: any) {
    // Custom handling for non-booked items when clicked
    console.log('Clicked on a non-booked item', item);
  }
  hideTooltip() {
    this.isTooltipVisible = false;
  }
  createAvailability(date: any, day: any, startTime: any) {
    const currentDate = new Date();
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const days = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${days}`;
    const currentDateAtMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();
    const selectedDateAtMidnight = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();

    //const formattedDate = selectedDate.toISOString().split('T')[0];
    const obj = {
      day: day,
      date: formattedDate,
      startTime: startTime
    };
    if (selectedDateAtMidnight < currentDateAtMidnight) {
      this.notificationService.showDanger('You cannot create availability for a past date.');
      return;
    }

    const modalRef = this.modalService.open(AddAvailabilityComponent, {

      size: 'md',
      centered: true,
      windowClass: 'custom-modal'
    });
    modalRef.componentInstance.createNew = obj;
    modalRef.componentInstance.providerId = this.userId;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getWeekPlanData();
    });
  }





  showCurrentMonth() {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    const currentMonthIndex = this.months.indexOf(currentMonth);

    if (currentMonthIndex !== -1) {
      this.visibleMonths = this.months.slice(currentMonthIndex, currentMonthIndex + 1);
      this.selectedYear = currentYear;
      this.daysArray = this.getDaysInMonth(this.visibleMonths[0], this.selectedYear);
      this.weeksInMonth = this.getWeeks(currentMonthIndex, this.selectedYear);
      const date = new Date(this.daysArray[0].date);
      const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      this.getMonthlyPlanData();
    }
  }

  getWeeks(month, year): { weekNumber: number; startDate: Date; endDate: Date; daysInWeek: number }[] {
    // const day = date.getDate();
    
    var weekStartDate = new Date(year, month, 1);
    var numberOfDaysInMonth = new Date(year, month + 1, 0).getDate();//TODO: validate
    var weeks = [];
    var weekNumber = 1;
    do {

      var daysInWeek = this.getDaysInWeek(weekStartDate);
      var weekEndDate = new Date(weekStartDate.getTime());

      var endDatePartValue = weekEndDate.getDate() + daysInWeek - 1;

      if (endDatePartValue > numberOfDaysInMonth) {
        endDatePartValue = numberOfDaysInMonth;
        daysInWeek = endDatePartValue - weekStartDate.getDate() + 1;
      }

      weekEndDate.setDate(endDatePartValue);

      var week: { weekNumber: number; startDate: Date; endDate: Date; daysInWeek: number } = {
        weekNumber: weekNumber,
        startDate: new Date(weekStartDate.getTime()),
        endDate: weekEndDate,
        daysInWeek: daysInWeek
      }
      weeks.push(week);
      weekStartDate.setDate(weekEndDate.getDate() + 1);
      weekNumber++;

    } while (weekEndDate.getDate() < numberOfDaysInMonth);
    return weeks;

  }
  getDaysInWeek(dateValue): number {
    const date = new Date(dateValue);
    const dayOfWeek = date.getDay();
    var daysInWeek = 8 - dayOfWeek;
    if (dayOfWeek == 0) {
      daysInWeek = 1;
    }
    return daysInWeek;
  }


  getDaysInMonth(month: string, year: number): { date: Date; day: string; week: number }[] {
    const daysInMonth = new Date(year, this.months.indexOf(month) + 1, 0).getDate();
    const daysArray = [];

    // Helper function to determine week number in the month
    const getWeekOfMonth = (date: Date): number => {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const startDay = start.getDay();
      return Math.ceil((date.getDate() + startDay) / 7);
    };

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, this.months.indexOf(month), i);
      const day = this.getDayOfWeek(date.getDay());
      const weekNumber = getWeekOfMonth(date);

      daysArray.push({ date, day, week: weekNumber });
    }

    return daysArray;
  }
  private getDayOfWeek(dayIndex: number): string {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOfWeek[dayIndex];
  }

  showPreviousMonth() {
    const firstVisibleMonth = this.visibleMonths[0];
    const firstVisibleMonthIndex = this.months.indexOf(firstVisibleMonth);
    if (firstVisibleMonthIndex !== -1) {
      const prevIndex = firstVisibleMonthIndex - 1;
      // this.weeksInMonth=this.getWeeks(prevIndex, this.selectedYear);
      if (prevIndex >= 0) {
        this.visibleMonths = this.months.slice(prevIndex, prevIndex + this.visibleMonths.length);
        this.daysArray = this.getDaysInMonth(this.visibleMonths[0], this.selectedYear);
        const date = new Date(this.daysArray[0].date);
        const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        this.weeksInMonth = this.getWeeks(prevIndex, this.selectedYear);
        this.customDate = dateStr
        this.getMonthlyPlanData()
      } else {
        this.selectedYear -= 1;
        this.visibleMonths = [this.months[this.months.length - 1]];
        this.weeksInMonth = this.getWeeks(this.months.length - 1, this.selectedYear);
        this.daysArray = this.getDaysInMonth(this.visibleMonths[0], this.selectedYear);
        const date = new Date(this.daysArray[0].date);
        const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        this.customDate = dateStr
        this.getMonthlyPlanData()
      }
    }
  }

  showNextMonths() {
    const lastVisibleMonth = this.visibleMonths[this.visibleMonths.length - 1];
    const lastVisibleMonthIndex = this.months.indexOf(lastVisibleMonth);

    if (lastVisibleMonthIndex !== -1) {
      const nextIndex = lastVisibleMonthIndex + 1;
      if (nextIndex < this.months.length) {
        this.visibleMonths = [this.months[nextIndex]];
        this.weeksInMonth = this.getWeeks(nextIndex, this.selectedYear);
        this.updateDaysArray();
      } else {
        this.selectedYear += 1;
        this.visibleMonths = [this.months[0]];
        this.weeksInMonth = this.getWeeks(0, this.selectedYear);
        this.updateDaysArray();
      }
    }
  }

  updateDaysArray() {
    this.daysArray = this.getDaysInMonth(this.visibleMonths[0], this.selectedYear);
    const date = new Date(this.selectedYear, this.months.indexOf(this.visibleMonths[0]), 1);
    const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    this.customDate = dateStr
    this.getMonthlyPlanData();
  }
  showWeekData() {
    this.showWeek = true
    this.getWeekDays(this.currentDate)
    this.customDate = this.currentDate
    // this.getWeekDays('2024-11-11')
    // this.customDate = '2024-11-11'
    this.getWeekPlanData()
  }

  showDatePicker(datePicker: HTMLInputElement): void {
    datePicker.style.display = 'inline-block';
    datePicker.style.opacity = '0';
    datePicker.style.width = '0';
    datePicker.focus();

    setTimeout(() => {
      datePicker.showPicker();
    }, 10);
  }

  onDateChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.updateVisibleMonthsAndYear(input.value);
  }


  updateVisibleMonthsAndYear(date: string): void {
    const [year, month] = date.split('-').map(Number);
    this.selectedYear = year;
    this.visibleMonths = [this.months[month - 1]];
    this.updateDaysArray();
  }

  userId: any
  initialLoading: boolean = false
  getMonthlyPlanData() {
    
    this.monthlyData = null
    this.initialLoading = true
    this.providerService.getMonthlyData(this.customDate, this.userId).subscribe((response: any) => {
      const plan = response;
      this.userId = response.userId
   
      const timeRanges = this.generateTimeRanges();
      const allDates: Set<string> = new Set(plan.availabilities.map((availability: any) => availability.date));

      this.daysArray.forEach((item: any) => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        allDates.add(dateStr);
      });

      const groupedByTimeRange: any = {};

      timeRanges.forEach((range) => {
        groupedByTimeRange[range.label] = [];
        allDates.forEach((date) => {
          const availability = plan.availabilities.find((av: any) => av.date === date);
          const slotsInRange = availability?.slots.filter((slot: any) => {
            return slot.startTime >= range.start && slot.startTime < range.end;
          }) || [];

          if (slotsInRange.length > 0) {
            groupedByTimeRange[range.label].push({
              date: date,
              frequency: availability.frequency,
              weekDay: availability.weekDay,
              slots: slotsInRange
            });
          } else {
            const weekDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            groupedByTimeRange[range.label].push({
              date: date,
              frequency: null,
              weekDay: weekDay,
              slots: null
            });
          }
        });
      });

      Object.keys(groupedByTimeRange).forEach((key) => {
        groupedByTimeRange[key].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });
      const sortedGroupedByTimeRange: any[] = [];
      timeRanges.forEach((range) => {
        const key = range.label;
        if (groupedByTimeRange[key]) {
          sortedGroupedByTimeRange.push({
            range: key,
            slots: groupedByTimeRange[key]
          });
        }
      });
      this.initialLoading = false
      this.monthlyData = sortedGroupedByTimeRange;
      
      console.log('monthlyData ', this.monthlyData)
    })

  }
  getWeekPlanData() {
    
    this.initialLoading = true
    this.planData = null
    this.providerService.getWeekData(this.customDate,this.userId).subscribe((response: any) => {
      const plan = response;
      this.userId = response.userId
      const timeRanges = this.generateTimeRanges();
      const allDates: Set<string> = new Set(plan.availabilities.map((availability: any) => availability.date));

      this.daysArray.forEach((item: any) => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        allDates.add(dateStr);
        this.getMonthlyPlanData();
      });

      const groupedByTimeRange: any = {};

      timeRanges.forEach((range) => {
        groupedByTimeRange[range.label] = [];
        allDates.forEach((date) => {
          const availability = plan.availabilities.find((av: any) => av.date === date);
          const slotsInRange = availability?.slots.filter((slot: any) => {
            return slot.startTime >= range.start && slot.startTime < range.end;
          }) || [];

          if (slotsInRange.length > 0) {
            groupedByTimeRange[range.label].push({
              date: date,
              frequency: availability.frequency,
              weekDay: availability.weekDay,
              slots: slotsInRange
            });
          } else {
            const weekDay = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            groupedByTimeRange[range.label].push({
              date: date,
              frequency: null,
              weekDay: weekDay,
              slots: null
            });
          }
        });
      });

      Object.keys(groupedByTimeRange).forEach((key) => {
        groupedByTimeRange[key].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });
      const sortedGroupedByTimeRange: any[] = [];
      timeRanges.forEach((range) => {
        const key = range.label;
        if (groupedByTimeRange[key]) {
          sortedGroupedByTimeRange.push({
            range: key,
            slots: groupedByTimeRange[key]
          });
        }
      });
    
      this.initialLoading = false
      this.planData = sortedGroupedByTimeRange;
      console.log('pland data', this.planData)
    })

  }

  generateTimeRanges() {
    const timeRanges: any[] = [];
    for (let i = 0; i < 24; i++) {
      const hour = i;
      const nextHour = (i + 1) % 24;
      const label = this.formatHour(hour);
      const start = this.formatTime(hour);
      let end = this.formatTime(nextHour);

      // Adjust end time for the 12 PM range to be 11:59 PM
      if (hour === 23) {
        end = '23:59:00'; // 11:59 PM in 24-hour format
      }

      timeRanges.push({ label: label, start: start, end: end });
    }
    return timeRanges;
  }


  formatHour(hour: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${ampm}`;
  }

  formatTime(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00:00`;
  }
  showCurrentWeek() {
    this.customDate = this.currentDate
    // this.getWeekPlanData()
  }
  showMonthData() {
    
    this.showWeek = false
    // this.getPlanData(this.scheduleForm.get('date')!.value)
    this.onDateChange()
  }
  
  onDateChange() {
    const selectedDate: Date | null = this.currentDate
    
    if (selectedDate) {
      const date = new Date(selectedDate);
      this.selectedYear = new Date(selectedDate).getFullYear();
      this.selectedMonth = new Date(selectedDate).getMonth() + 1;
    } else {
      this.selectedYear = new Date().getFullYear();
    }
    this.customDate = this.currentDate
    this.updateVisibleMonths();
  }
  updateVisibleMonths() {
    
    if (this.selectedMonth === undefined) {
      this.visibleMonths = ['November', 'December'];
    } else {
      const index = this.months.indexOf(this.getMonthName(this.selectedMonth));
      const end = Math.min(index + 1, this.months.length);
      this.visibleMonths = this.months.slice(index, end);
      this.daysArray = this.getDaysInMonth(this.visibleMonths[0], this.selectedYear);
    }
  }
  getMonthName(monthIndex: number): string {
    return this.months[monthIndex - 1];
  }

  weekMonth: any
  showPreviousWeek() {
    let date = new Date(this.customDate);
    date.setDate(date.getDate() - 7);
    this.customDate = date.toISOString().split('T')[0];
    this.getWeekDays(this.customDate)
    this.getWeekPlanData()
  }
  showNextWeek() {
    let date = new Date(this.customDate);
    date.setDate(date.getDate() + 7);
    this.customDate = date.toISOString().split('T')[0];
    this.getWeekDays(this.customDate)
    this.getWeekPlanData()
  }
getWeekDays(inputDate) {
const currentDate = getCentralAmericaDate(inputDate);
    const currentDayIndex = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
 
    const daysToMonday = (currentDayIndex + 6) % 7;
    startOfWeek.setDate(currentDate.getDate() - daysToMonday);
 
    this.weekMonth = new Date(startOfWeek).toLocaleString('default', { month: 'long', year: 'numeric' });
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
 
    const weekDays = [];
    for (let day = new Date(startOfWeek); day <= endOfWeek; day.setDate(day.getDate() + 1)) {
      weekDays.push({
        date: new Date(day),
        day: day.toLocaleDateString('en-US', { weekday: 'long' }),
      });
    }
    this.daysArray = weekDays;
    console.log("this is weekdays",weekDays);
    return weekDays;
 
  }
  openDialog(data: any, date: any, frequency: any, weekDay: any) {
    
  
    const currentDate = new Date();
    const selectedDate = new Date(date);

    if (selectedDate < currentDate) {
      this.notificationService.showDanger('You can not create the availability for the past date.');
      return;
    }
    const obj = {
      date: date,
      data: data,
      frequency: frequency,
      weekDay: weekDay
    }
    const modalRef = this.modalService.open(AddAvailabilityComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
   
    modalRef.componentInstance.data = obj
    modalRef.componentInstance.providerId = this.userId;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getWeekPlanData()
    });
  }

  facilityProviderList = []
  getFacilityProvidersList() {
    this.providerService.getFacilityProvidersDropdownList(this.userInfo.userId).subscribe((response: any) => {
      this.facilityProviderList = response
    })
  }
  openBookedDetails(startTime: any, date: any) {
    const obj = {
      date: date,
      startTime: startTime,
    }
    const modalRef = this.modalService.open(AddAvailabilityComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.bookedDetails = obj
    modalRef.componentInstance.providerId = this.userId;
  }

}
