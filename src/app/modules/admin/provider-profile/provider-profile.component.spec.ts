import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderProfileComponent } from './provider-profile.component';

describe('ProviderProfileComponent', () => {
  let component: ProviderProfileComponent;
  let fixture: ComponentFixture<ProviderProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderProfileComponent]
    });
    fixture = TestBed.createComponent(ProviderProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
