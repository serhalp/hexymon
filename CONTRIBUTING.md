# Contributing to Hexymon

This document outlines the standards and workflows for contributing to the Hexymon codebase.

## Technology Stack

- **Runtime**: Node.js (v22+)
- **Framework**: SvelteKit (Svelte 5)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Infrastructure**: Netlify Edge Functions
- **Package Manager**: pnpm

## Development Setup

### Prerequisites

Ensure you have the following installed:

- Node.js v22 or higher
- pnpm v10 (`corepack enable` should be sufficient)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/hexymon.git
    cd hexymon
    ```

2.  Install dependencies:

    ```bash
    pnpm install
    ```

3.  Generate the local graph data. The application relies on a pre-processed JSON graph which must be generated before the app can run:

    ```bash
    pnpm run build:data
    ```

4.  Start the local development server:
    ```bash
    pnpm dev
    ```

The application will be available at `http://localhost:5173`.

## Code Quality & Standards

We enforce code quality using ESLint, Prettier, and TypeScript. All checks must pass before merging.

### Commands

- **Type Check**: `pnpm check`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format`
- **Unit Tests**: `pnpm test:unit`
- **E2E Tests**: `pnpm test:e2e`

### Pull Request Workflow

1.  Create a feature branch (`git checkout -b feature/name`).
2.  Commit changes with clear, imperative messages.
3.  Ensure local tests and type checks pass.
4.  Open a Pull Request against `main`.

## Data Model

The application logic depends on a directed graph structure.

- **Nodes**: Represent words. Properties include `id`, `word`, `lang`, `definition`, and `pos` (Part of Speech).
- **Edges**: Represent linguistic relationships (e.g., `derived_from`, `borrowed_from`).

When modifying `scripts/prepare-etymology-data.ts`, ensure that the generated graph maintains referential integrity.
