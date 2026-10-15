import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the bound title and count via interpolation', () => {
    component.title = 'Test Title';
    component.totalStudents = 3;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Test Title');
    expect(compiled.querySelector('.subtitle')?.textContent).toContain('3 students on record');
  });

  it('should use singular "student" when the count is 1', () => {
    component.totalStudents = 1;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.subtitle')?.textContent).toContain('1 student on record');
  });
});
