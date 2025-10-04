// API endpoint - change this to your actual API URL
const API_ENDPOINT = 'http://localhost:8000/api/';
let isProcessing = false;

// Listen for messages from the GUI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'toggleProcess') {
    isProcessing = message.enabled;
    if (isProcessing) {
      startProcessing(sender.tab);
    } else {
      stopProcessing();
    }
    sendResponse({ success: true });
  }
});

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
});

async function startProcessing(tab) {
  while (isProcessing) {
    try {
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

      // Wait for 5 seconds before next capture
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error('Error in processing:', error);
      isProcessing = false;
    }
  }
}

function stopProcessing() {
  isProcessing = false;
}
