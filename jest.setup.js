// Global Jest setup file

// Import our mock configuration
require('./src/modules/appointments/tests/mocks/jest.mock');

// Configure Jest to handle module name mapping
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
