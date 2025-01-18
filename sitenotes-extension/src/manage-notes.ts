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
const fetchPageURLsFromChromeStorage = async (): Promise<string[]> => {
    return new Promise((resolve) => {
        chrome.storage.local.get({ modifiedPages: [] }, (result) => {
            resolve(result.modifiedPages as string[]);
        });
    });
};

const updateSummarySection = async () => {
    const summarySection = document.getElementById('summary');
    if (!summarySection) return;

    summarySection.innerHTML = `<h3 style="font-size: 1.5em;">Summary</h3><p style="font-size: 1.2em;">Below are the pages where changes were made:</p>`;

    const urls = await fetchPageURLsFromChromeStorage();

    const list = document.createElement('ul');
    urls.forEach((url) => {
        const listItem = document.createElement('li');
        listItem.style.fontSize = '1.1em';

        const shortURL = url.length > 120 ? url.substring(0, 117) + '...' : url;

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.textContent = shortURL;
        link.style.color = 'green';
        link.style.fontSize = '1.1em';

        listItem.appendChild(link);
        list.appendChild(listItem);
    });

    summarySection.appendChild(list);
};

window.addEventListener('load', async () => {
    await updateSummarySection();
    console.log('Summary loaded.');
  });