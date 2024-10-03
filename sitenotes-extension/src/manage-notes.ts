console.log("Script loaded and running");

// Get buttons by their IDs
const summaryButton = document.getElementById('summaryButton');
const settingsButton = document.getElementById('settingsButton');
const syncButton = document.getElementById('syncButton');

// Get sections by their IDs
const summarySection = document.getElementById('summary');
const settingsSection = document.getElementById('settings');
const syncSection = document.getElementById('sync');

// Function to hide all sections
function hideAllSections(): void {
    if (summarySection) summarySection.style.display = 'none';
    if (settingsSection) settingsSection.style.display = 'none';
    if (syncSection) syncSection.style.display = 'none';
}

// Show the corresponding section on button click
if (summaryButton) {
    summaryButton.addEventListener('click', () => {
        console.log("Summary button clicked");
        hideAllSections();
        if (summarySection) summarySection.style.display = 'block';
    });
}

if (settingsButton) {
    settingsButton.addEventListener('click', () => {
        console.log("Settings button clicked");
        hideAllSections();
        if (settingsSection) settingsSection.style.display = 'block';
    });
}

if (syncButton) {
    syncButton.addEventListener('click', () => {
        console.log("Sync button clicked");
        hideAllSections();
        if (syncSection) syncSection.style.display = 'block';
    });
}
