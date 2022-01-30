chrome.runtime.onMessage.addListener(
  function (request, sender, _sendResponse) {
    if (sender.tab) {
      chrome.action.setBadgeText({ text: `${request.length}`, tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#538d4e' });
    }
    return true;
  }
);