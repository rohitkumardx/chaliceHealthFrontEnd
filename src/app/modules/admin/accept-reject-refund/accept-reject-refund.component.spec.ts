import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptRejectRefundComponent } from './accept-reject-refund.component';

describe('AcceptRejectRefundComponent', () => {
  let component: AcceptRejectRefundComponent;
  let fixture: ComponentFixture<AcceptRejectRefundComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AcceptRejectRefundComponent]
    });
    fixture = TestBed.createComponent(AcceptRejectRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
