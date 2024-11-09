let textLinkText = {};
let titleLinkText = {};
let formattedLinkPreText = {};
let formattedLinkUrlText = {};
let formattedLinkPostText = {};
let siteName = {};
let selectionLinkText = {};

let pageActionVisible = {};
let pageLoading = {};

//Add or remove page action button and context menu when the tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    // If the tab is loading, hide the page action button and remove the context menu
    if (changeInfo.status === 'loading') {
        console.log('Tab is loading, hiding page action button and removing context menu: ', tabId);
        pageLoading[tabId] = true;
        chrome.pageAction.hide(tabId);
        pageActionVisible[tabId] = false;
        chrome.contextMenus.removeAll();
    }

    // If the tab has finished loading, show the page action button and set up the context menu
    // If the tab title has changed, refreesh the context menu
    if (changeInfo.status === 'complete' || (changeInfo.title && pageActionVisible[tabId])) {
        console.log('Tab loading is complete, setting up button and menu for tab: ', tabId);
        pageLoading[tabId] = false;
        chrome.contextMenus.removeAll();
        loadPageAction(tab);
        getSelection(tabId);
        console.log('Showing page action button for tab:', tabId);
        chrome.pageAction.show(tabId);
        pageActionVisible[tabId] = true;
    }
});

// Refresh the page action button and context menu when the tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Tab activated: ', activeInfo.tabId);
    refreshPageAction(activeInfo.tabId);
});

// Refresh the page action button and context menu when a window gets focus
chrome.windows.onFocusChanged.addListener((windowId) => {
    console.log('Window focus changed: ', windowId);
    if (windowId > 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            refreshPageAction(tabs[0].id);
        });
    }
});

function refreshPageAction(tabId) {
    // Only refresh the page action button if the tab is not loading
    if (!pageLoading[tabId]) {

        // Get the current tab
        chrome.tabs.get(tabId, (tab) => {

            console.log('Tab is not loading, resetting everything for tab: ', tabId);
            chrome.pageAction.hide(tabId);
            pageActionVisible[tabId] = false;
            chrome.contextMenus.removeAll();
            loadPageAction(tab);
            getSelection(tabId);
            console.log('Showing page action button for tab:', tabId);
            chrome.pageAction.show(tabId);
            pageActionVisible[tabId] = true;

        });

    } else {
        console.log('Tab is loading, not refreshing page action button for tab: ', activeInfo.tabId);
    }
}

// Populate the page action button and context menu 
function loadPageAction(tab) {
    if (tab.url.length > 64) {
        textLinkText[tab.id] = tab.url.slice(0, 61) + '...';
    } else {
        textLinkText[tab.id] = tab.url;
    }
    console.log('textLinkText: ', textLinkText[tab.id]);

    chrome.contextMenus.create({
        id: 'copyLink',
        title: 'Copy URL: "' + textLinkText[tab.id] + '"',
        contexts: ['page_action']
    });

    getOpenGraphTitle(tab.id).then((urlText) => {
        console.log('openGraphTitle: ', urlText);
        titleLinkText[tab.id] = urlText;

        if (titleLinkText[tab.id] && titleLinkText[tab.id].length > 64) {
            titleLinkText[tab.id] = titleLinkText[tab.id].slice(0, 61) + '...';
        }

        if (!titleLinkText[tab.id]) {
            if (tab.title.length > 64) {
                titleLinkText[tab.id] = tab.title.slice(0, 61) + '...';
            } else {
                titleLinkText[tab.id] = tab.title;
            }
            console.log("Used tab title: ", titleLinkText[tab.id]);
        } else {
            console.log("Used Open Graph title: ", titleLinkText[tab.id]);
        }

        chrome.contextMenus.create({
            id: 'copyTitle',
            title: 'Copy Title Link: "' + titleLinkText[tab.id] + '"',
            contexts: ['page_action']
        });
    });

    getFormattedLinkText(tab.id).then((formattedLink) => {

        if (formattedLink && formattedLink.urlText) {
            console.log('formattedLinkText: ', formattedLink.preText, formattedLink.urlText, formattedLink.postText);
            formattedLinkPreText[tab.id] = formattedLink.preText;
            formattedLinkUrlText[tab.id] = formattedLink.urlText;
            formattedLinkPostText[tab.id] = formattedLink.postText;
            siteName[tab.id] = formattedLink.siteName;

            console.log('Creating formatted link context menu item');
            chrome.contextMenus.create({
                id: 'copyFormattedLink',
                title: 'Copy ' + siteName[tab.id] + ' Flink: ' + formattedLinkPreText[tab.id] + '"' + formattedLinkUrlText[tab.id] + '"' + formattedLinkPostText[tab.id],
                contexts: ['page_action']
            });
        } else {
            console.log('No formatted link text for this page');
        }
    });
}

