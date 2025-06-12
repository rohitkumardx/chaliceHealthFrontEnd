import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderReportViewComponent } from './provider-report-view.component';

describe('ProviderReportViewComponent', () => {
  let component: ProviderReportViewComponent;
  let fixture: ComponentFixture<ProviderReportViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderReportViewComponent]
    });
    fixture = TestBed.createComponent(ProviderReportViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
