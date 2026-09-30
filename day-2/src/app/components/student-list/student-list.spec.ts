import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentList } from './student-list';
import { CapitalizePipe } from '../../pipes/capitalize-pipe';
import { FilterByNamePipe } from '../../pipes/filter-by-name-pipe';
import { Student } from '../../models/student.model';

describe('StudentList', () => {
  let component: StudentList;
  let fixture: ComponentFixture<StudentList>;

  const sample: Student[] = [
    { id: 1, name: 'jane doe', email: 'jane@example.com', course: 'angular' },
    { id: 2, name: 'john smith', email: 'john@example.com', course: 'typescript' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentList, CapitalizePipe, FilterByNamePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentList);
    component = fixture.componentInstance;
    component.students = sample;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one row per student with *ngFor', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.student-row');
    expect(rows.length).toBe(2);
  });

  it('should show the empty state when the search matches nothing (*ngIf)', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.search') as HTMLInputElement;
    input.value = 'no-such-student';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.empty');
    expect(empty?.textContent).toContain('No students match your search.');
  });

  it('should capitalize names via the custom pipe', () => {
    fixture.detectChanges();
    const name = fixture.nativeElement.querySelector('.name');
    expect(name?.textContent).toContain('Jane Doe');
  });

  it('should toggle the details panel on click', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.details')).toBeNull();

    const button = fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const details = fixture.nativeElement.querySelector('.details');
    expect(details?.textContent).toContain('jane@example.com');
  });
});
