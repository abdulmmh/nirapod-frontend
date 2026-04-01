import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTaxReturnCreateComponent } from './income-tax-return-create.component';

describe('IncomeTaxReturnCreateComponent', () => {
  let component: IncomeTaxReturnCreateComponent;
  let fixture: ComponentFixture<IncomeTaxReturnCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeTaxReturnCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeTaxReturnCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
