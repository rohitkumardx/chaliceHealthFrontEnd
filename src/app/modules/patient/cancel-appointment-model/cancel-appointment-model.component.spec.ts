import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelAppointmentModelComponent } from './cancel-appointment-model.component';

describe('CancelAppointmentModelComponent', () => {
  let component: CancelAppointmentModelComponent;
  let fixture: ComponentFixture<CancelAppointmentModelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelAppointmentModelComponent]
    });
    fixture = TestBed.createComponent(CancelAppointmentModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
