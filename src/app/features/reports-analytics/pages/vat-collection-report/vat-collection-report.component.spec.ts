import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatCollectionReportComponent } from './vat-collection-report.component';

describe('VatCollectionReportComponent', () => {
  let component: VatCollectionReportComponent;
  let fixture: ComponentFixture<VatCollectionReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatCollectionReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatCollectionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
