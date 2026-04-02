import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDutyEditComponent } from './import-duty-edit.component';

describe('ImportDutyEditComponent', () => {
  let component: ImportDutyEditComponent;
  let fixture: ComponentFixture<ImportDutyEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDutyEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDutyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
