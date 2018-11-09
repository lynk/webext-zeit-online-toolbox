// todo: watch storage and remove user from list


function sortProperties(obj)
{
    // convert object into array
    var sortable=[];
    for(var key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]

    // sort items by value
    sortable.sort(function(a, b)
    {
        var x=a[1].toLowerCase(),
            y=b[1].toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}


chrome.storage.local.get(["blacklist"], (result)=> {


    if (result.blacklist != undefined) {

        let htmlBlacklist = '';

        // Sort by Username
        const sortedBlacklist = sortProperties(result.blacklist);

        // Build output list
        sortedBlacklist.forEach(([key,value])=> {

            const escValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            htmlBlacklist += '<li> ' + escValue + '<span class="remove" data-userid="' + key + '">&times;</span><a href="https://community.zeit.de/user/' + key + '/komplettansicht" target="_blank"><img src="/icons/svg/eye_me.svg" /> </a></li>';
        });

        // Add Blacklist to DOM
        document.getElementById("blacklist").innerHTML =
            '<ul class="clearfix">' + htmlBlacklist + '</ul>';

        $('#blacklist').find('span.remove').click(function () {

            const userID = $(this).attr('data-userid');

            // Remove name from view
            $(this).closest('li').remove();

            chrome.storage.local.get(["blacklist"], function (result) {

                // Delete user from bl by userId
                delete result.blacklist[userID];

                // Save
                chrome.storage.local.set({blacklist: result.blacklist});

            });


        });
    }
});
;'use strict';

document.addEventListener("DOMContentLoaded", function () {

    ZPOP.initPopup();
});


var ZPOP = {

    options: {
        komplett: {
            storageKey: 'komplettIsActive',
            domId: 'checkbox-komplett'
        },
        blacklist: {
            storageKey: 'blacklistIsActive',
            domId: 'checkbox-blacklist'
        }
    },


    setConfig: (option, bool)=> {


        chrome.storage.local.get(['config'], function (result) {

            Object.assign(result.config, {[option]: bool});

            // Save
            chrome.storage.local.set({config: result.config});

        })
    },

    // Because of async we start here and get the current state first;
    // then init the switcher
    getConfig: ()=> {

        chrome.storage.local.get(['config'], function (result) {
            ZPOP.switcher('', result);
        })
    },

    switcher: (filter, config)=> {

        let $haul = $('input[type=checkbox]');

        if (filter !== undefined && filter.length) {
            $haul = $haul.filter(filter);
        }

        $haul.each(function () {

            const $checkbox = $(this).hide();

            // set initial state from config
            if (config.config[[$checkbox.attr('name')]] === true) {
                $checkbox.prop('checked', true);
            }
            else {
                $checkbox.prop('checked', false);
            }

            // create switcher; pass checkbox state to new switcher
            const $switcher = $(document.createElement('div'))
                .addClass('ui-switcher')
                .attr('aria-checked', $checkbox.is(':checked'));


            let toggleSwitch = function (e) {

                // set checkbox state in the background
                if (e.target.type === undefined) {
                    $checkbox.trigger(e.type);
                }

                // set switcher state for styling
                $switcher.attr('aria-checked', $checkbox.is(':checked'));

                const optionKey = $checkbox.attr('name');

                // run on
                if ($checkbox.is(':checked') === true) {
                    ZPOP.setConfig(optionKey, true);
                }
                else {
                    ZPOP.setConfig(optionKey, false);
                }

            };

            $switcher.on('click', toggleSwitch);
            $switcher.insertBefore($checkbox);
        });

    },

    initPopup: ()=> {
        ZPOP.getConfig();
    }

};


