import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogCommentComponent } from './blog-comment.component';

describe('BlogCommentComponent', () => {
  let component: BlogCommentComponent;
  let fixture: ComponentFixture<BlogCommentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BlogCommentComponent]
    });
    fixture = TestBed.createComponent(BlogCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
