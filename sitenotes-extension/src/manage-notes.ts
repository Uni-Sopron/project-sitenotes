console.log("Script loaded and running");

// Get buttons by their IDs
const summaryButton = document.getElementById('summaryButton');
const settingsButton = document.getElementById('settingsButton');
const syncButton = document.getElementById('syncButton');

// Get sections by their IDs
const summarySection = document.getElementById('summary');
const settingsSection = document.getElementById('settings');
const syncSection = document.getElementById('sync');

// Variable to keep track of the currently visible section
let currentSection: HTMLElement | null = null;

// Function to hide all sections
function hideAllSections(): void {
    if (summarySection) summarySection.style.display = 'none';
    if (settingsSection) settingsSection.style.display = 'none';
    if (syncSection) syncSection.style.display = 'none';
}

// Function to handle section display logic
function showSection(section: HTMLElement | null) {
    if (currentSection && currentSection === section) {
        // If the same section is clicked again, close it
        hideAllSections();
        currentSection = null; // Reset current section
    } else {
        // Hide all sections first
        hideAllSections();
        if (section) {
            section.style.display = 'block'; // Show the new section
            currentSection = section; // Update current section
        }
    }
}

// Show the corresponding section on button click
if (summaryButton) {
    summaryButton.addEventListener('click', () => {
        console.log("Summary button clicked");
        showSection(summarySection);
    });
}

if (settingsButton) {
    settingsButton.addEventListener('click', () => {
        console.log("Settings button clicked");
        showSection(settingsSection);
    });
}

if (syncButton) {
    syncButton.addEventListener('click', () => {
        console.log("Sync button clicked");
        showSection(syncSection);
    });
}
