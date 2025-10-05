// GUI.js

// Expose a global function to show the panel
window.showMoodLinkPanel = function() {
    // Remove existing panel if present
    const oldPanel = document.getElementById('moodlink-extension-panel');
    if (oldPanel) oldPanel.remove();

    // Create main frame
    const guiFrame = document.createElement('div');
    guiFrame.id = 'moodlink-extension-panel';
    guiFrame.style.position = 'fixed';
    guiFrame.style.bottom = '20px';
    guiFrame.style.right = '20px';
    guiFrame.style.zIndex = '9999';
    guiFrame.style.width = '280px';
    guiFrame.style.height = '400px'; // Taller vertical rectangle
    guiFrame.style.background = '#1a1a1a'; // Dark background
    guiFrame.style.border = '1px solid #333';
    guiFrame.style.borderRadius = '12px';
    guiFrame.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
    guiFrame.style.padding = '20px';
    guiFrame.style.opacity = '0.95';
    guiFrame.style.display = 'flex';
    guiFrame.style.flexDirection = 'column';
    guiFrame.style.justifyContent = 'space-between';

    // --- Top bar with close button ---
    const topBar = document.createElement('div');
    topBar.style.display = 'flex';
    topBar.style.justifyContent = 'flex-end';
    topBar.style.alignItems = 'center';
    topBar.style.height = '28px';
    topBar.style.marginBottom = '10px';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#aaa';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.width = '28px';
    closeBtn.style.height = '28px';
    closeBtn.style.display = 'flex';
    closeBtn.style.alignItems = 'center';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.transition = 'background 0.2s, color 0.2s';

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = '#fff';
        closeBtn.style.background = '#e53935';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = '#aaa';
        closeBtn.style.background = 'transparent';
    });

    // Updated close button click handler
    closeBtn.addEventListener('click', () => {
        // First, stop any ongoing processing
        chrome.runtime.sendMessage({
            type: 'toggleProcess',
            enabled: false
        }, response => {
            // Remove the GUI after ensuring processing is stopped
            if (input.checked) {
                input.checked = false;
                slider.style.background = '#2196F3';
                knob.style.left = '3px';
                statusText.textContent = 'OFF';
                statusText.style.color = '#2196F3';
            }
            // Remove the panel
            guiFrame.remove();
        });
    });

    topBar.appendChild(closeBtn);

    // Message container for status updates
    const messageContainer = document.createElement('div');
    messageContainer.id = 'moodlink-message';
    messageContainer.style.color = '#fff';
    messageContainer.style.fontSize = '14px';
    messageContainer.style.fontFamily = 'Arial, sans-serif';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.minHeight = '50px';
    messageContainer.style.display = 'flex';
    messageContainer.style.alignItems = 'center';
    messageContainer.style.justifyContent = 'center';
    messageContainer.textContent = 'Ready to detect emotions...';

    // Update the message container style for better visibility
    messageContainer.style.padding = '10px';
    messageContainer.style.margin = '10px 0';
    messageContainer.style.borderRadius = '8px';
    messageContainer.style.backgroundColor = 'rgba(0,0,0,0.2)';

    // Switch container
    const switchContainer = document.createElement('div');
    switchContainer.style.display = 'flex';
    switchContainer.style.alignItems = 'center';
    switchContainer.style.justifyContent = 'center';
    switchContainer.style.padding = '15px';
    switchContainer.style.backgroundColor = '#222';
    switchContainer.style.borderRadius = '8px';
    switchContainer.style.marginTop = 'auto';

    // Switch elements
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '12px';
    label.style.cursor = 'pointer';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.display = 'none';
    input.id = 'moodlink-toggle';

    const slider = document.createElement('span');
    slider.style.width = '50px';
    slider.style.height = '26px';
    slider.style.background = '#2196F3'; // Blue when OFF
    slider.style.borderRadius = '26px';
    slider.style.position = 'relative';
    slider.style.display = 'inline-block';
    slider.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    slider.style.cursor = 'pointer';
    slider.style.boxShadow = '0 0 5px rgba(33, 150, 243, 0.3)'; // Blue glow when OFF

    const knob = document.createElement('span');
    knob.style.position = 'absolute';
    knob.style.left = '3px';
    knob.style.top = '3px';
    knob.style.width = '20px';
    knob.style.height = '20px';
    knob.style.background = '#fff';
    knob.style.borderRadius = '50%';
    knob.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    knob.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    slider.appendChild(knob);

    const statusText = document.createElement('span');
    statusText.textContent = 'OFF';
    statusText.style.color = '#2196F3'; // Blue when OFF
    statusText.style.fontSize = '14px';
    statusText.style.fontWeight = 'bold';
    statusText.style.transition = 'color 0.3s ease';

    // Add touch and hover effects
    slider.addEventListener('mousedown', () => {
        slider.style.transform = 'scale(0.95)';
    });

    slider.addEventListener('mouseup', () => {
        slider.style.transform = 'scale(1)';
    });

    slider.addEventListener('mouseleave', () => {
        slider.style.transform = 'scale(1)';
    });

    // Enhanced toggle handler with proper status updates
    const handleToggle = () => {
        const newState = !input.checked;
        messageContainer.textContent = newState ? 'Connecting to backend...' : 'Stopping...';

        chrome.runtime.sendMessage({
            type: 'toggleProcess',
            enabled: newState
        }, response => {
            if (response && response.success) {
                input.checked = newState;
                if (newState) {
                    slider.style.background = '#4CAF50';
                    slider.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.3)';
                    knob.style.left = '27px';
                    statusText.textContent = 'ON';
                    statusText.style.color = '#4CAF50';
                    messageContainer.textContent = 'Processing started - Analyzing emotions...';
                    messageContainer.style.color = '#4CAF50';
                } else {
                    slider.style.background = '#2196F3';
                    slider.style.boxShadow = '0 0 5px rgba(33, 150, 243, 0.3)';
                    knob.style.left = '3px';
                    statusText.textContent = 'OFF';
                    statusText.style.color = '#2196F3';
                    messageContainer.textContent = 'Processing stopped';
                    messageContainer.style.color = '#fff';
                }
            } else {
                input.checked = false;
                slider.style.background = '#ff5252';
                slider.style.boxShadow = '0 0 10px rgba(255, 82, 82, 0.3)';
                messageContainer.textContent = 'Failed to ' + (newState ? 'start' : 'stop') + ' process';
                messageContainer.style.color = '#ff5252';
                console.error('Toggle failed:', response);
            }
        });
    };

    // Event listeners
    slider.addEventListener('click', (e) => {
        e.preventDefault();
        handleToggle();
    });

    // Touch event support
    slider.addEventListener('touchstart', (e) => {
        e.preventDefault();
        slider.style.transform = 'scale(0.95)';
    });

    slider.addEventListener('touchend', (e) => {
        e.preventDefault();
        slider.style.transform = 'scale(1)';
        handleToggle();
    });

    label.setAttribute('tabindex', '0');
    label.setAttribute('role', 'switch');
    label.setAttribute('aria-checked', 'false');

    // Assemble the switch
    label.appendChild(input);
    label.appendChild(slider);
    label.appendChild(statusText);
    switchContainer.appendChild(label);

    // Assemble the panel
    guiFrame.appendChild(topBar);
    guiFrame.appendChild(messageContainer);
    guiFrame.appendChild(switchContainer);
    document.body.appendChild(guiFrame);

    // Enhanced message listener for backend communication
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch(message.type) {
            case 'beforeScreenshot':
                guiFrame.style.opacity = '0';
                guiFrame.style.visibility = 'hidden';
                guiFrame.style.pointerEvents = 'none';
                sendResponse({ hidden: true });
                break;

            case 'afterScreenshot':
                requestAnimationFrame(() => {
                    guiFrame.style.opacity = '0.95';
                    guiFrame.style.visibility = 'visible';
                    guiFrame.style.pointerEvents = 'auto';
                });
                sendResponse({ shown: true });
                break;

            case 'emotionDetected':
                const emotion = message.emotion || 'unknown';
                messageContainer.textContent = `Detected Emotion: ${emotion.toUpperCase()}`;
                messageContainer.style.color = '#4CAF50';
                messageContainer.style.fontWeight = 'bold';
                sendResponse({ displayed: true });
                break;

            case 'error':
                messageContainer.textContent = message.message || 'An error occurred';
                messageContainer.style.color = '#ff5252';
                slider.style.background = '#ff5252';
                sendResponse({ displayed: true });
                break;

            case 'processStopped':
                input.checked = false;
                slider.style.background = '#2196F3';
                knob.style.left = '3px';
                statusText.textContent = 'OFF';
                statusText.style.color = '#2196F3';
                messageContainer.textContent = 'Process stopped';
                messageContainer.style.color = '#fff';
                sendResponse({ handled: true });
                break;
        }
        return true;
    });

    // Return the message container for external updates
    return messageContainer;
};

// Optionally, remove the old auto-run logic so the panel only appears when showMoodLinkPanel() is called
