import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicProvidersListComponent } from './clinic-providers-list.component';

describe('ClinicProvidersListComponent', () => {
  let component: ClinicProvidersListComponent;
  let fixture: ComponentFixture<ClinicProvidersListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicProvidersListComponent]
    });
    fixture = TestBed.createComponent(ClinicProvidersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
