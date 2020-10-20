// This file runs before each test file.

// Always mock out axios.
jest.mock('axios');
beforeEach(() => {
  /* eslint-disable-next-line global-require */
  require('axios').mockRejectedValue(
    new Error('Test tried to call axios, but the mock behavior was not specified.'),
  );
});
