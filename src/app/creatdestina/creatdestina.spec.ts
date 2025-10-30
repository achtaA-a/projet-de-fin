import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Creatdestina } from './creatdestina';

describe('Creatdestina', () => {
  let component: Creatdestina;
  let fixture: ComponentFixture<Creatdestina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Creatdestina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Creatdestina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
