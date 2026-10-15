import { FilterByNamePipe } from './filter-by-name-pipe';
import { Student } from '../models/student.model';

describe('FilterByNamePipe', () => {
  let pipe: FilterByNamePipe;
  const students: Student[] = [
    { id: 1, name: 'Jane Doe', email: 'jane@example.com', course: 'Angular' },
    { id: 2, name: 'John Smith', email: 'john@example.com', course: 'TypeScript' },
  ];

  beforeEach(() => {
    pipe = new FilterByNamePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the full list when there is no search term', () => {
    expect(pipe.transform(students, '')).toEqual(students);
  });

  it('should filter case-insensitively by name', () => {
    expect(pipe.transform(students, 'jane')).toEqual([students[0]]);
  });

  it('should return an empty array when nothing matches', () => {
    expect(pipe.transform(students, 'zzz')).toEqual([]);
  });

  it('should return an empty array for a null list', () => {
    expect(pipe.transform(null, 'jane')).toEqual([]);
  });
});
