import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxStructureCreateComponent } from './tax-structure-create.component';

describe('TaxStructureCreateComponent', () => {
  let component: TaxStructureCreateComponent;
  let fixture: ComponentFixture<TaxStructureCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxStructureCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxStructureCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
