import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPrescriptionByProviderComponent } from './add-prescription-by-provider.component';

describe('AddPrescriptionByProviderComponent', () => {
  let component: AddPrescriptionByProviderComponent;
  let fixture: ComponentFixture<AddPrescriptionByProviderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPrescriptionByProviderComponent]
    });
    fixture = TestBed.createComponent(AddPrescriptionByProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
