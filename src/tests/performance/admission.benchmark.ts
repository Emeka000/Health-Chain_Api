// tests/performance/admission.benchmark.ts
import autocannon from 'autocannon';

autocannon({
  url: 'http://localhost:3000/api/admit',
  connections: 50,
  duration: 20
}, console.log);
