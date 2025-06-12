import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintListComponent } from './complaint-list.component';

describe('ComplaintListComponent', () => {
  let component: ComplaintListComponent;
  let fixture: ComponentFixture<ComplaintListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComplaintListComponent]
    });
    fixture = TestBed.createComponent(ComplaintListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
