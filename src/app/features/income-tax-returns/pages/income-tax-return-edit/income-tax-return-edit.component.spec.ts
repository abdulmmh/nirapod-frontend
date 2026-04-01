import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTaxReturnEditComponent } from './income-tax-return-edit.component';

describe('IncomeTaxReturnEditComponent', () => {
  let component: IncomeTaxReturnEditComponent;
  let fixture: ComponentFixture<IncomeTaxReturnEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeTaxReturnEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeTaxReturnEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
