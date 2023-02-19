import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TdipmAppTrizComponent } from './tdipm-app-triz.component';

describe('TdipmAppTrizComponent', () => {
  let component: TdipmAppTrizComponent;
  let fixture: ComponentFixture<TdipmAppTrizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TdipmAppTrizComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TdipmAppTrizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
