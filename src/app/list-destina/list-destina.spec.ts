import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDestina} from './list-destina';

describe('ListDestina', () => {
  let component: ListDestina;
  let fixture: ComponentFixture<ListDestina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDestina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDestina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
