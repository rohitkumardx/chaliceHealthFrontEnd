import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingCategoryComponent } from './listing-category.component';

describe('ListingCategoryComponent', () => {
  let component: ListingCategoryComponent;
  let fixture: ComponentFixture<ListingCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListingCategoryComponent]
    });
    fixture = TestBed.createComponent(ListingCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
