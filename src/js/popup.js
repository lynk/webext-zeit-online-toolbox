'use strict';

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

            console.log(result.config);
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


