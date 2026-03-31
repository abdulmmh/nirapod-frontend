import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatReturnEditComponent } from './vat-return-edit.component';

describe('VatReturnEditComponent', () => {
  let component: VatReturnEditComponent;
  let fixture: ComponentFixture<VatReturnEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatReturnEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatReturnEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
