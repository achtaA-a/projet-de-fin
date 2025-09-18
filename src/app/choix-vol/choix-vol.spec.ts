import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoixVol } from './choix-vol';

describe('ChoixVol', () => {
  let component: ChoixVol;
  let fixture: ComponentFixture<ChoixVol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoixVol]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoixVol);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
