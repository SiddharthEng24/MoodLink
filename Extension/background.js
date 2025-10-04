// API endpoint - change this to your actual API URL
const API_ENDPOINT = 'http://localhost:8000/api/';

// Take screenshot and send to API when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  // First, inject the GUI script into the page
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['GUI.js']
  });
  
  // Show the GUI panel
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      if (typeof window.showMoodLinkPanel === 'function') {
        window.showMoodLinkPanel();
      }
    }
  });
  
  // Capture the visible area of the current tab
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
    format: 'png',
    quality: 90
  });
  
  // Convert dataUrl to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  
  // Create FormData to send the image
  const formData = new FormData();
  formData.append('screenshot', blob, `screenshot-${Date.now()}.png`);
  
  // Send to API
  await fetch(API_ENDPOINT, {
    method: 'POST',
    body: formData
  });
});
