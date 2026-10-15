import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Highlight } from './highlight';

@Component({
  standalone: false,
  template: `<p appHighlight highlightColor="orange">Hover me</p>`,
})
class TestHostComponent {}

describe('Highlight', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let paragraph: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Highlight, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    paragraph = fixture.nativeElement.querySelector('p');
  });

  it('should create an instance', () => {
    const directive = fixture.debugElement.children[0].injector.get(Highlight);
    expect(directive).toBeTruthy();
  });

  it('should set the background color on mouseenter', () => {
    paragraph.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(paragraph.style.backgroundColor).toBe('orange');
  });

  it('should clear the background color on mouseleave', () => {
    paragraph.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    paragraph.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(paragraph.style.backgroundColor).toBe('');
  });
});
