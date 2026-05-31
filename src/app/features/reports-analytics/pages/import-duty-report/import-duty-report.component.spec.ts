import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDutyReportComponent } from './import-duty-report.component';

describe('ImportDutyReportComponent', () => {
  let component: ImportDutyReportComponent;
  let fixture: ComponentFixture<ImportDutyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDutyReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDutyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
