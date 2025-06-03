// Jest configuration file
module.exports = {
  // Use our setup file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Configure module name mapper to handle path aliases
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  
  // Tell Jest to handle TypeScript files
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Configure test match patterns
  testMatch: ['**/*.spec.ts'],
  
  // Configure test coverage
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  
  // Configure test timeout
  testTimeout: 30000,
};
