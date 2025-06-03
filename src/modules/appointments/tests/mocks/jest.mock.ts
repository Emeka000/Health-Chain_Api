// Jest mock configuration

// Mock the Department entity import
jest.mock('src/medical-staff/entities/department.entity', () => {
  return {
    Department: require('./department.entity.mock').Department,
  };
});

// Mock the Role entity import
jest.mock('src/role/entities/role.entity', () => {
  return {
    Role: require('./role.entity.mock').Role,
  };
});
