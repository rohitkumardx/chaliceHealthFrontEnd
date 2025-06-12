import { AppointmentRefundConfirmationComponent } from './appointment-refund-confirmation.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('AppointmentRefundConfirmationComponent', () => {
  let component: AppointmentRefundConfirmationComponent;
  let fixture: ComponentFixture<AppointmentRefundConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppointmentRefundConfirmationComponent]
    });
    fixture = TestBed.createComponent(AppointmentRefundConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
