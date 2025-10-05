// MoodLink Chrome Extension - GUI Panel
// Provides user interface for emotion detection control

/**
 * Main function to create and show the MoodLink panel
 * Creates a dark-themed floating panel with emotion detection controls
 */
window.showMoodLinkPanel = function() {
    // Remove existing panel if present
    const existingPanel = document.getElementById('moodlink-extension-panel');
    if (existingPanel) existingPanel.remove();

    // Create and configure main panel
    const panel = createMainPanel();
    const { topBar, messageContainer, switchContainer } = createPanelComponents();
    
    // Assemble panel
    panel.appendChild(topBar);
    panel.appendChild(messageContainer);
    panel.appendChild(switchContainer);
    document.body.appendChild(panel);

    // Setup message listeners for backend communication
    setupMessageListeners(panel, messageContainer);
    
    return messageContainer;
};

/**
 * Create the main panel container with styling
 */
function createMainPanel() {
    const panel = document.createElement('div');
    panel.id = 'moodlink-extension-panel';
    
    // Panel styling
    Object.assign(panel.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '9999',
        width: '280px',
        height: '400px',
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        padding: '20px',
        opacity: '0.95',
        display: 'flex', // Ensure proper display value for hide/show
        visibility: 'visible',
        pointerEvents: 'auto',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'Arial, sans-serif'
    });
    
    return panel;
}

/**
 * Create all panel components (top bar, message area, controls)
 */
function createPanelComponents() {
    const topBar = createTopBar();
    const messageContainer = createMessageContainer();
    const switchContainer = createSwitchContainer();
    
    return { topBar, messageContainer, switchContainer };
}

/**
 * Create top bar with close button
 */
function createTopBar() {
    const topBar = document.createElement('div');
    Object.assign(topBar.style, {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: '28px',
        marginBottom: '10px'
    });

    const closeButton = createCloseButton();
    topBar.appendChild(closeButton);
    
    return topBar;
}

/**
 * Create close button with hover effects
 */
function createCloseButton() {
    const button = document.createElement('button');
    button.textContent = '✕';
    button.title = 'Close and end session';
    
    Object.assign(button.style, {
        background: 'transparent',
        border: 'none',
        color: '#aaa',
        fontSize: '20px',
        cursor: 'pointer',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s, color 0.2s'
    });

    // Hover effects
    button.addEventListener('mouseenter', () => {
        button.style.color = '#fff';
        button.style.background = '#e53935';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.color = '#aaa';
        button.style.background = 'transparent';
    });

    // Click handler - stops processing and ends session
    button.addEventListener('click', handleCloseButtonClick);
    
    return button;
}

/**
 * Handle close button click - stop processing and end session
 */
function handleCloseButtonClick() {
    console.log('Close button clicked - ending session...');
    
    // Stop processing first
    chrome.runtime.sendMessage({ type: 'toggleProcess', enabled: false }, () => {
        // Then end session and remove panel
        chrome.runtime.sendMessage({ type: 'endSession' }, (response) => {
            if (response && response.success) {
                console.log('Session ended successfully');
                
                // Open HTML report if available
                if (response.result && response.result.html_report_url) {
                    window.open(response.result.html_report_url, '_blank');
                }
            } else {
                console.error('Failed to end session:', response?.error);
            }
            
            // Remove panel
            const panel = document.getElementById('moodlink-extension-panel');
            if (panel) panel.remove();
        });
    });
}

/**
 * Create message container for status updates
 */
function createMessageContainer() {
    const container = document.createElement('div');
    container.id = 'moodlink-message';
    container.textContent = 'Ready to detect emotions...';
    
    Object.assign(container.style, {
        color: '#fff',
        fontSize: '14px',
        textAlign: 'center',
        minHeight: '50px',
        maxHeight: '120px',  // Allow more height for multiple emotions
        overflowY: 'auto',   // Add scrolling if needed
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '8px',
        backgroundColor: 'rgba(0,0,0,0.2)'
    });
    
    return container;
}

/**
 * Create switch container with toggle control
 */
function createSwitchContainer() {
    const container = document.createElement('div');
    Object.assign(container.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px',
        backgroundColor: '#222',
        borderRadius: '8px',
        marginTop: 'auto'
    });

    const switchControl = createSwitchControl();
    container.appendChild(switchControl);
    
    return container;
}

/**
 * Create toggle switch control
 */
