import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { StudentList } from './student-list';
import { StudentsDataService } from '../services/students-data';
import { Student } from '../models/student.model';

describe('StudentList', () => {
  let fixture: ComponentFixture<StudentList>;

  const sample: Student[] = [
    { id: 1, name: 'Jane Doe', course: 'Angular' },
    { id: 2, name: 'John Smith', course: 'TypeScript' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentList],
      imports: [RouterModule.forRoot([])],
      providers: [{ provide: StudentsDataService, useValue: { getAll: () => sample } }],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentList);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render one link per student', () => {
    fixture.detectChanges();
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain('Jane Doe');
    expect(links[1].textContent).toContain('John Smith');
  });
});
