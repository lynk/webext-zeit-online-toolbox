
'use strict';


var ZB = {

    fullSlug: '/komplettansicht',
    isSingle: [],

    onBeforeRequest: function (details) {

        // Reset flag
        if (details.statusCode == 200 && ZB.isSingle) {
            ZB.isSingle = false;
        }
        //if no fullslug and no single flag: redirect with fullslug
        else if (!details.url.includes(ZB.fullSlug, -1) && ZB.isSingle == false) {

            //remove trailing slash + add slug
            const urlOnePage = details.url.replace(/\/$/, "") + ZB.fullSlug;
            return {
                redirectUrl: urlOnePage
            }
        }
        //if fullslug url returs 404, build old url by removing slug and redirect. set flag isSingle to end with first if
        else if (details.url.includes(ZB.fullSlug, -1) && details.statusCode == 404) {
            ZB.isSingle = true;
            const oldUrl = details.url.replace(ZB.fullSlug, '');
            return {
                redirectUrl: oldUrl
            }
        }
    },

    handleClick: function () {

    },

    onStartup: function () {
    },



    onTabUpdated: function (tabId, changeInfo = '', tab = '') {

        // Show plugin icon if on zeit.de
        const currentHost = ZB.getHostFromUrl(tab.url);

        if (currentHost !== 'www.zeit.de') {
            browser.browserAction.disable(tabId);
        }
        else {
            browser.browserAction.setIcon({
                tabId: tabId,
                path: "icons/webextension-zeit-icon.png"
            });

            browser.browserAction.enable(tabId);
        }

    },

    getHostFromUrl: function (fullUrl) {
        const a = document.createElement('a');
        a.href = fullUrl;
        return a.hostname;
    }
};


// Browser stratup listener
//browser.runtime.onStartup.addListener(ZB.onStartup);

// Button listener
browser.browserAction.onClicked.addListener(ZB.handleClick);


browser.webRequest.onBeforeRequest.addListener(
    ZB.onBeforeRequest,
    {urls: ["*://*.zeit.de/*"], types: ["main_frame"]},
    ["blocking"]
);

browser.webRequest.onHeadersReceived.addListener(
    ZB.onBeforeRequest,
    {urls: ["*://*.zeit.de/*"], types: ["main_frame"]},
    ["blocking"]
);


browser.tabs.onUpdated.addListener(ZB.onTabUpdated);