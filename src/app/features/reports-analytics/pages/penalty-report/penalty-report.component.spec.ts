import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltyReportComponent } from './penalty-report.component';

describe('PenaltyReportComponent', () => {
  let component: PenaltyReportComponent;
  let fixture: ComponentFixture<PenaltyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PenaltyReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PenaltyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
