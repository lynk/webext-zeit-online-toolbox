;'use strict';

var ZONC = {

    htmlModeratedReplacer: '<hr style="color: red" />',
    htmlBlacklistedReplacer: '<hr style="color: green" />',
    selectorIdPage: 'js-comments-body',
    selectorIdUser: 'cntntfll',
    textAddUser2Bl: 'User blacklisten',
    textRemoveUser2Bl: 'User von der Blacklist entfernen',

    removeCommentsModerated: function (selector) {

        $(selector).find('em.moderation').closest('article.comment').not('[data-ct-column="1"]').html(ZONC.htmlModeratedReplacer);

    },

    removeCommentsBlacklisted: function (selector) {

        chrome.storage.local.get(["blacklist"], function (result) {

            if (result.blacklist !== undefined) {

                let userSelector = '';

                // Iterate result obj and build multiple selector string
                for (const [key, value] of Object.entries(result.blacklist)) {
                    userSelector += 'a:contains(\'' + value + '\')' + ',';
                }

                // Remove trailing comma
                userSelector = userSelector.substring(0, userSelector.length - 1);

                // todo: remove first comment and keep subcomment toggler
                $(selector).find('.comment-meta__name').find(userSelector).closest('.comment').not('[data-ct-column="1"]').html(ZONC.htmlBlacklistedReplacer);
            }
        })
    },

    cleanPage: (selPage)=> {

        // Trigger xhr loading of subcomments into DOM
        $(selPage).find('div.js-load-comment-replies').trigger('click');

        // Wait x seconds for xhr loading
        window.setTimeout(function () {

            // Close subcomment sections
            $(selPage).find('a.js-hide-replies').each(function () {
                this.click();
            });

            ZONC.removeCommentsModerated(selPage);
            ZONC.removeCommentsBlacklisted(selPage);

        }, 100);

    },

    addToBlacklist: function (username) {

        chrome.storage.local.get(["blacklist"], function (result) {

            // Get user ID by getting a meta tag property
            const $prop = $('meta[content="' + username + '"').attr(('about'));
            // Split to array
            const $aUser = $prop.split('/');

            // Lets do a little bit of security here
            const userId = parseInt($aUser[2]);
            const escUsername = username.replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            // Merge current blacklist with new user obj
            Object.assign(result.blacklist, {[userId]: escUsername});

            // Save
            chrome.storage.local.set({blacklist: result.blacklist});

        })
    },

    removeFromBlacklist: (username)=> {

        chrome.storage.local.get(["blacklist"], function (result) {

            // Get user ID by getting a meta tag property
            const $prop = $('meta[content="' + username + '"').attr(('about'));
            // Split to array
            const aUser = $prop.split('/');

            // Delete user from bl by userId
            delete result.blacklist[aUser[2]];

            // Save
            chrome.storage.local.set({blacklist: result.blacklist});

        })
    },

    onUserPage: (selector) => {

        let $insert = $('<a id="zontools-bl"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="-1 -1 23 22"><rect x="9.1" y="10.7" width="3" height="6.5"/><title class="zontools-user-title">' + ZONC.textAddUser2Bl + '</title><path d="M12.2,7.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5V4.1C8.7,4.2,8.3,4.5,8,4.9c-1.5,1.5-1.5,3.9,0,5.4 c1.5,1.5,3.9,1.5,5.4,0c1.5-1.5,1.5-3.9,0-5.4c-0.3-0.3-0.7-0.6-1.2-0.8V7.5z"/><circle cx="10.7" cy="10.7" r="10.2"/></svg><span class="zontools-user-title">' + ZONC.textAddUser2Bl + '</span></a>');

        // Cache selector
        const $userWrapper = $(selector).find('.usr-data-wrapper');

        // Insert blacklist link
        $userWrapper.find('.title').after($insert);

        // Get username
        const username = $userWrapper.find('.title').html();

        chrome.storage.local.get(["blacklist"], function (result) {

            // Is this user on the blacklist?
            if (Object.values(result.blacklist).includes(username)) {
                ZONC.setBlacklistUserBtn($userWrapper, 'on');
            }
        });


        // Add click event and pass username
        $userWrapper.find('#zontools-bl').click(function () {

            // Add or remove?
            if ($(this).hasClass('is-blacklisted')) {

                // remove from blacklist
                ZONC.setBlacklistUserBtn($userWrapper, 'off');
                ZONC.removeFromBlacklist(username);
            }
            else {
                ZONC.setBlacklistUserBtn($userWrapper, 'on');
                ZONC.addToBlacklist(username);
            }

        });
    },

    setBlacklistUserBtn: ($userWrapper, state)=> {

        switch (state) {
            case 'on':
                // / Add class
                $userWrapper.find('#zontools-bl').addClass('is-blacklisted');
                $userWrapper.find('#zontools-bl .zontools-user-title').html(ZONC.textRemoveUser2Bl);

                break;
            case 'off':
                $userWrapper.find('#zontools-bl').removeClass('is-blacklisted');
                $userWrapper.find('#zontools-bl .zontools-user-title').html(ZONC.textAddUser2Bl);
                break;
        }

    }

};


$(document).ready(function () {

    // Are we on an user profile page?
    const selUser = document.getElementById(ZONC.selectorIdUser);

    if (selUser != null) {
        ZONC.onUserPage(selUser);
    }


    // We are on a page with comments
    const selPage = document.getElementById(ZONC.selectorIdPage);

    if (selPage != null) {
        // Get config on browser startup
        chrome.storage.local.get(['config'], function (result) {

            // Start listening
            if (result.config.blacklist == true) {
                ZONC.cleanPage(selPage);
            }

        });
    }

});// ready()


// window.addEventListener('touchstart', function onFirstTouch() {
//     // we could use a class
//     document.body.classList.add('lynk-touched');
//
//     window.removeEventListener('touchstart', onFirstTouch, false);
// }, false);