# Gemini Code Agent Context

This document provides context for the Gemini Code Agent to understand the project structure and conventions.

## Project Overview

This is a VS Code extension for "Domain Storytelling". It allows users to edit `.egn` files, which are used to model domain stories. The extension is a monorepo managed with Yarn, and it consists of several packages:

*   **`apps/vscode/egon-modeler-plugin`**: The main VS Code extension. It contributes a custom editor for `.egn` files.
*   **`apps/vscode/egon-modeler-webview`**: A webview that is responsible for rendering the diagrams. It is a single-page application (SPA) built with Vite.
*   **`libs/diagram-js-egon-plugin`**: A plugin for `diagram-js` that provides the Egon.io-specific functionality.
*   **`libs/vscode/data-transfer-objects`**: Contains data transfer objects (DTOs) used for communication between the plugin and the webview.
*   **`libs/vscode/domain-story`**: Contains the domain logic for domain stories.

The extension uses `diagram-js` for rendering the diagrams and is written in TypeScript.

## Building and Running

### Build

To build the project, run the following command:

```bash
yarn build
```

This will build all the packages and place the output in the `dist` directory.

### Development

To run the project in development mode, run the following command:

```bash
yarn dev
```

This will start the webpack and vite builds in watch mode. To start the extension, you need to press `F5` in VS Code.

### Test

To run the tests, run the following command:

```bash
yarn test
```

This will run all the tests using Jest.

### Lint

To lint the code, run the following command:

```bash
yarn lint
```

## Development Conventions

*   **Commit Messages**: The project uses [semantic commit messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716).
*   **Coding Style**: The project uses ESLint and Prettier to enforce a consistent coding style.
*   **Testing**: The project uses Jest for unit and integration testing.
