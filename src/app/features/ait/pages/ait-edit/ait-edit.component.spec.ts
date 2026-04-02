import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AitEditComponent } from './ait-edit.component';

describe('AitEditComponent', () => {
  let component: AitEditComponent;
  let fixture: ComponentFixture<AitEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AitEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AitEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
