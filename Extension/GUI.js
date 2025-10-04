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

    // Toggle handler with animation
    const handleToggle = () => {
        const newState = !input.checked;
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
                    messageContainer.textContent = 'Process started...';

                    // Add success animation
                    slider.style.transform = 'scale(1.05)';
                    setTimeout(() => slider.style.transform = 'scale(1)', 200);
                } else {
                    slider.style.background = '#2196F3';
                    slider.style.boxShadow = '0 0 5px rgba(33, 150, 243, 0.3)';
                    knob.style.left = '3px';
                    statusText.textContent = 'OFF';
                    statusText.style.color = '#2196F3';
                    messageContainer.textContent = 'Process stopped';
                }
            } else {
                messageContainer.textContent = 'Failed to ' + (newState ? 'start' : 'stop') + ' process';
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
    guiFrame.appendChild(messageContainer);
    guiFrame.appendChild(switchContainer);
    document.body.appendChild(guiFrame);

    // Return the message container for external updates
    return messageContainer;
};

// Optionally, remove the old auto-run logic so the panel only appears when showMoodLinkPanel() is called
