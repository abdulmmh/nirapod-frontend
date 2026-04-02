import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxableProductEditComponent } from './taxable-product-edit.component';

describe('TaxableProductEditComponent', () => {
  let component: TaxableProductEditComponent;
  let fixture: ComponentFixture<TaxableProductEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxableProductEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxableProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
