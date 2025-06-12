import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderDetailComponent } from './provider-detail.component';

describe('ProviderDetailComponent', () => {
  let component: ProviderDetailComponent;
  let fixture: ComponentFixture<ProviderDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderDetailComponent]
    });
    fixture = TestBed.createComponent(ProviderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