function createSwitchControl() {
    const label = document.createElement('label');
    Object.assign(label.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer'
    });
    
    label.setAttribute('tabindex', '0');
    label.setAttribute('role', 'switch');
    label.setAttribute('aria-checked', 'false');

    // Hidden checkbox input
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.display = 'none';
    input.id = 'moodlink-toggle';

    // Visual slider
    const slider = createSlider();
    
    // Status text
    const statusText = createStatusText();

    // Toggle functionality
    const toggleHandler = createToggleHandler(input, slider, statusText);
    slider.addEventListener('click', toggleHandler);
    
    // Touch support
    slider.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleHandler();
    });

    // Assemble switch
    label.appendChild(input);
    label.appendChild(slider);
    label.appendChild(statusText);
    
    return label;
}

/**
 * Create visual slider element
 */
function createSlider() {
    const slider = document.createElement('span');
    Object.assign(slider.style, {
        width: '50px',
        height: '26px',
        background: '#2196F3',
        borderRadius: '26px',
        position: 'relative',
        display: 'inline-block',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        boxShadow: '0 0 5px rgba(33, 150, 243, 0.3)'
    });

    // Create knob
    const knob = document.createElement('span');
    Object.assign(knob.style, {
        position: 'absolute',
        left: '3px',
        top: '3px',
        width: '20px',
        height: '20px',
        background: '#fff',
        borderRadius: '50%',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    });
    
    slider.appendChild(knob);
    
    // Hover effects
    slider.addEventListener('mousedown', () => slider.style.transform = 'scale(0.95)');
    slider.addEventListener('mouseup', () => slider.style.transform = 'scale(1)');
    slider.addEventListener('mouseleave', () => slider.style.transform = 'scale(1)');
    
    return slider;
}

/**
 * Create status text element
 */
function createStatusText() {
    const text = document.createElement('span');
    text.textContent = 'OFF';
    
    Object.assign(text.style, {
        color: '#2196F3',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'color 0.3s ease'
    });
    
    return text;
}

/**
 * Create toggle handler function
 */
function createToggleHandler(input, slider, statusText) {
    return function() {
        const newState = !input.checked;
        const messageContainer = document.getElementById('moodlink-message');
        
        messageContainer.textContent = newState ? 'Connecting to backend...' : 'Stopping...';

        chrome.runtime.sendMessage({
            type: 'toggleProcess',
            enabled: newState
        }, (response) => {
            if (response && response.success) {
                updateToggleState(input, slider, statusText, messageContainer, newState);
                
                // Handle session end when turning OFF
                if (!newState) {
                    handleSessionEnd(messageContainer);
                }
            } else {
                handleToggleError(input, slider, messageContainer, newState);
            }
        });
    };
}

/**
 * Update visual state of toggle control
 */
function updateToggleState(input, slider, statusText, messageContainer, isOn) {
    input.checked = isOn;
    
    if (isOn) {
        // ON state - green
        slider.style.background = '#4CAF50';
        slider.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.3)';
        slider.firstChild.style.left = '27px'; // knob position
        statusText.textContent = 'ON';
        statusText.style.color = '#4CAF50';
        messageContainer.textContent = 'Analyzing emotions...';
        messageContainer.style.color = '#4CAF50';
    } else {
        // OFF state - blue
        slider.style.background = '#2196F3';
        slider.style.boxShadow = '0 0 5px rgba(33, 150, 243, 0.3)';
        slider.firstChild.style.left = '3px'; // knob position
        statusText.textContent = 'OFF';
        statusText.style.color = '#2196F3';
        messageContainer.textContent = 'Generating summary...';
        messageContainer.style.color = '#fff';
    }
}

/**
 * Handle session end when toggling OFF
 */
function handleSessionEnd(messageContainer) {
    console.log('Ending session after toggle OFF...');
    
    chrome.runtime.sendMessage({ type: 'endSession' }, (response) => {
        if (response && response.success) {
            messageContainer.textContent = 'Summary generated - Processing stopped';
            messageContainer.style.color = '#4CAF50';
            console.log('Session ended successfully');
            
            // Open HTML report if available
            if (response.result && response.result.html_report_url) {
                window.open(response.result.html_report_url, '_blank');
            }
        } else {
            messageContainer.textContent = 'Processing stopped (summary generation failed)';
            messageContainer.style.color = '#ff9800';
            console.error('Failed to end session:', response?.error);
        }
    });
}

