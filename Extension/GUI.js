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
    guiFrame.style.width = '320px';
    guiFrame.style.minHeight = '180px'; // Vertical rectangle
    guiFrame.style.background = '#f9f9f9';
    guiFrame.style.border = '1.5px solid #bbb';
    guiFrame.style.borderRadius = '16px';
    guiFrame.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
    guiFrame.style.padding = '0 0 20px 0';
    guiFrame.style.opacity = '1';
    guiFrame.style.transition = 'box-shadow 0.3s';
    guiFrame.style.cursor = 'default';
    guiFrame.style.userSelect = 'none';
    guiFrame.style.display = 'flex';
    guiFrame.style.flexDirection = 'column';
    guiFrame.style.justifyContent = 'flex-end'; // Switch at the bottom
    guiFrame.style.alignItems = 'stretch';

    // Switch container
    const switchContainer = document.createElement('div');
    switchContainer.style.display = 'flex';
    switchContainer.style.alignItems = 'center';
    switchContainer.style.justifyContent = 'center';
    switchContainer.style.padding = '18px 24px 0 24px';

    // Switch label and input
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '10px';
    label.style.cursor = 'pointer';

    // Custom styled switch
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.display = 'none';
    input.id = 'moodlink-toggle';

    const slider = document.createElement('span');
    slider.style.width = '44px';
    slider.style.height = '24px';
    slider.style.background = '#ccc';
    slider.style.borderRadius = '24px';
    slider.style.position = 'relative';
    slider.style.display = 'inline-block';
    slider.style.transition = 'background 0.2s';

    // Knob
    const knob = document.createElement('span');
    knob.style.position = 'absolute';
    knob.style.left = '2px';
    knob.style.top = '2px';
    knob.style.width = '20px';
    knob.style.height = '20px';
    knob.style.background = '#fff';
    knob.style.borderRadius = '50%';
    knob.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
    knob.style.transition = 'left 0.2s';
    slider.appendChild(knob);

    // ON/OFF text
    const span = document.createElement('span');
    span.textContent = 'OFF';
    span.style.fontWeight = 'bold';
    span.style.color = '#333';
    span.style.marginLeft = '12px';
    span.style.fontSize = '15px';

    // Toggle logic
    input.addEventListener('change', () => {
        if (input.checked) {
            slider.style.background = '#4a90e2';
            knob.style.left = '22px';
            span.textContent = 'ON';
            span.style.color = '#4a90e2';
        } else {
            slider.style.background = '#ccc';
            knob.style.left = '2px';
            span.textContent = 'OFF';
            span.style.color = '#333';
        }
        // Add your callback here
        // e.g., toggleExtensionFeature(input.checked);
    });

    // Click on slider toggles input
    slider.addEventListener('click', () => {
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change'));
    });

    label.appendChild(input);
    label.appendChild(slider);
    label.appendChild(span);
    switchContainer.appendChild(label);

    // Only the box and switch
    guiFrame.appendChild(switchContainer);
    document.body.appendChild(guiFrame);
};

// Optionally, remove the old auto-run logic so the panel only appears when showMoodLinkPanel() is called
