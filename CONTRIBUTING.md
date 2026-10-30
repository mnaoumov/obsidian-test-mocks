# Contributing

Contributions are welcome! Here's how to get started.

## Filing an issue (for AI agents and humans)

Open issues through the [issue forms](https://github.com/mnaoumov/obsidian-test-mocks/issues/new/choose), not as blank issues.

Filing from the CLI or the API (`gh issue create --body`, or an AI agent filing for you) skips the form, and `gh issue create --template` cannot load an issue form. In that case, open the matching form in [`.github/ISSUE_TEMPLATE/`](https://github.com/mnaoumov/obsidian-test-mocks/tree/HEAD/.github/ISSUE_TEMPLATE), copy every field as a `### <label>` heading in the form's order, and fill in each one. Always state the version you used and your operating system.

## Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- npm (comes with Node.js)

## Setup

```bash
git clone https://github.com/mnaoumov/obsidian-test-mocks.git
cd obsidian-test-mocks
npm install
```

## Development Workflow

### Build

```bash
npm run build
```

### Commit

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Use the interactive commit prompt:

```bash
npm run commit
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Format

```bash
npm run format:check
npm run format
```

### Spellcheck

```bash
npm run spellcheck
```

### Test

```bash
npm run test
npm run test:coverage
```

## Pull Requests

- Base your PR on the `main` branch.
- Ensure all checks pass (`lint`, `format:check`, `spellcheck`, `test`).
- Use [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages.
