import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTaxReportComponent } from './income-tax-report.component';

describe('IncomeTaxReportComponent', () => {
  let component: IncomeTaxReportComponent;
  let fixture: ComponentFixture<IncomeTaxReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeTaxReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeTaxReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
