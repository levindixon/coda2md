chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'exportPage') {
    handleExport(request.url).then(sendResponse);
    return true;
  }
});

async function handleExport(url) {
  try {
    const urlMatch = url.match(/coda\.io\/d\/[^\/]+_d([^\/]+)\/[^\/]+_([^#?]+)/);
    if (!urlMatch) {
      return { success: false, error: 'Invalid Coda URL format' };
    }

    const docId = urlMatch[1];
    const pageSlug = urlMatch[2];

    const { codaApiKey } = await chrome.storage.local.get(['codaApiKey']);
    if (!codaApiKey) {
      return { success: false, error: 'API key not configured' };
    }

    const pageId = await findPageId(docId, pageSlug, codaApiKey);
    if (!pageId) {
      return { success: false, error: 'Could not find page ID' };
    }

    const exportId = await initiateExport(docId, pageId, codaApiKey);
    if (!exportId) {
      return { success: false, error: 'Failed to initiate export' };
    }

    const downloadUrl = await waitForExport(docId, pageId, exportId, codaApiKey);
    if (!downloadUrl) {
      return { success: false, error: 'Export failed or timed out' };
    }

    const pageName = await getPageName(docId, pageId, codaApiKey);
    const filename = `${pageName || 'coda-export'}.md`.replace(/[^a-z0-9-_.]/gi, '_');

    return { success: true, downloadUrl, filename };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function findPageId(docId, pageSlug, apiKey) {
  const response = await fetch(`https://coda.io/apis/v1/docs/${docId}/pages`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pages: ${response.status}`);
  }

  const data = await response.json();
  
  function searchPages(pages) {
    for (const page of pages) {
      if (page.browserLink && page.browserLink.includes(`_${pageSlug}`)) {
        return page.id;
      }
      if (page.children) {
        const childResult = searchPages(page.children);
        if (childResult) return childResult;
      }
    }
    return null;
  }

  return searchPages(data.items);
}

async function getPageName(docId, pageId, apiKey) {
  const response = await fetch(`https://coda.io/apis/v1/docs/${docId}/pages/${pageId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.name;
}

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
    throw new Error(`Failed to initiate export: ${response.status}`);
  }

  const data = await response.json();
  return data.id;
}

async function waitForExport(docId, pageId, exportId, apiKey, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `https://coda.io/apis/v1/docs/${docId}/pages/${pageId}/export/${exportId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check export status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'complete' && data.downloadLink) {
      return data.downloadLink;
    } else if (data.status === 'failed') {
      throw new Error(data.error || 'Export failed');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Export timed out');
}