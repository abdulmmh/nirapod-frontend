import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TinEditComponent } from './tin-edit.component';

describe('TinEditComponent', () => {
  let component: TinEditComponent;
  let fixture: ComponentFixture<TinEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TinEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TinEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
