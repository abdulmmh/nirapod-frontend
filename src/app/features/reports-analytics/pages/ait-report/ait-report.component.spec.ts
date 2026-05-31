import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AitReportComponent } from './ait-report.component';

describe('AitReportComponent', () => {
  let component: AitReportComponent;
  let fixture: ComponentFixture<AitReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AitReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AitReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
