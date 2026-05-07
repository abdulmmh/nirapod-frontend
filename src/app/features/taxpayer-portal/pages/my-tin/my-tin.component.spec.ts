import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTinComponent } from './my-tin.component';

describe('MyTinComponent', () => {
  let component: MyTinComponent;
  let fixture: ComponentFixture<MyTinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyTinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
