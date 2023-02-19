import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TdipmAppHoqComponent } from './tdipm-app-hoq.component';

describe('TdipmAppHoqComponent', () => {
  let component: TdipmAppHoqComponent;
  let fixture: ComponentFixture<TdipmAppHoqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TdipmAppHoqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TdipmAppHoqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
