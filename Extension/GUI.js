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

    // Message container
    const messageContainer = document.createElement('div');
    messageContainer.id = 'moodlink-message';
    messageContainer.style.color = '#fff';
    messageContainer.style.fontSize = '14px';
    messageContainer.style.fontFamily = 'Arial, sans-serif';
    messageContainer.style.marginBottom = '20px';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.minHeight = '50px';
    messageContainer.style.display = 'flex';
    messageContainer.style.alignItems = 'center';
    messageContainer.style.justifyContent = 'center';

    // Switch container at bottom
    const switchContainer = document.createElement('div');
    switchContainer.style.display = 'flex';
    switchContainer.style.alignItems = 'center';
    switchContainer.style.justifyContent = 'center';
    switchContainer.style.padding = '15px';
    switchContainer.style.backgroundColor = '#222';
    switchContainer.style.borderRadius = '8px';

    // Switch label and input
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '12px';
    label.style.cursor = 'pointer';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.display = 'none';
    input.id = 'moodlink-toggle';
    input.checked = false; // Default to OFF

    const slider = document.createElement('span');
    slider.style.width = '50px';
    slider.style.height = '26px';
    slider.style.background = '#444';
    slider.style.borderRadius = '26px';
    slider.style.position = 'relative';
    slider.style.display = 'inline-block';
    slider.style.transition = 'background 0.3s';

    const knob = document.createElement('span');
    knob.style.position = 'absolute';
    knob.style.left = '3px';
    knob.style.top = '3px';
    knob.style.width = '20px';
    knob.style.height = '20px';
    knob.style.background = '#fff';
    knob.style.borderRadius = '50%';
    knob.style.transition = 'left 0.3s';
    slider.appendChild(knob);

    const statusText = document.createElement('span');
    statusText.textContent = 'OFF';
    statusText.style.color = '#fff';
    statusText.style.fontSize = '14px';
    statusText.style.fontWeight = 'bold';

    // Toggle logic with process start/stop
    input.addEventListener('change', () => {
        if (input.checked) {
            slider.style.background = '#4CAF50';
            knob.style.left = '27px';
            statusText.textContent = 'ON';
            messageContainer.textContent = 'Process started...';
            // Add your process start logic here
        } else {
            slider.style.background = '#444';
            knob.style.left = '3px';
            statusText.textContent = 'OFF';
            messageContainer.textContent = '';
            // Add your process stop logic here
        }
    });

    // Click on slider toggles input
    slider.addEventListener('click', () => {
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change'));
    });

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
