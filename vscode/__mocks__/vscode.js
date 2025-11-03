module.exports = {
    Range: class Range {
        constructor(startLine, startChar, endLine, endChar) {
            this.startLine = startLine;
            this.startChar = startChar;
            this.endLine = endLine;
            this.endChar = endChar;
        }
    },
    Position: class Position {
        constructor(line, character) {
            this.line = line;
            this.character = character;
        }
    },
    window: {
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
    },
    workspace: {
        getConfiguration: jest.fn(),
    },
    commands: {
        registerCommand: jest.fn(),
    },
};
