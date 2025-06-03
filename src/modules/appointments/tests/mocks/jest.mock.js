// Jest mock configuration file

// Mock the Department entity
jest.mock('src/medical-staff/entities/department.entity', () => {
  return {
    Department: class MockDepartment {
      id = 'mock-department-id';
      name = 'Mock Department';
      description = 'Mock Department Description';
      isActive = true;
    }
  };
}, { virtual: true });

// Mock the Role entity
jest.mock('src/role/entities/role.entity', () => {
  return {
    Role: class MockRole {
      id = 'mock-role-id';
      name = 'Mock Role';
      description = 'Mock Role Description';
      permissions = [];
      isActive = true;
    }
  };
}, { virtual: true });

// This ensures the mocks are loaded before any tests run
beforeAll(() => {
  // This is intentionally empty - just ensures the mocks are loaded
});