// Get the Open Graph title for the current tab
function getOpenGraphTitle(tabId) {
    console.log('Getting Open Graph title for tab: ', tabId);

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, { action: 'getOpenGraphTitle' }, (urlText) => {
            console.log('Got Open Graph title response: ', urlText);
            resolve(urlText);
        });
    });
}

// Get the formatted link text for the current tab
function getFormattedLinkText(tabId) {
    console.log('Getting formatted link text for tab: ', tabId);

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, { action: 'getFormattedLink' }, (formattedLink) => {
            console.log('Got formatted link response: ', formattedLink);
            resolve(formattedLink)
        });
    });
}

// Listen for messages from the content script that the selection has changed
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === 'selectionChanged') {
        console.log('Selection changed: ', message.selection);
        selectionLinkText[sender.tab.id] = message.selection;
        loadSelectionLink(sender.tab.id);
    }
});

// Get the current selection from the given tab
function getSelection(tabId) {
    console.log('Getting selection link for tab: ', tabId);

    chrome.tabs.sendMessage(tabId, { action: 'getSelection' }, (selection) => {
        console.log('Got selection: ', selection);
        selectionLinkText[tabId] = selection;
        loadSelectionLink(tabId);
    });
}

// Load the selection link for the current tab
function loadSelectionLink(tabId) {

    if (selectionLinkText[tabId]) {

        console.log('Creating selection link context menu item for selection: ', selectionLinkText[tabId]);
        chrome.contextMenus.remove('copySelectionLink');
        chrome.contextMenus.create({
            id: 'copySelectionLink',
            title: 'Copy Selection Link: "' + selectionLinkText[tabId] + '"',
            contexts: ['page_action']
        });

    } else {
        console.log('Removing selection link context menu item');
        chrome.contextMenus.remove('copySelectionLink');
    }
}

// When the button is clicked, copy the URL to the clipboard
chrome.pageAction.onClicked.addListener(async (tab) => {
    console.log('Page action button clicked, copying URL to clipboard');
    await navigator.clipboard.write([
        new ClipboardItem({
            'text/plain': new Blob([tab.url], { type: 'text/plain' }),
            'text/html': new Blob(["<a href='" + tab.url + "'>" + tab.url + "</a>"], { type: 'text/html' })
        })
    ])
});

// Handle context menu options 
chrome.contextMenus.onClicked.addListener(async (info, tab) => {

    if (info.menuItemId === 'copyLink') {
        console.log('Copy link context menu item clicked, copying URL to clipboard');
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': new Blob([tab.url], { type: 'text/plain' }),
                'text/html': new Blob(["<a href='" + tab.url + "'>" + tab.url + "</a>"], { type: 'text/html' })
            })
        ])
    }

    if (info.menuItemId === 'copyTitle') {
        console.log('Copy title link context menu item clicked, copying title link to clipboard');
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': new Blob([tab.url + " (" + titleLinkText[tab.id] + ")"], { type: 'text/plain' }),
                'text/html': new Blob(["<a href='" + tab.url + "'>" + titleLinkText[tab.id] + "</a>"], { type: 'text/html' })
            })
        ])
    }

    if (info.menuItemId === 'copyFormattedLink') {
        console.log('Copy formatted link context menu item clicked, copying formatted link to clipboard');
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': new Blob([tab.url + " (" + formattedLinkPreText[tab.id] + formattedLinkUrlText[tab.id] + formattedLinkPostText[tab.id] + ")"], { type: 'text/plain' }),
                'text/html': new Blob([formattedLinkPreText[tab.id] + "<a href='" + tab.url + "'>" + formattedLinkUrlText[tab.id] + "</a>" + formattedLinkPostText[tab.id]], { type: 'text/html' })
            })
        ])
    }

    if (info.menuItemId === 'copySelectionLink') {
        console.log('Copy selection link context menu item clicked, copying selection link to clipboard');
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': new Blob([tab.url + " (" + selectionLinkText[tab.id] + ")"], { type: 'text/plain' }),
                'text/html': new Blob(["<a href='" + tab.url + "'>" + selectionLinkText[tab.id] + "</a>"], { type: 'text/html' })
            })
        ])
    }
});