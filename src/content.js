// Compose a formatted link for the current page
// Each formatted link has three parts: preText, urlText, and postText.
// preText: Text to appear before the link. Optional. 
// urlText: Text to appear in the link. Required.
// postText: Text to appear after the link. Optional.
// If the current page is not from a supported site, return blank strings for all three parts.
function getCurrentPageFormattedLink() {
    let preText = "";
    let urlText = "";
    let postText = "";
    let siteName = "";
    let url = window.location.href;
    
    // Google Docs
    // URL starts with https://docs.google.com/document, https://docs.google.com/spreadsheets, or https://docs.google.com/presentation
    // urlText is the .docs-title-input element value. There is no preText or postText.
    if (/https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)/.test(url)) {
        let titleElement = document.querySelector('.docs-title-input');
        urlText = titleElement ? titleElement.value : '';
        siteName = 'Google Docs';

    // Jira Tickets
    // URL starts with https://*.atlassian.net/browse
    // urlText is the issue key (ticket number). postText is the issue summary (title). There is no preText.
    } else if (/https:\/\/.*\.atlassian\.net\/browse/.test(url)) {
        let key = url.split('/').pop();
        let summaryElement = document.querySelector('h1[data-testid="issue.views.issue-base.foundation.summary.heading"]');
        let summary = summaryElement ? summaryElement.innerText : '';
        urlText = key;
        postText = ': ' + summary;
        siteName = 'Jira Ticket';

    // Bugzilla Bugs
    // URL starts with https://bugzilla.mozilla.org/show_bug.cgi
    // urlText is the bug ID. postText is the bug summary (title). There is no preText.
    } else if (/https:\/\/bugzilla\.mozilla\.org\/show_bug\.cgi/.test(url)) {
        let id = url.split('=').pop();
        let summaryElement = document.querySelector('#field-value-short_desc');
        let summary = summaryElement ? summaryElement.innerText : '';
        urlText = id;
        postText = ': ' + summary;
        siteName = 'Bugzilla';
    
    // Wikipedia Articles
    // URL starts with https://en.wikipedia.org/wiki
    // urlText is the article title. There is no preText or postText.
    } else if (/https:\/\/en\.wikipedia\.org\/wiki/.test(url)) {
        urlText = url.split("https://en.wikipedia.org/wiki/")[1];
        urlText = decodeURIComponent(urlText);
        urlText = urlText.split('#')[0];
        urlText = urlText.replace(/_/g, ' ');
        siteName = 'Wikipedia';
    }

    return { preText, urlText, postText, siteName };
}

// Send link information to the background script when requested 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === 'getFormattedLink') {
        const formattedLink = getCurrentPageFormattedLink();
        sendResponse(formattedLink);
    }

    if (request.action === 'getSelection') {
        selection = getCurrentPageSelection();
        sendResponse(selection);
    }

    if (request.action === 'getOpenGraphTitle') {
        let ogTitle = document.querySelector('meta[property="og:title"]');
        let urlText = ogTitle ? ogTitle.getAttribute('content') : '';
        sendResponse(urlText);
    }

});

// Listen for selection changes
document.addEventListener('selectionchange', () => {
    selection = getCurrentPageSelection();
    chrome.runtime.sendMessage({ action: 'selectionChanged', selection: selection });
});

// Get the current selection
function getCurrentPageSelection() {
    selection = window.getSelection().toString();
    if (selection.length > 64) {
        selection = selection.slice(0, 61) + '...';
    }
    return selection;
}