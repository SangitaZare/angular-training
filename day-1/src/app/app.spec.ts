import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AppModule } from './app-module';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the header title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Day 1');
  });

  it('should start with no student submitted', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.lastStudent).toBeNull();
  });

  it('should set lastStudent when onAddStudent is called', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.onAddStudent({ name: 'new student', email: 'new@example.com', course: 'angular' });

    expect(app.lastStudent).toEqual({
      id: 1,
      name: 'new student',
      email: 'new@example.com',
      course: 'angular',
    });
  });
});
