import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};

export default config;