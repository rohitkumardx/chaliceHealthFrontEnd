import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderAppointmentsViewComponent } from './provider-appointments-view.component';

describe('ProviderAppointmentsViewComponent', () => {
  let component: ProviderAppointmentsViewComponent;
  let fixture: ComponentFixture<ProviderAppointmentsViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderAppointmentsViewComponent]
    });
    fixture = TestBed.createComponent(ProviderAppointmentsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
