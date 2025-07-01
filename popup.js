/**
 * Validates the format of a Coda API key
 * @param {string} apiKey - The API key to validate
 * @returns {boolean} True if valid format, false otherwise
 */
function isValidApiKey(apiKey) {
  // Coda API keys typically have a specific format
  return apiKey && apiKey.length >= 30 && /^[a-zA-Z0-9-_]+$/.test(apiKey);
}

/**
 * Shows a status message to the user
 * @param {string} message - The message to display
 * @param {string} type - The message type ('loading', 'success', 'error')
 */
function showStatus(message, type = 'loading') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}

/**
 * Handles keyboard events for better accessibility
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    const setupView = document.getElementById('setup-view');
    if (setupView.style.display !== 'none') {
      document.getElementById('save-key').click();
    } else {
      document.getElementById('export-page').click();
    }
  }
}

/**
 * Initialize the popup when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
  const setupView = document.getElementById('setup-view');
  const exportView = document.getElementById('export-view');
  const apiKeyInput = document.getElementById('api-key');
  const saveKeyButton = document.getElementById('save-key');
  const exportButton = document.getElementById('export-page');
  const changeKeyButton = document.getElementById('change-key');
  const statusDiv = document.getElementById('status');

  // Add keyboard event listener
  document.addEventListener('keypress', handleKeyPress);

  // Check if API key is already configured
  try {
    const result = await chrome.storage.local.get(['codaApiKey']);
    if (result.codaApiKey) {
      setupView.style.display = 'none';
      exportView.style.display = 'block';
    }
  } catch (error) {
    console.error('Failed to check API key:', error);
    showStatus('Failed to load settings. Please refresh.', 'error');
  }

  /**
   * Handles saving the API key
   */
  saveKeyButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    // Validate API key
    if (!apiKey) {
      showStatus('Please enter your Coda API key', 'error');
      apiKeyInput.focus();
      return;
    }

    if (!isValidApiKey(apiKey)) {
      showStatus('Invalid API key format. Please check your key.', 'error');
      apiKeyInput.focus();
      return;
    }

    // Show loading state
    saveKeyButton.disabled = true;
    saveKeyButton.textContent = 'Saving...';
    showStatus('Saving API key...', 'loading');

    try {
      await chrome.storage.local.set({ codaApiKey: apiKey });
      setupView.style.display = 'none';
      exportView.style.display = 'block';
      apiKeyInput.value = '';
      showStatus('API key saved successfully!', 'success');
      // Clear success message after 2 seconds
      setTimeout(() => showStatus('', ''), 2000);
    } catch (error) {
      console.error('Failed to save API key:', error);
      showStatus('Failed to save API key. Please try again.', 'error');
    } finally {
      saveKeyButton.disabled = false;
      saveKeyButton.textContent = 'Save API Key';
    }
  });

  /**
   * Handles changing the API key
   */
  changeKeyButton.addEventListener('click', async () => {
    const confirmChange = confirm('Are you sure you want to change your API key?');
    if (!confirmChange) return;

    setupView.style.display = 'block';
    exportView.style.display = 'none';
    statusDiv.textContent = '';
    apiKeyInput.focus();
  });

  /**
   * Handles the export button click
   */
  exportButton.addEventListener('click', async () => {
    // Disable button during export
    exportButton.disabled = true;
    const originalText = exportButton.textContent;
    exportButton.textContent = 'Exporting...';
    showStatus('Initializing export...', 'loading');

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Validate that we're on a Coda page
      if (!tab.url || !tab.url.includes('coda.io')) {
        showStatus('Please navigate to a Coda page to export', 'error');
        return;
      }

      // Update status
      showStatus('Connecting to Coda API...', 'loading');

      // Send export request to background script
      const response = await chrome.runtime.sendMessage({
        action: 'exportPage',
        url: tab.url
      });

      if (response.success) {
        showStatus('Export successful! Starting download...', 'success');
        
        // Initiate download
        try {
          await chrome.downloads.download({
            url: response.downloadUrl,
            filename: response.filename || 'coda-export.md',
            saveAs: false
          });
          
          // Show success for a few seconds then clear
          setTimeout(() => {
            showStatus('Ready to export', 'success');
            setTimeout(() => showStatus('', ''), 2000);
          }, 2000);
        } catch (downloadError) {
          console.error('Download failed:', downloadError);
          showStatus('Export completed but download failed. Check your downloads.', 'error');
        }
      } else {
        showStatus(response.error || 'Export failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      showStatus('An unexpected error occurred. Please try again.', 'error');
    } finally {
      // Re-enable button
      exportButton.disabled = false;
      exportButton.textContent = originalText;
    }
  });

  /**
   * Focus on the API key input when setup view is shown
   */
  if (setupView.style.display !== 'none') {
    apiKeyInput.focus();
  }
});