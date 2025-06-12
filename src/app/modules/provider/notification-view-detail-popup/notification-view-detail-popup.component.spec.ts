import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationViewDetailPopupComponent } from './notification-view-detail-popup.component';

describe('NotificationViewDetailPopupComponent', () => {
  let component: NotificationViewDetailPopupComponent;
  let fixture: ComponentFixture<NotificationViewDetailPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationViewDetailPopupComponent]
    });
    fixture = TestBed.createComponent(NotificationViewDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
