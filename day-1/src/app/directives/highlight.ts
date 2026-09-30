import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

/**
 * Custom attribute directive that highlights the host element's
 * background color while the mouse is hovering over it.
 *
 * Usage:
 *   <p appHighlight>Hover over me</p>
 *   <p appHighlight highlightColor="lightblue">Hover over me</p>
 */
@Directive({
  selector: '[appHighlight]',
  standalone: false,
})
export class Highlight {
  // Lets the consumer customize the color: <p appHighlight highlightColor="orange">
  @Input() highlightColor = '#ffe066';

  private originalBackground = '';

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.originalBackground = this.el.nativeElement.style.backgroundColor;
    this.renderer.setStyle(this.el.nativeElement, 'background-color', this.highlightColor);
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.2s ease-in-out');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', this.originalBackground);
  }
}
