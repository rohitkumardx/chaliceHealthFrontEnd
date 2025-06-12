import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowDetailsPopupComponent } from './show-details-popup.component';

describe('ShowDetailsPopupComponent', () => {
  let component: ShowDetailsPopupComponent;
  let fixture: ComponentFixture<ShowDetailsPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowDetailsPopupComponent]
    });
    fixture = TestBed.createComponent(ShowDetailsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
