# Project Overview

This is a minimal React project bootstrapped with Vite, using TypeScript. It serves as a starting point for building a React application with a fast development environment and build process.

**Main Technologies:**

*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Vite:** A build tool that provides a faster and leaner development experience for modern web projects.
*   **ESLint:** A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.

**Architecture:**

The project follows a standard Vite project structure:

*   `index.html`: The main entry point of the application.
*   `src/main.tsx`: The main application entry point, which renders the root React component.
*   `src/App.tsx`: The root React component.
*   `vite.config.ts`: The Vite configuration file.
*   `package.json`: The project's metadata and dependencies.

# Building and Running

*   **Development Server:** To run the development server, use the following command:

    ```bash
    pnpm dev
    ```

*   **Building for Production:** To build the application for production, use the following command:

    ```bash
    pnpm build
    ```

*   **Linting:** To lint the codebase, use the following command:

    ```bash
    pnpm lint
    ```

*   **Previewing the Production Build:** To preview the production build locally, use the following command:

    ```bash
    pnpm preview
    ```

# Development Conventions

*   **Coding Style:** The project uses ESLint to enforce a consistent coding style. The ESLint configuration can be found in `eslint.config.js`.
*   **Testing:** There are no testing frameworks configured in this project. You can add one, such as Jest or Vitest, to the project.
*   **Contribution Guidelines:** There are no contribution guidelines specified in this project.
