import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxableProductCreateComponent } from './taxable-product-create.component';

describe('TaxableProductCreateComponent', () => {
  let component: TaxableProductCreateComponent;
  let fixture: ComponentFixture<TaxableProductCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxableProductCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxableProductCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
