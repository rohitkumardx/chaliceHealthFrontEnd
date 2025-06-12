import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationAlertsBlogsComponent } from './notification-alerts-blogs.component';

describe('NotificationAlertsBlogsComponent', () => {
  let component: NotificationAlertsBlogsComponent;
  let fixture: ComponentFixture<NotificationAlertsBlogsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationAlertsBlogsComponent]
    });
    fixture = TestBed.createComponent(NotificationAlertsBlogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
