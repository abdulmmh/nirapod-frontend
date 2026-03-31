import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeCreateComponent } from './notice-create.component';

describe('NoticeCreateComponent', () => {
  let component: NoticeCreateComponent;
  let fixture: ComponentFixture<NoticeCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoticeCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoticeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
