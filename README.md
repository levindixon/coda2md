# Coda2MD - Export Coda Pages to Markdown

A Chrome extension that enables seamless export of Coda pages to Markdown format with a single click.

## Features

- 🚀 One-click export of any Coda page to Markdown
- 🔐 Secure API key storage using Chrome's storage API
- 📝 Clean Markdown output preserving formatting
- 🎨 Professional and intuitive user interface
- ⚡ Fast export with real-time status updates

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/levindixon/coda2md.git
   cd coda2md
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the extension directory

### From Chrome Web Store

*Coming soon!*

## Setup

1. **Get your Coda API token:**
   - Go to [coda.io/account](https://coda.io/account)
   - Scroll to "API Settings"
   - Click "Generate API token"
   - Copy the generated token

2. **Configure the extension:**
   - Click the extension icon in Chrome
   - Paste your API token when prompted
   - Click "Save API Key"

## Usage

1. Navigate to any Coda page you want to export
2. Click the Coda2MD extension icon
3. Click "Export Current Page"
4. The page will be downloaded as a `.md` file to your Downloads folder

## How It Works

The extension uses Coda's official API to:
1. Extract the document and page ID from the current URL
2. Initiate an export request for the page
3. Poll the export status until completion
4. Download the resulting Markdown file

## Supported URL Formats

The extension works with standard Coda page URLs:
```
https://coda.io/d/Document-Name_dXXXXXXXXXX/Page-Name_suXXX
```

## Security

- Your API key is stored securely in Chrome's local storage
- The API key is never exposed in the extension UI
- All API calls are made over HTTPS
- The extension only requests necessary permissions

## Permissions

The extension requires the following permissions:
- **activeTab**: To read the current page URL
- **storage**: To securely store your API key
- **downloads**: To save the exported Markdown file
- **host_permissions**: To make API calls to coda.io

## Troubleshooting

### Common Issues

#### "Invalid Coda URL format"
- **Cause**: You're not on a Coda page or the URL format isn't recognized
- **Solution**: Navigate to a specific Coda page (not the homepage, workspace, or docs list)
- **Valid URL example**: `https://coda.io/d/Document-Name_dXXXXXXXXXX/Page-Name_suXXX`

#### "API key not configured"
- **Cause**: No API key has been saved in the extension
- **Solution**: 
  1. Click the extension icon
  2. Enter your Coda API key
  3. Click "Save API Key"

#### "Invalid API key"
- **Cause**: The API key is incorrect or has been revoked
- **Solution**: 
  1. Go to [coda.io/account](https://coda.io/account) → API Settings
  2. Generate a new API token
  3. Update the key in the extension

#### "Export timed out"
- **Cause**: Large pages take longer to export than the 20-second timeout
- **Solution**: 
  1. Try exporting a smaller section of the page
  2. Break large pages into smaller sub-pages
  3. Wait a moment and try again

#### "Export request expired" 
- **Cause**: Attempting to re-export the same page too quickly (Coda API limitation)
- **Solution**: 
  1. Wait at least 2-3 seconds between exports of the same page
  2. The extension now automatically adds a delay to prevent this
  3. If you still see this error, wait a moment and try again

#### "Could not find page"
- **Cause**: The page may be private or you lack access
- **Solution**: 
  1. Ensure you're logged into Coda in your browser
  2. Verify you have at least view access to the page
  3. Check if the page still exists (hasn't been deleted)

#### "Rate limit exceeded"
- **Cause**: Too many API requests in a short time
- **Solution**: Wait a few minutes before trying again

#### Download doesn't start
- **Cause**: Browser download settings or popup blockers
- **Solution**: 
  1. Check Chrome's download settings
  2. Ensure popups are allowed for the extension
  3. Check your Downloads folder - the file may have downloaded silently

### Getting Help

If you continue to experience issues:

1. **Check the browser console**: Right-click the extension icon → "Inspect popup" → Console tab
2. **Verify your setup**: Ensure you're using a recent version of Chrome
3. **Report bugs**: [Open an issue](https://github.com/levindixon/coda2md/issues) with:
   - Error message
   - Chrome version
   - Steps to reproduce
   - Console error logs (if any)

## Coda API Limitations

### Rate Limits
- **Default**: 10 requests per second
- **Burst**: 20 requests allowed in short bursts
- **Daily**: No published daily limit, but excessive use may trigger throttling

### Export Limitations
- **Page Size**: Very large pages (>10MB) may fail to export
- **Export Format**: Only Markdown format is supported by this extension
- **Concurrent Exports**: Only one export per page at a time
- **Export Timeout**: Exports that take longer than 5 minutes may fail
- **Export ID Expiration**: Export IDs expire immediately after use. When re-exporting the same page, wait at least 2 seconds between exports to avoid API errors

### Content Support
- **Supported**: Text, tables, lists, headings, links, basic formatting
- **Limited Support**: Complex formulas, some embedded content
- **Not Exported**: Interactive elements, buttons, reactions, comments

### Access Requirements
- **Minimum Permission**: View access to the page
- **API Key Scope**: Key must have read access to docs
- **Authentication**: API key must be valid and not expired

## Development

### Project Structure
```
coda2md/
├── manifest.json      # Extension configuration
├── background.js      # Service worker for API calls
├── popup.html         # Extension popup UI
├── popup.js          # Popup interaction logic
├── popup.css         # Popup styling
├── content.js        # Content script (minimal)
├── CLAUDE.md         # Development guidance for AI assistants
├── CONTRIBUTING.md   # Contribution guidelines
├── 16.png            # Extension icon (16x16)
├── 48.png            # Extension icon (48x48)
├── 128.png           # Extension icon (128x128)
└── README.md         # This file
```

### Building from Source

No build process is required - the extension runs directly from source.

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with the [Coda API](https://coda.io/developers/apis/v1)
- Uses Chrome Extension Manifest V3
- Extension developed by [Claude](https://claude.ai) (Anthropic's AI assistant)

## Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/levindixon/coda2md/issues).

---

Made with ❤️ by Claude for the Coda community