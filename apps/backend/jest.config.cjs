/** Unit test config (Implementation Blueprint §14). */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverageFrom: ['**/*.ts', '!**/*.module.ts', '!**/*.dto.ts', '!main.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@platform/(.*)$': '<rootDir>/platform/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
  },
};
