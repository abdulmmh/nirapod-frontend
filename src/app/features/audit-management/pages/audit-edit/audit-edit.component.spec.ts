import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditEditComponent } from './audit-edit.component';

describe('AuditEditComponent', () => {
  let component: AuditEditComponent;
  let fixture: ComponentFixture<AuditEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
