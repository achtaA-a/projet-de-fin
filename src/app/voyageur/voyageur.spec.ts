import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Voyageur } from './voyageur';

describe('Voyageur', () => {
  let component: Voyageur;
  let fixture: ComponentFixture<Voyageur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Voyageur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Voyageur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
