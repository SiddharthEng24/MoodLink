// GUI.js

// Create main frame
const guiFrame = document.createElement('div');
guiFrame.style.position = 'fixed';
guiFrame.style.bottom = '20px';
guiFrame.style.right = '20px';
guiFrame.style.zIndex = '9999';
guiFrame.style.width = '260px';
guiFrame.style.background = '#f9f9f9';
guiFrame.style.border = '1.5px solid #bbb';
guiFrame.style.borderRadius = '16px';
guiFrame.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
guiFrame.style.padding = '0 0 16px 0';
guiFrame.style.opacity = '0.5';
guiFrame.style.transition = 'opacity 0.3s';
guiFrame.style.cursor = 'pointer';

// Show on hover
guiFrame.addEventListener('mouseenter', () => {
    guiFrame.style.opacity = '1';
});
guiFrame.addEventListener('mouseleave', () => {
    guiFrame.style.opacity = '0.5';
});

// Header message
const header = document.createElement('div');
header.textContent = 'Extension Control Panel';
header.style.background = '#4a90e2';
header.style.color = '#fff';
header.style.fontWeight = 'bold';
header.style.fontSize = '16px';
header.style.padding = '12px 20px';
header.style.borderTopLeftRadius = '16px';
header.style.borderTopRightRadius = '16px';
header.style.letterSpacing = '0.5px';

// Switch container
const switchContainer = document.createElement('div');
switchContainer.style.display = 'flex';
switchContainer.style.alignItems = 'center';
switchContainer.style.justifyContent = 'space-between';
switchContainer.style.padding = '18px 20px 0 20px';

// Switch label and input
const label = document.createElement('label');
label.style.display = 'flex';
label.style.alignItems = 'center';
label.style.gap = '10px';

const input = document.createElement('input');
input.type = 'checkbox';
input.style.width = '40px';
input.style.height = '20px';

const span = document.createElement('span');
span.textContent = 'OFF';
span.style.fontWeight = 'bold';
span.style.color = '#333';

input.addEventListener('change', () => {
    span.textContent = input.checked ? 'ON' : 'OFF';
    // Add your callback here
    // e.g., toggleExtensionFeature(input.checked);
});

label.appendChild(input);
label.appendChild(span);
switchContainer.appendChild(label);

// Assemble frame
guiFrame.appendChild(header);
guiFrame.appendChild(switchContainer);
document.body.appendChild(guiFrame);
