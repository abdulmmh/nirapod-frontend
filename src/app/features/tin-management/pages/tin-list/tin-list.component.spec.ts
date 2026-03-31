import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TinListComponent } from './tin-list.component';

describe('TinListComponent', () => {
  let component: TinListComponent;
  let fixture: ComponentFixture<TinListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TinListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TinListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
