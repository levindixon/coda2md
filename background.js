// Track ongoing exports to prevent duplicates
const ongoingExports = new Map();

/**
 * Chrome runtime message listener for handling export requests
 * @param {Object} request - The message request object
 * @param {string} request.action - The action to perform
 * @param {string} request.url - The Coda page URL to export
 * @param {Object} sender - Information about the sender
 * @param {Function} sendResponse - Callback to send response
 * @returns {boolean} True to indicate async response
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportPage') {
    // Check if an export is already in progress for this URL
    if (ongoingExports.has(request.url)) {
      console.log('Export already in progress for this URL, ignoring duplicate request');
      sendResponse({ success: false, error: 'Export already in progress. Please wait for it to complete.' });
      return false;
    }

    // Mark this URL as having an ongoing export
    ongoingExports.set(request.url, true);

    handleExport(request.url).then(response => {
      // Clean up the ongoing export marker
      ongoingExports.delete(request.url);
      sendResponse(response);
    }).catch(error => {
      // Clean up on error too
      ongoingExports.delete(request.url);
      sendResponse({ success: false, error: error.message });
    });

    return true;
  }
});

/**
 * Handles the complete export process for a Coda page
 * @param {string} url - The Coda page URL to export
 * @returns {Promise<Object>} Export result with success status and download info
 */
