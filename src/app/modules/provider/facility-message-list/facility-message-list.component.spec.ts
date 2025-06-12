import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityMessageListComponent } from './facility-message-list.component';

describe('FacilityMessageListComponent', () => {
  let component: FacilityMessageListComponent;
  let fixture: ComponentFixture<FacilityMessageListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacilityMessageListComponent]
    });
    fixture = TestBed.createComponent(FacilityMessageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
