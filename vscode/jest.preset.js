const path = require('path');

module.exports = {
    testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
    transform: {
        '^.+\\.(ts|js|html)$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageReporters: ['html'],
    moduleNameMapper: {
        '^@egon/data-transfer-objects$': path.join(__dirname, 'libs/vscode/data-transfer-objects/src/index.ts'),
        '^@egon/diagram-js-egon-plugin$': path.join(__dirname, 'libs/diagram-js-egon-plugin/src/index.ts'),
        '^@egon/domain-story$': path.join(__dirname, 'libs/vscode/domain-story/src/index.ts'),
        '^vscode$': path.join(__dirname, '__mocks__/vscode.js'),
    },
};
