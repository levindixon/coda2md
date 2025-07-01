document.addEventListener('DOMContentLoaded', async () => {
  const setupView = document.getElementById('setup-view');
  const exportView = document.getElementById('export-view');
  const apiKeyInput = document.getElementById('api-key');
  const saveKeyButton = document.getElementById('save-key');
  const exportButton = document.getElementById('export-page');
  const changeKeyButton = document.getElementById('change-key');
  const statusDiv = document.getElementById('status');

  const result = await chrome.storage.local.get(['codaApiKey']);
  if (result.codaApiKey) {
    setupView.style.display = 'none';
    exportView.style.display = 'block';
  }

  saveKeyButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      alert('Please enter a valid API key');
      return;
    }

    await chrome.storage.local.set({ codaApiKey: apiKey });
    setupView.style.display = 'none';
    exportView.style.display = 'block';
    apiKeyInput.value = '';
  });

  changeKeyButton.addEventListener('click', () => {
    setupView.style.display = 'block';
    exportView.style.display = 'none';
    statusDiv.textContent = '';
  });

  exportButton.addEventListener('click', async () => {
    statusDiv.textContent = 'Exporting...';
    statusDiv.className = 'status loading';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.runtime.sendMessage({
        action: 'exportPage',
        url: tab.url
      });

      if (response.success) {
        statusDiv.textContent = 'Export successful! Downloading...';
        statusDiv.className = 'status success';
        
        chrome.downloads.download({
          url: response.downloadUrl,
          filename: response.filename || 'coda-export.md'
        });
      } else {
        statusDiv.textContent = `Error: ${response.error}`;
        statusDiv.className = 'status error';
      }
    } catch (error) {
      statusDiv.textContent = `Error: ${error.message}`;
      statusDiv.className = 'status error';
    }
  });
});