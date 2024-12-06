import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderAppointmentListComponent } from './provider-appointment-list.component';

describe('ProviderAppointmentListComponent', () => {
  let component: ProviderAppointmentListComponent;
  let fixture: ComponentFixture<ProviderAppointmentListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderAppointmentListComponent]
    });
    fixture = TestBed.createComponent(ProviderAppointmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
