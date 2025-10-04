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
    
    // Send to API
    const apiResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData
    });
    
    if (apiResponse.ok) {
      const result = await apiResponse.json();
      console.log('Screenshot sent successfully!', result);
      
      // Show success notification
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const notification = document.createElement('div');
          notification.textContent = '✅ Screenshot sent to API!';
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
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
          }, 3000);
        }
      });
      
    } else {
      throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
    }
    
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
