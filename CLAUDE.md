# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome browser extension that exports Coda pages to Markdown format. It's a pure JavaScript extension using Chrome Extension Manifest V3 with no build process required.

## Development Commands

Since this is a vanilla JavaScript Chrome extension, there are no build, lint, or test commands. The extension runs directly from source.

To develop:
1. Make changes to the source files
2. Open `chrome://extensions/` in Chrome
3. Click the refresh button on the extension card to reload changes

## Architecture

The extension follows Chrome's Manifest V3 architecture with three main components:

1. **Service Worker (background.js)**: Handles all API communication with Coda
   - Parses Coda URLs to extract document and page IDs
   - Makes authenticated API calls to Coda's REST API
   - Manages the export process (initiate → poll status → get download link)

2. **Popup UI (popup.js + popup.html)**: User interface for the extension
   - Handles API key configuration and storage
   - Triggers export requests
   - Shows export status to users

3. **Content Script (content.js)**: Minimal placeholder script injected into Coda pages

## Key Implementation Details

- API keys are stored securely using Chrome's storage.local API
- The export flow: URL parsing → find page ID → initiate export → poll status → download
- Page IDs are found by recursively searching through the document's page tree
- Export status is polled for up to 20 seconds before timing out
- Includes retry logic for transient API failures (429 and 5xx errors)
- All functions have JSDoc comments for better developer experience
- Input validation for API keys and URLs
- User-friendly error messages with actionable guidance
- Content Security Policy (CSP) implemented for enhanced security

## API Integration

The extension integrates with Coda's v1 API endpoints:
- `GET /docs/{docId}/pages` - List pages to find page ID
- `GET /docs/{docId}/pages/{pageId}` - Get page details
- `POST /docs/{docId}/pages/{pageId}/export` - Initiate export
- `GET /docs/{docId}/pages/{pageId}/export/{exportId}` - Check export status

## Recent Improvements

- Added comprehensive error handling with user-friendly messages
- Implemented API key format validation
- Added retry logic for transient failures
- Enhanced security with Content Security Policy
- Added loading states and visual feedback
- Improved filename sanitization
- Added JSDoc documentation to all functions
- Created CONTRIBUTING.md for contributors
- Enhanced README with troubleshooting and API limitations

## Security Considerations

- No console.log statements that could leak sensitive data
- API key is masked in the UI (password input)
- Download URLs are validated to ensure they're from coda.io
- Filename sanitization prevents path traversal attacks
- CSP prevents inline scripts and unsafe sources