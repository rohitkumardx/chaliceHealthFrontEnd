import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAppointmentComponent } from './report-appointment.component';

describe('ReportAppointmentComponent', () => {
  let component: ReportAppointmentComponent;
  let fixture: ComponentFixture<ReportAppointmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportAppointmentComponent]
    });
    fixture = TestBed.createComponent(ReportAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
