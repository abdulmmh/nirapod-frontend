import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDutyListComponent } from './import-duty-list.component';

describe('ImportDutyListComponent', () => {
  let component: ImportDutyListComponent;
  let fixture: ComponentFixture<ImportDutyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportDutyListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDutyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
