// GUI.js

// Create container
const guiContainer = document.createElement('div');
guiContainer.style.position = 'fixed';
guiContainer.style.bottom = '20px';
guiContainer.style.right = '20px';
guiContainer.style.zIndex = '9999';
guiContainer.style.opacity = '0.3';
guiContainer.style.transition = 'opacity 0.3s';
guiContainer.style.background = '#fff';
guiContainer.style.border = '1px solid #ccc';
guiContainer.style.borderRadius = '20px';
guiContainer.style.padding = '10px 20px';
guiContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
guiContainer.style.cursor = 'pointer';

// Show on hover
guiContainer.addEventListener('mouseenter', () => {
    guiContainer.style.opacity = '1';
});
guiContainer.addEventListener('mouseleave', () => {
    guiContainer.style.opacity = '0.3';
});

// Create switch
const label = document.createElement('label');
label.style.display = 'flex';
label.style.alignItems = 'center';
label.style.gap = '8px';

const input = document.createElement('input');
input.type = 'checkbox';
input.style.width = '40px';
input.style.height = '20px';

const span = document.createElement('span');
span.textContent = 'OFF';

input.addEventListener('change', () => {
    span.textContent = input.checked ? 'ON' : 'OFF';
    // You can add your callback here
    // e.g., toggleExtensionFeature(input.checked);
});

label.appendChild(input);
label.appendChild(span);
guiContainer.appendChild(label);
document.body.appendChild(guiContainer);
