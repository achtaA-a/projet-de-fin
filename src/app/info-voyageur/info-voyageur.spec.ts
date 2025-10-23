import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoVoyageur } from './info-voyageur';

describe('InfoVoyageur', () => {
  let component: InfoVoyageur;
  let fixture: ComponentFixture<InfoVoyageur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoVoyageur]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoVoyageur);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
