// MoodLink Chrome Extension - Background Script
// Handles screenshot capture, API communication, and session management

// Configuration
const API_ENDPOINT = 'http://localhost:8000/api/';
const SCREENSHOT_INTERVAL = 3000; // 3 seconds between captures

// State management
let isProcessing = false;
let processingTab = null;

/**
 * Message handler for GUI communication
 * Handles: toggleProcess, endSession
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'toggleProcess':
            handleToggleProcess(message, sender, sendResponse);
            return true; // Async response
            
        case 'endSession':
            handleEndSession(sendResponse);
            return true; // Async response
            
        default:
            console.warn('Unknown message type:', message.type);
            sendResponse({ success: false, error: 'Unknown message type' });
    }
});

/**
 * Handle process toggle (start/stop emotion detection)
 */
function handleToggleProcess(message, sender, sendResponse) {
    isProcessing = message.enabled;
    
    if (isProcessing) {
        processingTab = sender.tab;
        startProcessing(sender.tab);
        sendResponse({ success: true, status: 'started' });
    } else {
        stopProcessing();
        sendResponse({ success: true, status: 'stopped' });
    }
}

/**
 * Handle session end request
 */
function handleEndSession(sendResponse) {
    console.log('Processing end session request...');
    
    endMeetingSession()
        .then(result => {
            console.log('Meeting session ended successfully:', result);
            
            // Open HTML report in new tab if available
            if (result && result.html_report_url) {
                chrome.tabs.create({
                    url: result.html_report_url,
                    active: true
                }, (tab) => {
                    console.log('HTML report opened in new tab:', tab.id);
                });
            }
            
            if (sendResponse) {
                sendResponse({ success: true, result: result });
            }
        })
        .catch(error => {
            console.error('Failed to end meeting session:', error);
            if (sendResponse) {
                sendResponse({ success: false, error: error.message });
            }
        });
}

/**
 * Extension icon click handler - shows GUI
 */
chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Inject GUI script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['GUI.js']
        });

        // Show GUI panel
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                if (typeof window.showMoodLinkPanel === 'function') {
                    window.showMoodLinkPanel();
                }
            }
        });
    } catch (error) {
        console.error('Failed to inject GUI:', error);
    }
});

/**
 * Main processing loop - captures screenshots and analyzes emotions
 */
async function startProcessing(tab) {
    console.log('Starting emotion detection processing...');
    
    while (isProcessing) {
        try {
            // Validate tab
            if (!tab || !tab.id) {
                console.error('Invalid tab');
                await sleep(1000);
                continue;
            }

            // Skip restricted URLs
            if (isRestrictedUrl(tab.url)) {
                await sleep(1000);
                continue;
            }

            // Capture and process screenshot
            await captureAndProcessScreenshot(tab);
            
            // Wait before next capture
            await sleep(SCREENSHOT_INTERVAL);
            
        } catch (error) {
            console.error('Processing error:', error);
            notifyError(tab, 'Processing error occurred');
            await sleep(1000);
        }
    }
    
    console.log('Emotion detection processing stopped');
}

/**
 * Capture screenshot and send to API for emotion analysis
 */
async function captureAndProcessScreenshot(tab) {
    try {
        // Hide GUI temporarily
        await sendTabMessage(tab.id, { type: 'beforeScreenshot' });

        // Capture screenshot
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
            format: 'png',
            quality: 100
        });

        // Show GUI again
        await sendTabMessage(tab.id, { type: 'afterScreenshot' });

        // Process with API
        await sendScreenshotToAPI(tab, dataUrl);
        
    } catch (error) {
        console.error('Screenshot capture failed:', error);
        notifyError(tab, 'Failed to capture screenshot');
    }
}

/**
 * Send screenshot to Django API for emotion detection
 */
async function sendScreenshotToAPI(tab, dataUrl) {
    try {
        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        
        // Prepare form data
        const formData = new FormData();
        formData.append('screenshot', blob, `screenshot-${Date.now()}.png`);

        // Send to API
        const apiResponse = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: formData
        });

        if (!apiResponse.ok) {
            throw new Error(`API error: ${apiResponse.status}`);
        }

        // Process response
        const result = await apiResponse.json();
        if (result && result.emotion) {
            await sendTabMessage(tab.id, {
                type: 'emotionDetected',
                emotion: result.emotion
            });
        }
        
    } catch (error) {
        console.error('API communication failed:', error);
        notifyError(tab, 'Failed to process emotion');
    }
}

/**
 * End meeting session and generate AI summary
 */
async function endMeetingSession() {
    try {
        console.log('Calling end session API...');
        
        const response = await fetch(API_ENDPOINT + 'end-session/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Session ended successfully:', result);
        return result;
        
    } catch (error) {
        console.error('End session failed:', error);
        throw error;
    }
}

/**
 * Stop emotion detection processing
 */
function stopProcessing() {
    isProcessing = false;
    
    if (processingTab && processingTab.id) {
        sendTabMessage(processingTab.id, { type: 'processStopped' })
            .catch(() => console.log('Tab already closed'));
    }
    
    processingTab = null;
}

/**
 * Utility functions
 */

function isRestrictedUrl(url) {
    if (!url) return true;
    
    const restrictedPrefixes = [
        'chrome://', 'chrome-extension://', 'edge://', 'about:'
    ];
    
    return restrictedPrefixes.some(prefix => url.startsWith(prefix));
}

async function sendTabMessage(tabId, message) {
    return chrome.tabs.sendMessage(tabId, message);
}

function notifyError(tab, message) {
    if (tab && tab.id) {
        sendTabMessage(tab.id, {
            type: 'error',
            message: message
        }).catch(() => {});
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}