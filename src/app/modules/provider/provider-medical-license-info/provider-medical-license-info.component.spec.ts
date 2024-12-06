import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderMedicalLicenseInfoComponent } from './provider-medical-license-info.component';

describe('ProviderMedicalLicenseInfoComponent', () => {
  let component: ProviderMedicalLicenseInfoComponent;
  let fixture: ComponentFixture<ProviderMedicalLicenseInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderMedicalLicenseInfoComponent]
    });
    fixture = TestBed.createComponent(ProviderMedicalLicenseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
