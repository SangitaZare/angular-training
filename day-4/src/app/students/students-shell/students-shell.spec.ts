import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { StudentsShell } from './students-shell';

describe('StudentsShell', () => {
  let component: StudentsShell;
  let fixture: ComponentFixture<StudentsShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentsShell],
      imports: [RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsShell);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the "Students" heading', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2')?.textContent).toContain('Students');
  });
});
