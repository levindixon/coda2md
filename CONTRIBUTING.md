# Contributing to Coda Markdown Export

Thank you for your interest in contributing to the Coda Markdown Export Chrome extension! This guide will help you get started with development and explain our contribution process.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Getting Started

This is a vanilla JavaScript Chrome extension with no build process, making it easy to contribute! The extension uses Chrome Extension Manifest V3 and consists of three main components:

1. **Service Worker** (`background.js`) - Handles API communication with Coda
2. **Popup UI** (`popup.js` + `popup.html`) - User interface
3. **Content Script** (`content.js`) - Injected into Coda pages

## Development Setup

### Prerequisites

- Google Chrome or Chromium browser
- Git for version control
- A Coda account and API key for testing

### Installation

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/coda-md-export.git
   cd coda-md-export
   ```

3. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `coda-md-export` directory

### Getting a Coda API Key

1. Go to [coda.io/account](https://coda.io/account)
2. Navigate to "API Settings"
3. Generate a new API token
4. Copy the token for use in the extension

## Making Changes

### Development Workflow

1. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes to the source files
3. Test your changes:
   - Reload the extension in `chrome://extensions/`
   - Test the functionality thoroughly
   - Check the browser console for errors

4. Commit your changes with descriptive messages:
   ```bash
   git commit -m "feat: add progress indicator for exports"
   ```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc.)
- `refactor:` Code refactoring without changing functionality
- `test:` Adding or modifying tests
- `chore:` Maintenance tasks

## Code Style Guidelines

### JavaScript

- Use ES6+ features where appropriate
- Use meaningful variable and function names
- Add JSDoc comments for all functions:
  ```javascript
  /**
   * Parses a Coda URL to extract document and page information
   * @param {string} url - The Coda page URL
   * @returns {Object|null} Object with docId and pageSlug, or null if invalid
   */
  function parseCodaUrl(url) {
    // Function implementation
  }
  ```

### Error Handling

- Always provide user-friendly error messages
- Log detailed errors to console for debugging
- Handle edge cases gracefully
- Add retry logic for transient failures

### Security

- Never log or expose API keys
- Validate all inputs
- Use Chrome's storage API for sensitive data
- Follow Chrome extension security best practices

## Testing

### Manual Testing Checklist

Before submitting a PR, ensure you've tested:

- [ ] Extension loads without errors
- [ ] API key can be saved and retrieved
- [ ] Export works for various Coda page types
- [ ] Error states display appropriate messages
- [ ] Extension works after Chrome restart
- [ ] No console errors during normal operation

### Test Scenarios

1. **Valid API Key**: Test with a working Coda API key
2. **Invalid API Key**: Test with an incorrect key
3. **Network Errors**: Test with no internet connection
4. **Different Page Types**: Test with docs, tables, and canvas pages
5. **Large Documents**: Test with pages containing lots of content

## Submitting Changes

### Pull Request Process

1. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - List the testing you've performed

3. PR Checklist:
   - [ ] Code follows style guidelines
   - [ ] JSDoc comments added/updated
   - [ ] No console.log statements left in production code
   - [ ] Error handling is comprehensive
   - [ ] Changes tested in Chrome
   - [ ] README updated if needed

### Code Review

- Respond to review comments promptly
- Be open to feedback and suggestions
- Make requested changes in new commits
- Once approved, your PR will be merged

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to recreate the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - Chrome version
   - Operating system
   - Extension version
6. **Screenshots**: If applicable
7. **Console Errors**: Any errors from the developer console

### Feature Requests

For feature requests, please describe:

1. **Use Case**: Why this feature would be useful
2. **Proposed Solution**: How you envision it working
3. **Alternatives**: Other solutions you've considered

## Questions?

If you have questions about contributing, feel free to:

1. Open an issue for discussion
2. Check existing issues and pull requests
3. Review the [README](README.md) and [CLAUDE.md](CLAUDE.md) files

Thank you for contributing to make Coda Markdown Export better for everyone!