import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatReturnListComponent } from './vat-return-list.component';

describe('VatReturnListComponent', () => {
  let component: VatReturnListComponent;
  let fixture: ComponentFixture<VatReturnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatReturnListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
