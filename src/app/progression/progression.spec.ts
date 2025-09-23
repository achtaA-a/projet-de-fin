import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Progression } from './progression';

describe('Progression', () => {
  let component: Progression;
  let fixture: ComponentFixture<Progression>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Progression]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Progression);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
