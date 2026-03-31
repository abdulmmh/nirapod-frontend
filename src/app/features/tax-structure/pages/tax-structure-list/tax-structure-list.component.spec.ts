import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxStructureListComponent } from './tax-structure-list.component';

describe('TaxStructureListComponent', () => {
  let component: TaxStructureListComponent;
  let fixture: ComponentFixture<TaxStructureListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxStructureListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxStructureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
