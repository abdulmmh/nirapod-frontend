import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxStructureViewComponent } from './tax-structure-view.component';

describe('TaxStructureViewComponent', () => {
  let component: TaxStructureViewComponent;
  let fixture: ComponentFixture<TaxStructureViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxStructureViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxStructureViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
