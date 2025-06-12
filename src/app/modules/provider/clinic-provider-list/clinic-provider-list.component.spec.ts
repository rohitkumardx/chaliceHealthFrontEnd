import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicProviderListComponent } from './clinic-provider-list.component';

describe('ClinicProviderListComponent', () => {
  let component: ClinicProviderListComponent;
  let fixture: ComponentFixture<ClinicProviderListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicProviderListComponent]
    });
    fixture = TestBed.createComponent(ClinicProviderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
