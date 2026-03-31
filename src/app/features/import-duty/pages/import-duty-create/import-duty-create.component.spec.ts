import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDutyCreateComponent } from './import-duty-create.component';

describe('ImportDutyCreateComponent', () => {
  let component: ImportDutyCreateComponent;
  let fixture: ComponentFixture<ImportDutyCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDutyCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDutyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
