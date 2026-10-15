import { TestBed } from '@angular/core/testing';

import { StudentsDataService } from './students-data';

describe('StudentsDataService', () => {
  let service: StudentsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return every student', () => {
    expect(service.getAll().length).toBeGreaterThan(0);
  });

  it('should find a student by id', () => {
    const [first] = service.getAll();
    expect(service.getById(first.id)).toEqual(first);
  });

  it('should return undefined for an unknown id', () => {
    expect(service.getById(-1)).toBeUndefined();
  });
});
