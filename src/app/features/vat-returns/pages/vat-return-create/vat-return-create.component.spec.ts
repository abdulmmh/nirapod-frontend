import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatReturnCreateComponent } from './vat-return-create.component';

describe('VatReturnCreateComponent', () => {
  let component: VatReturnCreateComponent;
  let fixture: ComponentFixture<VatReturnCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatReturnCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatReturnCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
