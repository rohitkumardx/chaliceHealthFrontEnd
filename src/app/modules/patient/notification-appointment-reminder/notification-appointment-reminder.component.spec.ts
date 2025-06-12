import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationAppointmentReminderComponent } from './notification-appointment-reminder.component';

describe('NotificationAppointmentReminderComponent', () => {
  let component: NotificationAppointmentReminderComponent;
  let fixture: ComponentFixture<NotificationAppointmentReminderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationAppointmentReminderComponent]
    });
    fixture = TestBed.createComponent(NotificationAppointmentReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
