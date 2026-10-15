import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, RouterModule, convertToParamMap } from '@angular/router';
import { Subject } from 'rxjs';

import { StudentDetail } from './student-detail';
import { StudentsDataService } from '../services/students-data';
import { Student } from '../models/student.model';

describe('StudentDetail', () => {
  let component: StudentDetail;
  let fixture: ComponentFixture<StudentDetail>;
  let paramMap$: Subject<ParamMap>;

  const sample: Student[] = [
    { id: 1, name: 'Jane Doe', course: 'Angular' },
    { id: 2, name: 'John Smith', course: 'TypeScript' },
  ];

  beforeEach(async () => {
    paramMap$ = new Subject<ParamMap>();

    await TestBed.configureTestingModule({
      declarations: [StudentDetail],
      imports: [RouterModule.forRoot([])],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        {
          provide: StudentsDataService,
          useValue: { getById: (id: number) => sample.find((s) => s.id === id) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show the student matching the current :id param', async () => {
    fixture.detectChanges();
    paramMap$.next(convertToParamMap({ id: '1' }));
    await fixture.whenStable();

    expect(component.student()).toEqual(sample[0]);
    expect(fixture.nativeElement.querySelector('h3')?.textContent).toContain('Jane Doe');
  });

  it('should update when the :id param changes without the component being recreated', async () => {
    // Mirrors the Day 3 lesson: this app is zoneless, and the component
    // reacts to the SAME instance receiving a new param, not a fresh
    // ngOnInit — the signal is what makes the second update actually render.
    fixture.detectChanges();
    paramMap$.next(convertToParamMap({ id: '1' }));
    await fixture.whenStable();

    paramMap$.next(convertToParamMap({ id: '2' }));
    await fixture.whenStable();

    expect(component.student()).toEqual(sample[1]);
    expect(fixture.nativeElement.querySelector('h3')?.textContent).toContain('John Smith');
  });

  it('should show a not-found message for an unknown id', async () => {
    fixture.detectChanges();
    paramMap$.next(convertToParamMap({ id: '999' }));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.missing')?.textContent).toContain('No student');
  });
});
