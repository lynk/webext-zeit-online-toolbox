'use strict';

var ZBACK = {

    fullSlug: '/komplettansicht',
    isSingle: [],
    configDefault: {
        komplett: true,
        blacklist: true
    },


    redirect2Komplett: (details)=> {

        // Deconstruct URL via location object
        const tempUrl = document.createElement('a');
        tempUrl.href = details.url;

        const reqUrl = {
            'protocol': tempUrl.protocol,
            'hostname': tempUrl.hostname,
            'pathname': tempUrl.pathname,
            'query': tempUrl.search,
            'hash': tempUrl.hash
        };


        //  If this is true, redirecting is done
        if (details.statusCode == 200 && ZBACK.isSingle) {
            ZBACK.isSingle = false;
        }

        //if no fullslug and no single flag: redirect with fullslug
        else if (!reqUrl.pathname.includes(ZBACK.fullSlug, -1) && ZBACK.isSingle == false) {

            // Build new url with fullslug
            const urlOnePage =
                reqUrl.protocol + '//' +
                reqUrl.hostname +
                reqUrl.pathname.replace(/\/$/, "") +
                ZBACK.fullSlug +
                reqUrl.query +
                reqUrl.hash;

            return {
                redirectUrl: urlOnePage
            }
        }

        //if fullslug url returs 404, build old url by removing slug and redirect. set flag isSingle to end with first if
        else if (reqUrl.pathname.includes(ZBACK.fullSlug, -1) && details.statusCode == 404) {

            ZBACK.isSingle = true;
            const oldUrl = details.url.replace(ZBACK.fullSlug, '');
            return {
                redirectUrl: oldUrl
            }
        }


    },

    onBeforeRequest: function (details) {
        return ZBACK.redirect2Komplett(details);
    },

    startKomplettListening: ()=> {

        chrome.webRequest.onBeforeRequest.addListener(
            ZBACK.onBeforeRequest,
            {urls: ["*://www.zeit.de/*"], types: ["main_frame"]},
            ["blocking"]
        );

        chrome.webRequest.onHeadersReceived.addListener(
            ZBACK.onBeforeRequest,
            {urls: ["*://www.zeit.de/*"], types: ["main_frame"]},
            ["blocking"]
        );

    },

    endKomplettListening: ()=> {
        chrome.webRequest.onHeadersReceived.removeListener(ZBACK.onBeforeRequest);
        chrome.webRequest.onBeforeRequest.removeListener(ZBACK.onBeforeRequest);
    },

    // Act on config changes
    onStorageChange: (changes)=> {

        // Only if "config" key changes
        if (changes.config && changes.config.newValue.komplett == true) {
            ZBACK.startKomplettListening();
        }
        else if (changes.config && changes.config.newValue.komplett == false) {
            ZBACK.endKomplettListening();
        }

    },

    // Init Storage
    onInstall: (details)=> {

        switch (details.reason) {

            case 'install':
                chrome.storage.local.get(['blacklist'], function (results) {

                    if (Object.keys(results).length == 0) {

                        chrome.storage.local.set({
                            blacklist: {},
                            config: ZBACK.configDefault
                        });
                    }
                });
                break;
        }
    },

    onChromeInstall: ()=> {

        // Replace all rules ...
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
            // With a new rule ...
            chrome.declarativeContent.onPageChanged.addRules([
                {
                    conditions: [
                        new chrome.declarativeContent.PageStateMatcher({
                            //pageUrl: {hostEquals: 'www.zeit.de',}
                            pageUrl: {hostContains: '.zeit.de'}
                        })
                    ],

                    actions: [new chrome.declarativeContent.ShowPageAction()]
                }
            ]);
        });

    }
};


// On add-on install
chrome.runtime.onInstalled.addListener(ZBACK.onInstall);


// Get config on browser startup
chrome.storage.local.get(['config'], function (result) {

    // Start listening
    if (result.config && result.config.komplett == true) {
        ZBACK.startKomplettListening();
    }
    else if (result.config && result.config.komplett == false) {
        ZBACK.endKomplettListening();
    }
});

// Watch for config changes
chrome.storage.onChanged.addListener(ZBACK.onStorageChange);


// CHROME special
if (window.browser === undefined) {
    console.log("WE ARE CHROME");
    chrome.runtime.onInstalled.addListener(ZBACK.onChromeInstall);
}



