module.exports = {
  setupFiles: [
      './setupTests'
  ],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js'
  }
};