async function handleExport(url) {
  try {
    // Validate URL format
    if (!url || !url.includes('coda.io')) {
      return { success: false, error: 'Please provide a valid Coda URL' };
    }

    const urlMatch = url.match(/coda\.io\/d\/[^\/]+_d([^\/]+)\/[^\/]+_(s[^#?\/_]+)/);
    if (!urlMatch) {
      return { success: false, error: 'Invalid Coda URL format. Please ensure you\'re on a Coda page.' };
    }

    const docId = urlMatch[1];
    const pageSlug = urlMatch[2];

    // Retrieve API key from storage
    let codaApiKey;
    try {
      const result = await chrome.storage.local.get(['codaApiKey']);
      codaApiKey = result.codaApiKey;
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return { success: false, error: 'Failed to retrieve API key. Please try again.' };
    }

    if (!codaApiKey) {
      return { success: false, error: 'API key not configured. Please set your Coda API key in the extension settings.' };
    }

    const pageId = await findPageId(docId, pageSlug, codaApiKey);
    if (!pageId) {
      return { success: false, error: 'Could not find the page. Please ensure the URL is correct and you have access to this page.' };
    }

    const exportId = await initiateExport(docId, pageId, codaApiKey);
    console.log(`Export initiated with ID: ${exportId} for page: ${pageId}`);
    if (!exportId) {
      return { success: false, error: 'Failed to start the export process. Please try again.' };
    }

    // Wait a moment for Coda's API to register the export before checking status
    await new Promise(resolve => setTimeout(resolve, 1000));

    const downloadUrl = await waitForExport(docId, pageId, exportId, codaApiKey);
    if (!downloadUrl) {
      return { success: false, error: 'Export process timed out. This might happen with very large pages. Please try again.' };
    }

    // Validate download URL for security
    // Coda export URLs come from AWS S3
    try {
      const urlObj = new URL(downloadUrl);
      const validHosts = [
        'coda-us-west-2-prod-workflow-objects.s3.us-west-2.amazonaws.com',
        'coda.io'
      ];

      if (urlObj.protocol !== 'https:' || !validHosts.some(host => urlObj.hostname === host)) {
        console.error('Invalid download URL origin:', urlObj.hostname);
        return { success: false, error: 'Security error: Invalid download URL. Please try again.' };
      }
    } catch (e) {
      console.error('Invalid download URL format:', downloadUrl);
      return { success: false, error: 'Security error: Invalid download URL format.' };
    }

    const pageName = await getPageName(docId, pageId, codaApiKey);
    // Sanitize filename more robustly
    const sanitizedPageName = (pageName || 'coda-export')
      .slice(0, 200) // Limit length to prevent filesystem issues
      .replace(/[^a-z0-9-_.]/gi, '_')
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
      .replace(/_{2,}/g, '_'); // Replace multiple underscores with single
    const filename = `${sanitizedPageName || 'coda-export'}.md`;

    return { success: true, downloadUrl, filename };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Finds a page ID by searching through the document's page tree
 * @param {string} docId - The Coda document ID
 * @param {string} pageSlug - The page slug from the URL
 * @param {string} apiKey - Coda API authentication key
 * @returns {Promise<string|null>} The page ID if found, null otherwise
 * @throws {Error} If the API request fails
 */
async function findPageId(docId, pageSlug, apiKey) {
  /**
   * Recursively searches through the page tree to find matching page
   * @param {Array} pages - Array of page objects to search
   * @returns {string|null} Page ID if found, null otherwise
   */
  function searchPages(pages) {
    for (const page of pages) {
      console.log(`Checking page: ${page.name}, browserLink: ${page.browserLink}, looking for: _${pageSlug}`);
      
      // Check multiple possible formats
      if (page.browserLink) {
        // Try exact match with underscore prefix
        if (page.browserLink.includes(`_${pageSlug}`)) {
          console.log(`Found match with _${pageSlug} pattern`);
          return page.id;
        }
        
        // Try matching the end of the URL (handle both /pageSlug and /_pageSlug formats)
        const browserLinkEnd = page.browserLink.split('/').pop();
        if (browserLinkEnd === pageSlug || browserLinkEnd === `_${pageSlug}` || browserLinkEnd === `s${pageSlug}`) {
          console.log(`Found match with URL end pattern: ${browserLinkEnd}`);
          return page.id;
        }
      }
      
      if (page.children) {
        const childResult = searchPages(page.children);
        if (childResult) return childResult;
      }
    }
    return null;
  }

  let nextPageToken = undefined;
  let pageCount = 0;
  const maxPages = 50; // Prevent infinite loops

  do {
    pageCount++;
    console.log(`Fetching page batch ${pageCount}${nextPageToken ? ` with token: ${nextPageToken}` : ''}`);
    
    const url = new URL(`https://coda.io/apis/v1/docs/${docId}/pages`);
    if (nextPageToken) {
      url.searchParams.append('pageToken', nextPageToken);
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorMessage = response.status === 401
        ? 'Invalid API key. Please check your Coda API key.'
        : response.status === 404
        ? 'Document not found. Please check the URL.'
        : response.status === 403
        ? 'Access denied. Please ensure you have permission to access this document.'
        : `Failed to fetch pages (Error ${response.status})`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Search current batch of pages
    const pageId = searchPages(data.items);
    if (pageId) {
      console.log(`Found page ID ${pageId} in batch ${pageCount}`);
      return pageId;
    }

    // Check for next page token
    nextPageToken = data.nextPageToken;
    
    if (pageCount >= maxPages) {
      console.warn(`Reached maximum page limit (${maxPages}) while searching for page`);
      break;
    }
  } while (nextPageToken);

  console.log(`Page not found after searching ${pageCount} batch(es)`);
  return null;
}

/**
 * Retrieves the name of a specific page
 * @param {string} docId - The Coda document ID
 * @param {string} pageId - The page ID
 * @param {string} apiKey - Coda API authentication key
 * @returns {Promise<string|null>} The page name or null if request fails
 */
async function getPageName(docId, pageId, apiKey) {
  const response = await fetch(`https://coda.io/apis/v1/docs/${docId}/pages/${pageId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    console.warn(`Failed to get page name: ${response.status}`);
    return null;
  }

  const data = await response.json();
  return data.name;
}

/**
 * Initiates the export process for a Coda page
 * @param {string} docId - The Coda document ID
 * @param {string} pageId - The page ID
 * @param {string} apiKey - Coda API authentication key
 * @returns {Promise<string>} The export request ID
 * @throws {Error} If the export initiation fails
 */
async function initiateExport(docId, pageId, apiKey) {
  const response = await fetch(`https://coda.io/apis/v1/docs/${docId}/pages/${pageId}/export`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ outputFormat: 'markdown' })
  });

  if (!response.ok) {
    const errorMessage = response.status === 401
      ? 'Invalid API key. Please check your Coda API key.'
      : response.status === 404
      ? 'Page not found. The page may have been deleted or moved.'
      : response.status === 403
      ? 'Access denied. You don\'t have permission to export this page.'
      : response.status === 429
      ? 'Rate limit exceeded. Please wait a moment and try again.'
      : `Failed to start export (Error ${response.status})`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Polls the export status until completion or timeout
 * @param {string} docId - The Coda document ID
 * @param {string} pageId - The page ID
 * @param {string} exportId - The export request ID
 * @param {string} apiKey - Coda API authentication key
 * @param {number} maxAttempts - Maximum polling attempts (default: 20 seconds)
 * @returns {Promise<string>} The download URL when export is complete
 * @throws {Error} If the export fails or times out
 */
async function waitForExport(docId, pageId, exportId, apiKey, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Polling export status attempt ${i + 1}/${maxAttempts} for exportId: ${exportId}`);
    const response = await fetch(
      `https://coda.io/apis/v1/docs/${docId}/pages/${pageId}/export/${exportId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      // Don't throw on transient errors, retry instead
      if (response.status === 429 || response.status >= 500) {
        console.warn(`Temporary error checking export status: ${response.status}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      // Log detailed error for 404s
      if (response.status === 404) {
        const errorBody = await response.text();
        console.error(`Export ID not found (404). Export ID: ${exportId}, Response: ${errorBody}`);

        // This typically happens when the export ID doesn't exist yet
        continue;
      }

      throw new Error(`Failed to check export status (Error ${response.status})`);
    }

    const data = await response.json();

    if (data.status === 'complete' && data.downloadLink) {
      console.log(`Export completed successfully on attempt ${i + 1}`);
      return data.downloadLink;
    } else if (data.status === 'failed') {
      throw new Error(data.error || 'Export failed. The page may be too large or contain unsupported content.');
    }

    // Wait 1 second before next poll
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Export timed out after 20 seconds.');
}