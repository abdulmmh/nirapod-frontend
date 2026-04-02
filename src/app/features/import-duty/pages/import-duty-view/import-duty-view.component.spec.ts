import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDutyViewComponent } from './import-duty-view.component';

describe('ImportDutyViewComponent', () => {
  let component: ImportDutyViewComponent;
  let fixture: ComponentFixture<ImportDutyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDutyViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDutyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
