# CLAUDE.md - AI Assistant Guidelines for hd-xapi

This document provides guidance for AI assistants (like Claude) working on this codebase.

## Project Overview

**Repository:** hd-xapi
**License:** MIT
**Status:** New/Starter Project

This repository is in its initial stages. As the project develops, this document should be updated to reflect the evolving codebase structure, conventions, and workflows.

## Repository Structure

```
hd-xapi/
├── LICENSE          # MIT License
└── CLAUDE.md        # This file - AI assistant guidelines
```

As the project grows, this section should be updated to document:
- Source code directories
- Configuration files
- Test directories
- Build outputs
- Documentation

## Development Workflow

### Getting Started

1. Clone the repository
2. (Add dependency installation steps as project develops)
3. (Add build/run commands as they are established)

### Branch Naming Convention

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Claude/AI work: `claude/<description>-<session-id>`

### Commit Messages

Follow conventional commit format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## Code Conventions

### General Guidelines

1. **Keep it simple** - Avoid over-engineering; implement only what's needed
2. **Security first** - Never introduce vulnerabilities (XSS, SQL injection, etc.)
3. **Read before modifying** - Always understand existing code before making changes
4. **Minimal changes** - Only modify what's necessary to complete the task

### Style Guidelines

(To be defined as the project language/framework is established)

- Consistent indentation
- Clear naming conventions
- Appropriate commenting for complex logic

## Testing

(To be defined as testing framework is established)

### Running Tests

```bash
# Add test commands as they are established
```

### Test Coverage Requirements

- (Define minimum coverage thresholds)
- (Specify which code requires tests)

## Build & Deployment

(To be defined as build system is established)

### Build Commands

```bash
# Add build commands as they are established
```

### Deployment Process

(Document deployment workflow when established)

## API Documentation

(To be documented as API endpoints are developed)

This project name suggests an API component. Document:
- Endpoint specifications
- Authentication methods
- Request/response formats
- Error handling patterns

## Key Files Reference

| File | Purpose |
|------|---------|
| `LICENSE` | MIT License for the project |
| `CLAUDE.md` | AI assistant guidelines (this file) |

(Update this table as key files are added)

## Common Tasks for AI Assistants

### When Adding New Features

1. Create a feature branch
2. Implement changes with appropriate tests
3. Update documentation if needed
4. Commit with descriptive message
5. Push to the feature branch

### When Fixing Bugs

1. Reproduce and understand the issue
2. Identify root cause
3. Implement minimal fix
4. Add tests to prevent regression
5. Commit and push

### When Refactoring

1. Ensure tests exist for affected code
2. Make incremental changes
3. Verify tests pass after each change
4. Keep commits atomic and focused

## Environment Setup

(To be defined as development environment requirements are established)

### Required Tools

- Git

### Environment Variables

(Document required environment variables as they are added)

## Troubleshooting

(Add common issues and solutions as they are discovered)

## Notes for Future Development

As this repository grows, update this document with:

1. **Technology stack** - Languages, frameworks, libraries used
2. **Architecture decisions** - Key design choices and rationale
3. **Integration points** - External services and APIs
4. **Performance considerations** - Optimization guidelines
5. **Security requirements** - Authentication, authorization, data handling

---

*Last Updated: 2026-01-07*
*Maintainer: markjspivey-xwisee*
