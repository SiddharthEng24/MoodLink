// API endpoint - change this to your actual API URL
const API_ENDPOINT = 'http://localhost:8000/api/';
let isProcessing = false;
let processingTab = null;

// Listen for messages from the GUI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'toggleProcess') {
        isProcessing = message.enabled;
        if (isProcessing) {
            processingTab = sender.tab;
            startProcessing(sender.tab);
            sendResponse({ success: true, status: 'started' });
        } else {
            stopProcessing();
            sendResponse({ success: true, status: 'stopped' });
        }
        return true;
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
            if (!tab || !tab.id) {
                console.error('Invalid tab');
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            // Check if we can capture this tab (avoid restricted URLs)
            if (tab.url && (tab.url.startsWith('chrome://') ||
                tab.url.startsWith('chrome-extension://') ||
                tab.url.startsWith('edge://') ||
                tab.url.startsWith('about:'))) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            // Quick hide -> capture -> show sequence
            await chrome.tabs.sendMessage(tab.id, { type: 'beforeScreenshot' });

            // Capture immediately after GUI is hidden
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: 'png',
                quality: 100
            });

            // Show GUI immediately after capture
            chrome.tabs.sendMessage(tab.id, { type: 'afterScreenshot' });

            try {
                // Convert and send to API
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const formData = new FormData();
                formData.append('screenshot', blob, `screenshot-${Date.now()}.png`);

                const apiResponse = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    body: formData
                });

                if (!apiResponse.ok) {
                    throw new Error(`API responded with status: ${apiResponse.status}`);
                }

                // Parse the emotion response
                const result = await apiResponse.json();
                if (result && result.emotion) {
                    // Send emotion back to GUI
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'emotionDetected',
                        emotion: result.emotion
                    });
                }
            } catch (apiError) {
                console.error('API Error:', apiError);
                chrome.tabs.sendMessage(tab.id, {
                    type: 'error',
                    message: 'Failed to process image'
                });
            }

            // Shorter interval between captures
            await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
            console.error('Processing Error:', error);
            if (tab && tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'error',
                    message: 'Processing error occurred'
                });
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

function stopProcessing() {
    isProcessing = false;
    if (processingTab && processingTab.id) {
        chrome.tabs.sendMessage(processingTab.id, {
            type: 'processStopped'
        }).catch(() => {
            // Ignore any errors if the tab is already closed
            console.log('Tab already closed or unreachable');
        });
    }
    processingTab = null;
}
