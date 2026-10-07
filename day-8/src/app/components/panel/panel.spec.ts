import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Panel } from './panel';

describe('Panel', () => {
  let fixture: ComponentFixture<Panel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Panel],
    }).compileComponents();

    fixture = TestBed.createComponent(Panel);
    fixture.componentRef.setInput('title', 'Test Panel');
    fixture.detectChanges();
  });

  it('renders the title passed in via @Input', () => {
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Test Panel');
  });

  it('has a default-slot body and a named panel-actions slot ready to project into', () => {
    expect(fixture.nativeElement.querySelector('.panel-body')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.panel-actions')).toBeTruthy();
  });
});
