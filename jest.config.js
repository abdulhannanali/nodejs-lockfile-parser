module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [ 'src/**/*.ts' ],
  coverageReporters: ['text-summary', 'html']
};