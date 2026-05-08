import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalItrComponent } from './portal-itr.component';

describe('PortalItrComponent', () => {
  let component: PortalItrComponent;
  let fixture: ComponentFixture<PortalItrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalItrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalItrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
