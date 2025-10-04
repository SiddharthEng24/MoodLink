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
            // Check if we can capture this tab (avoid chrome:// URLs)
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
                console.log('Skipping chrome:// or restricted URL:', tab.url);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            // Tell GUI to hide
            try {
                await chrome.tabs.sendMessage(tab.id, { type: 'beforeScreenshot' });
            } catch (e) {
                console.log('Could not send beforeScreenshot message:', e.message);
            }

            // Wait a brief moment for the GUI to hide
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capture the visible area of the current tab
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: 'png',
                quality: 90
            });

            // Tell GUI to show again
            try {
                await chrome.tabs.sendMessage(tab.id, { type: 'afterScreenshot' });
            } catch (e) {
                console.log('Could not send afterScreenshot message:', e.message);
            }

            // Convert dataUrl to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            // Create FormData to send the image
            const formData = new FormData();
            formData.append('screenshot', blob, `screenshot-${Date.now()}.png`);

            // Send to API
            const apiResponse = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData
            });
            
            if (!apiResponse.ok) {
                throw new Error(`API request failed: ${apiResponse.status}`);
            }
            
            // Get the JSON response with emotion data
            const result = await apiResponse.json();
            console.log('API Response:', result);
            
            // Send emotion to GUI
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'emotionDetected',
                    emotion: result.emotion || 'unknown'
                });
                console.log('Emotion sent to GUI:', result.emotion);
            } catch (e) {
                console.log('Could not send emotion to GUI:', e.message);
            }

            // Wait for 5 seconds before next capture
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error('Error in processing:', error);
            
            // If it's a permission error, stop processing
            if (error.message.includes('permission') || error.message.includes('chrome://')) {
                isProcessing = false;
                break;
            }
            
            // For other errors, wait and continue
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

function stopProcessing() {
    isProcessing = false;
}
