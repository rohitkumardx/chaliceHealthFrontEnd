import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderServicesComponent } from './provider-services.component';

describe('ProviderServicesComponent', () => {
  let component: ProviderServicesComponent;
  let fixture: ComponentFixture<ProviderServicesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderServicesComponent]
    });
    fixture = TestBed.createComponent(ProviderServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
