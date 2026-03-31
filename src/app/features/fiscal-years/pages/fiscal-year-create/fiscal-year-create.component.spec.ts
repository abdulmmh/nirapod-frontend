import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalYearCreateComponent } from './fiscal-year-create.component';

describe('FiscalYearCreateComponent', () => {
  let component: FiscalYearCreateComponent;
  let fixture: ComponentFixture<FiscalYearCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiscalYearCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiscalYearCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
