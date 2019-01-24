import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedListPagePage } from './shared-list-page.page';

describe('SharedListPagePage', () => {
  let component: SharedListPagePage;
  let fixture: ComponentFixture<SharedListPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedListPagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedListPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
