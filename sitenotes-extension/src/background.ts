// Description: Background script for the extension.
// This script listens for completed page loads and sends a message to the content script to load notes for the page. (for now, could be used for other things in the future)

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    // Ensure the page has completely loaded
    if (changeInfo.status === 'complete') {
        // Send a message to the content script to load notes
        chrome.tabs.sendMessage(tabId, { action: "loadNotes" }, () => {
            if (chrome.runtime.lastError) {
                console.log("Error sending message to content script:", chrome.runtime.lastError.message);
            }
        });
    }
});