/**
 * Handle toggle operation errors
 */
function handleToggleError(input, slider, messageContainer, attemptedState) {
    input.checked = false;
    slider.style.background = '#ff5252';
    slider.style.boxShadow = '0 0 10px rgba(255, 82, 82, 0.3)';
    messageContainer.textContent = `Failed to ${attemptedState ? 'start' : 'stop'} process`;
    messageContainer.style.color = '#ff5252';
}

/**
 * Setup message listeners for backend communication
 */
function setupMessageListeners(panel, messageContainer) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            switch(message.type) {
                case 'beforeScreenshot':
                    // Immediate, aggressive hiding
                    hidePanel(panel);
                    // Double-hide with force
                    panel.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; transform: translateX(-9999px) !important; z-index: -9999 !important;';
                    document.body.style.setProperty('--moodlink-hidden', 'true');
                    sendResponse({ hidden: true, success: true });
                    break;

                case 'afterScreenshot':
                    // Clear the aggressive hiding and restore completely
                    document.body.style.removeProperty('--moodlink-hidden');
                    showPanel(panel);
                    sendResponse({ shown: true, success: true });
                    break;

                case 'emotionDetected':
                    displayEmotions(messageContainer, message.emotions, message.face_count);
                    sendResponse({ displayed: true, success: true });
                    break;

                case 'error':
                    displayError(messageContainer, message.message);
                    sendResponse({ displayed: true, success: true });
                    break;

                case 'processStopped':
                    resetToOffState(messageContainer);
                    sendResponse({ handled: true, success: true });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Message handling error:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep message channel open for async response
    });
}

/**
 * Utility functions for panel visibility and state management
 */

function hidePanel(panel) {
    // Complete and immediate hiding using multiple methods
    Object.assign(panel.style, {
        display: 'none',
        visibility: 'hidden',
        opacity: '0',
        transform: 'translateX(1000px)', // Move completely off screen
        pointerEvents: 'none',
        zIndex: '-9999' // Send to back
    });
    
    // Force immediate DOM update
    panel.offsetHeight; // Trigger reflow
}

function showPanel(panel) {
    // Clear the aggressive hiding styles first
    panel.style.cssText = '';
    
    // Restore all original panel styling completely
    Object.assign(panel.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '9999',
        width: '280px',
        height: '400px',
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        padding: '20px',
        opacity: '0.95',
        display: 'flex',
        visibility: 'visible',
        pointerEvents: 'auto',
        transform: 'translateX(0px)',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'Arial, sans-serif'
    });
    
    // Force immediate DOM update
    panel.offsetHeight; // Trigger reflow
}

function displayEmotion(container, emotion) {
    container.textContent = `Detected: ${emotion.toUpperCase()}`;
    container.style.color = '#4CAF50';
    container.style.fontWeight = 'bold';
}

function displayEmotions(container, emotions, faceCount) {
    if (!emotions || emotions.length === 0) {
        container.textContent = 'No emotions detected';
        container.style.color = '#ff9800';
        return;
    }
    
    if (emotions.length === 1) {
        // Single person - use original format
        const emotion = emotions[0].replace(/^Person \d+: /, ''); // Remove "Person X:" prefix
        container.textContent = `Detected: ${emotion.toUpperCase()}`;
    } else {
        // Multiple people - show count and emotions
        container.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">
                ${faceCount} People Detected:
            </div>
            <div style="font-size: 12px; line-height: 1.3;">
                ${emotions.map(emotion => emotion.toUpperCase()).join('<br>')}
            </div>
        `;
    }
    
    container.style.color = '#4CAF50';
    container.style.fontWeight = 'bold';
}

function displayError(container, message) {
    container.textContent = message || 'An error occurred';
    container.style.color = '#ff5252';
}

function resetToOffState(container) {
    const toggle = document.getElementById('moodlink-toggle');
    const slider = toggle?.parentElement.querySelector('span');
    const statusText = toggle?.parentElement.querySelector('span:last-child');
    
    if (toggle && slider && statusText) {
        toggle.checked = false;
        slider.style.background = '#2196F3';
        slider.firstChild.style.left = '3px';
        statusText.textContent = 'OFF';
        statusText.style.color = '#2196F3';
    }
    
    container.textContent = 'Process stopped';
    container.style.color = '#fff';
}