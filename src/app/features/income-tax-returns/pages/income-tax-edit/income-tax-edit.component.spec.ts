import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTaxEditComponent } from './income-tax-edit.component';

describe('IncomeTaxEditComponent', () => {
  let component: IncomeTaxEditComponent;
  let fixture: ComponentFixture<IncomeTaxEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeTaxEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeTaxEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
