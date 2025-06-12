import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderBenefitComponent } from './provider-benefit.component';

describe('ProviderBenefitComponent', () => {
  let component: ProviderBenefitComponent;
  let fixture: ComponentFixture<ProviderBenefitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderBenefitComponent]
    });
    fixture = TestBed.createComponent(ProviderBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
