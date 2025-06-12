import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationMedicationReminderComponent } from './notification-medication-reminder.component';

describe('NotificationMedicationReminderComponent', () => {
  let component: NotificationMedicationReminderComponent;
  let fixture: ComponentFixture<NotificationMedicationReminderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationMedicationReminderComponent]
    });
    fixture = TestBed.createComponent(NotificationMedicationReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
