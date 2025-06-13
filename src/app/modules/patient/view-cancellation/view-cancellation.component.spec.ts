import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCancellationComponent } from './view-cancellation.component';

describe('ViewCancellationComponent', () => {
  let component: ViewCancellationComponent;
  let fixture: ComponentFixture<ViewCancellationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCancellationComponent]
    });
    fixture = TestBed.createComponent(ViewCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
