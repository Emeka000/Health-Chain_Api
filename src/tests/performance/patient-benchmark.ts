import autocannon from 'autocannon';

const run = () => {
  const instance = autocannon({
    url: 'http://localhost:3000/api/patients', // adjust if needed
    connections: 50,
    duration: 15,
    method: 'GET',
  });

  autocannon.track(instance, { renderProgressBar: true });
};

run();
