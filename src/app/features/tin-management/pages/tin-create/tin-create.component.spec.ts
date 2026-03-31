import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TinCreateComponent } from './tin-create.component';

describe('TinCreateComponent', () => {
  let component: TinCreateComponent;
  let fixture: ComponentFixture<TinCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TinCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TinCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
