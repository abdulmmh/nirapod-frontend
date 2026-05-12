import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalApplicationStatusComponent } from './portal-application-status.component';

describe('PortalApplicationStatusComponent', () => {
  let component: PortalApplicationStatusComponent;
  let fixture: ComponentFixture<PortalApplicationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalApplicationStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalApplicationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
