import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalYearListComponent } from './fiscal-year-list.component';

describe('FiscalYearListComponent', () => {
  let component: FiscalYearListComponent;
  let fixture: ComponentFixture<FiscalYearListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiscalYearListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiscalYearListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
