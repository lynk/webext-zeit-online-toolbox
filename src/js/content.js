'use strict';

var ZONC =
{

    htmlModeratedReplacer: '<hr style="color:green;">',
    htmlBlacklistedReplacer: '<hr style="color:firebrick;">',
    htmlSkeletonComment: `<div class="comment__container"><div class="comment-meta"><div class="comment-meta__name"><div class="skeleton-text-lynk"></div></div></div><div class="comment__body"><div class="skeleton-text-lynk"></div><div class="skeleton-text-lynk"></div></div></div>`,
    selectorIdPage: 'js-comments-body',
    selectorIdUser: 'cntntfll',
    blacklistCss: '',
    textAddUser2Bl: 'User ignorieren',
    textRemoveUser2Bl: 'User von der Ignorierliste entfernen',

    removeCommentsModerated: () => {

        // $(selector).find('em.moderation').closest('article.comment').not('[data-ct-column="1"]').remove();

        $(document.getElementById(ZONC.selectorIdPage)).find('em.moderation')
            .closest('article.comment')
            .each(function () {

                ZONC.removeCommentsFilter($(this));

            });
    },

    removeCommentsBlacklisted: () => {

        $(document.getElementById(ZONC.selectorIdPage)).find('div.comment-meta__name').find(ZONC.blacklistCss)
            .closest('article.comment')
            .each(function () {

                ZONC.removeCommentsFilter($(this));
            });
    },

    removeCommentsFilter: (target) => {

        // Add skeleton if toplevel comment
        if (target.hasClass('js-comment-toplevel')) {

            target.empty().append(ZONC.htmlSkeletonComment);
        }
        else if (target.hasClass('comment--wrapped')) {

        }
        else {
            target.remove();
        }
    },

    initCommentListening: (wrapper) => {

        // Remove native Zeit event listener class and add my own
        $(wrapper).find('div.js-load-comment-replies').addClass('js-load-comment-replies-lynk').removeClass('js-load-comment-replies');

        // Add my listeners
        $(wrapper).find('div.js-load-comment-replies-lynk').click(ZONC.loadComments);
    },

    loadComments: (e) => {

        e.preventDefault();
        const $target = $(e.currentTarget);

        // Get data url and get comments via XHR
        const url = $target.closest('div.js-load-comment-replies-lynk').attr('data-url');
        const articleId = $target.closest('article.comment').attr('id');


        let jqxhr = $.ajax({
                url: url,
                method: 'GET',
                dataType: 'text'
            }).done(function (commentString) {

                const $commentHtml = $('<div/>').append(commentString);

                // Get all articles
                const $articleHtml = $commentHtml.find('article.comment');


                let cleanComments = document.createElement('div');
                let numComments = 1;

                $articleHtml.each(function () {

                    const $this = $(this);

                    // Check for moderated comment
                    if ($this.find('em.moderation').length === 0) {

                        // Check for username and add to cleanComments
                        if ($this.find('div.comment-meta__name').find(ZONC.blacklistCss).length === 0) {
                            // check for iteration index to add stuff add 8th
                            if (numComments % 5 == 0) {
                                $this.addClass('posi-rel-lynk');
                                $this.append('<a class="gotop-comment-lynk" href="#' + articleId + '"></a>');
                            }

                            $this.attr('style', 'display:none');
                            cleanComments.append($this[0]);
                            numComments++;
                        }
                    }
                });

                // todo: Does this actually do any good?
                requestAnimationFrame(() => {

                    // Add clean comments to DOM
                    $target.closest('article.comment').after(cleanComments.childNodes);

                    // Remove our click event + class; add native Zeit opener class
                    $target.closest('div.comment-overlay').off().removeClass('js-load-comment-replies-lynk').addClass('js-show-replies');

                    // Trigger click
                    $target.closest('div.comment-overlay').trigger('click');

                    // Add close link
                    const articleId = $target.closest('article.comment').prev('article.comment').attr('id');

                    // Correct comment count
                    numComments--;

                    const closeHtml = '<a id="hide-replies-' + articleId + '" href="#" data-ct-label="antworten_verbergen" class="comment__rewrapper js-hide-replies"><span class="comment__count">' + numComments + '</span><span class="comment__cta">Antworten verbergen</span></a>';

                    $target.closest('.comment__container').prepend(closeHtml);
                });

            })
            ;
    },

    cleanPage: ()=> {

        ZONC.removeCommentsModerated();
        ZONC.removeCommentsBlacklisted();

    },

    addToBlacklist: (username) => {

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

    removeFromBlacklist: (username) => {

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

        let $insert = $('<a id="zontb-btn-user"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="-1 -1 23 22"><circle cx="10.7" cy="10.7" r="10.2"/><rect x="9.1" y="10.7" width="3" height="6.5" /><path d="M12.2,7.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5V4.1C8.7,4.2,8.3,4.5,8,4.9c-1.5,1.5-1.5,3.9,0,5.4 c1.5,1.5,3.9,1.5,5.4,0c1.5-1.5,1.5-3.9,0-5.4c-0.3-0.3-0.7-0.6-1.2-0.8V7.5z" /></svg></span><span class="zontb-user-title">' + ZONC.textAddUser2Bl + '</span></a>');

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
        $userWrapper.find('#zontb-btn-user').click(function () {

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
                $userWrapper.find('#zontb-btn-user').addClass('is-blacklisted');
                $userWrapper.find('#zontb-btn-user .zontb-user-title').html(ZONC.textRemoveUser2Bl);

                break;
            case 'off':
                $userWrapper.find('#zontb-btn-user').removeClass('is-blacklisted');
                $userWrapper.find('#zontb-btn-user .zontb-user-title').html(ZONC.textAddUser2Bl);
                break;
        }

    },

    buildBlacklistCss: () => {

        chrome.storage.local.get(["blacklist"], function (result) {

            if (result.blacklist !== undefined) {

                let userSelector = '';

                // Iterate result obj and build multiple selector string
                for (const [key, value] of Object.entries(result.blacklist)) {
                    userSelector += 'a:contains(\'' + value + '\')' + ',';
                }

                // Remove trailing comma
                userSelector = userSelector.substring(0, userSelector.length - 1);

                ZONC.blacklistCss = userSelector;
            }
        });
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

        // Build + cache user css selector to speed up things later
        ZONC.buildBlacklistCss();

        // Get config on browser startup
        chrome.storage.local.get(['config'], function (result) {

            // Start listening
            if (result.config.blacklist == true) {
                ZONC.cleanPage();
                ZONC.initCommentListening(selPage);
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