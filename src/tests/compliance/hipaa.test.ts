// tests/compliance/hipaa.test.ts
describe('HIPAA Compliance', () => {
  it('should not log PHI', () => {
    const logs = getRecentLogs();
    logs.forEach((log) => {
      expect(log).not.toMatch(/name|ssn|email/);
    });
  });

  it('should use secure communication channels', () => {
    const config = getSystemConfig();
    expect(config.apiProtocol).toBe('https');
  });
});
