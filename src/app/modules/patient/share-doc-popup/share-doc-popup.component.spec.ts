import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareDocPopupComponent } from './share-doc-popup.component';

describe('ShareDocPopupComponent', () => {
  let component: ShareDocPopupComponent;
  let fixture: ComponentFixture<ShareDocPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShareDocPopupComponent]
    });
    fixture = TestBed.createComponent(ShareDocPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
