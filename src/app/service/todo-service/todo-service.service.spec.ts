import { TestBed } from '@angular/core/testing';

import { TodoServiceProvider } from './todo-service.service';

describe('TodoServiceProvider', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TodoServiceProvider = TestBed.get(TodoServiceProvider);
    expect(service).toBeTruthy();
  });
});
