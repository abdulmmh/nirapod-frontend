import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatReturnViewComponent } from './vat-return-view.component';

describe('VatReturnViewComponent', () => {
  let component: VatReturnViewComponent;
  let fixture: ComponentFixture<VatReturnViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatReturnViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatReturnViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
