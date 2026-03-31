import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AitCreateComponent } from './ait-create.component';

describe('AitCreateComponent', () => {
  let component: AitCreateComponent;
  let fixture: ComponentFixture<AitCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AitCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AitCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
