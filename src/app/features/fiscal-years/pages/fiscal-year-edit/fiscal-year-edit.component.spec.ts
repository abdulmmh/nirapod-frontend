import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalYearEditComponent } from './fiscal-year-edit.component';

describe('FiscalYearEditComponent', () => {
  let component: FiscalYearEditComponent;
  let fixture: ComponentFixture<FiscalYearEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiscalYearEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiscalYearEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
