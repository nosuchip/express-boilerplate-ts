module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@server/(.*)$': '<rootDir>/server/$1',
        '^@typing/(.*)$': '<rootDir>/server/typing/$1',
        '^@client/(.*)$': '<rootDir>/client/$1',
    },
    verbose: true,
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
};
