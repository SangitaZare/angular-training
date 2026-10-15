import { Pipe, PipeTransform } from '@angular/core';

/**
 * Custom pipe that capitalizes the first letter of every word in a string.
 *
 * Usage: {{ 'angular training' | capitalize }} -> "Angular Training"
 */
@Pipe({
  name: 'capitalize',
  standalone: false,
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return value
      .split(' ')
      .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
      .join(' ');
  }
}
