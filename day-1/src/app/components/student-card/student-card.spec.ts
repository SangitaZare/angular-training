import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCard } from './student-card';
import { Highlight } from '../../directives/highlight';

describe('StudentCard', () => {
  let component: StudentCard;
  let fixture: ComponentFixture<StudentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentCard, Highlight],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a fallback message when no student is set', () => {
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No student submitted yet');
  });

  it('should render the bound student via interpolation', () => {
    component.student = { id: 1, name: 'Jane Doe', email: 'jane@example.com', course: 'Angular' };
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Jane Doe');
    expect(text).toContain('jane@example.com');
    expect(text).toContain('Angular');
  });
});
