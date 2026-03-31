import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AitListComponent } from './ait-list.component';

describe('AitListComponent', () => {
  let component: AitListComponent;
  let fixture: ComponentFixture<AitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AitListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
