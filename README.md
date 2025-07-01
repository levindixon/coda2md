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

### "Invalid Coda URL format" error
Make sure you're on a Coda page (not the homepage or docs list)

### "API key not configured" error
Click the extension icon and enter your Coda API key

### Export times out
Large pages may take longer to export. The extension will retry for up to 20 seconds.

### "Could not find page ID" error
Ensure you have access to the page and are logged into Coda

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