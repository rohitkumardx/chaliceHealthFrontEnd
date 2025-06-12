import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportedMessagesListComponent } from './reported-messages-list.component';

describe('ReportedMessagesListComponent', () => {
  let component: ReportedMessagesListComponent;
  let fixture: ComponentFixture<ReportedMessagesListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportedMessagesListComponent]
    });
    fixture = TestBed.createComponent(ReportedMessagesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
