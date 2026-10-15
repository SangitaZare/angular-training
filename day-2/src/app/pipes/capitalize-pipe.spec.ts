import { CapitalizePipe } from './capitalize-pipe';

describe('CapitalizePipe', () => {
  let pipe: CapitalizePipe;

  beforeEach(() => {
    pipe = new CapitalizePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should capitalize each word', () => {
    expect(pipe.transform('angular training project')).toBe('Angular Training Project');
  });

  it('should handle already-capitalized and mixed-case input', () => {
    expect(pipe.transform('jANE doe')).toBe('Jane Doe');
  });

  it('should return an empty string for null/undefined/empty input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
