// API endpoint - change this to your actual API URL
const API_ENDPOINT = 'https://your-api-endpoint.com/upload-screenshot';

// Take screenshot and send to API when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    console.log('Taking screenshot...');
    
    // Capture the visible area of the current tab
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 90
    });
    
    console.log('Screenshot captured! Sending to API...');
    
    // Convert dataUrl to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Create FormData to send the image
    const formData = new FormData();
    formData.append('screenshot', blob, `screenshot-${Date.now()}.png`);
    formData.append('url', tab.url);
    formData.append('title', tab.title);
    formData.append('timestamp', new Date().toISOString());
    
        // Try to send to API (will fail for now, but that's ok)
    let apiSuccess = false;
    try {
      const apiResponse = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData
      });
      
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        console.log('Screenshot sent successfully!', result);
        apiSuccess = true;
      }
    } catch (apiError) {
      console.log('API call failed (expected):', apiError.message);
    }
    
    // Always download the screenshot file regardless of API success
    const filename = `screenshot-${Date.now()}.png`;
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: (dataUrl, filename, apiWorked) => {
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Show notification
        const notification = document.createElement('div');
        notification.textContent = apiWorked ? 
          '✅ Screenshot sent to API & downloaded!' : 
          '📁 Screenshot downloaded! (API not configured)';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${apiWorked ? '#4CAF50' : '#2196F3'};
          color: white;
          padding: 15px;
          border-radius: 5px;
          z-index: 999999;
          font-family: Arial, sans-serif;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 4000);
      },
      args: [dataUrl, filename, apiSuccess]
    });
    
  } catch (error) {
    console.error('Failed to capture or send screenshot:', error);
    
    // Show error notification
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: (errorMessage) => {
        const notification = document.createElement('div');
        notification.textContent = `❌ Error: ${errorMessage}`;
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #f44336;
          color: white;
          padding: 15px;
          border-radius: 5px;
          z-index: 999999;
          font-family: Arial, sans-serif;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          max-width: 300px;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 5000);
      },
      args: [error.message]
    });
  }
});
