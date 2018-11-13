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

            htmlBlacklist += '<li> ' + escValue + '<span class="remove" data-userid="' + key + '" title="Entfernen">&times;</span><a title="Profil ansehen" href="https://community.zeit.de/user/' + key + '/komplettansicht" target="_blank"><svg  version="1.1" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/" width="24" height="12" viewBox="70 -10 190 190" xml:space="preserve"><defs></defs><path d="M279.844,77.625c-14.063,25.406-33.655,44.813-58.78,58.219c-24,12.845-51,19.267-81,19.267c-30.095,0-57.095-6.422-81-19.267C33.938,122.438,14.25,103.031,0,77.625c14.344-25.5,33.984-44.953,58.922-58.359C82.828,6.422,109.875,0,140.063,0c30.094,0,57.094,6.422,81,19.266C246.188,32.672,265.782,52.125,279.844,77.625z M253.266,77.625c-18.375-32.25-47.344-51.656-86.905-58.219c11.813,5.063,21.233,12.82,28.266,23.272c7.032,10.453,10.547,22.103,10.547,34.945c0,12.563-3.469,24.094-10.406,34.594c-6.937,10.5-16.172,18.328-27.702,23.484C206.344,129.047,235.079,109.688,253.266,77.625zM191.673,77.625c0-14.156-5.086-26.133-15.258-35.93S154.079,27,139.923,27c-7.406,0-14.531,1.547-21.375,4.641l-5.344-12.233c-39.469,6.75-68.344,26.156-86.625,58.219c18.188,31.969,46.875,51.328,86.063,58.078c-11.53-5.156-20.741-12.984-27.633-23.484c-6.891-10.5-10.336-22.03-10.336-34.594c0-7.688,1.359-15.188,4.078-22.5l13.078,4.078c-2.438,6.094-3.656,12.234-3.656,18.422c0,14.156,5.063,26.133,15.188,35.93c10.125,9.798,22.313,14.695,36.563,14.695s26.438-4.897,36.563-14.695C186.612,103.759,191.673,91.781,191.673,77.625z M179.016,77.625c0,10.688-3.844,19.758-11.53,27.211c-7.688,7.453-16.875,11.18-27.563,11.18c-10.781,0-19.992-3.727-27.633-11.18s-11.461-16.522-11.461-27.211c0-4.781,0.797-9.281,2.391-13.5l39.938,18.141L124.454,42.61c5.063-2.25,10.219-3.375,15.469-3.375c10.688,0,19.875,3.727,27.563,11.18C175.174,57.868,179.016,66.938,179.016,77.625z"/></svg></a></li>';
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


