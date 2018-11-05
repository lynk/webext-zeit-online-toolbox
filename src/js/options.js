chrome.storage.local.get(["blacklist"], (result)=> {


    if (result.blacklist != undefined) {

        let htmlBlacklist = '';

        Object.entries(result.blacklist).forEach(([key,value])=> {

            htmlBlacklist += '<li> ' + value + '<span class="remove times" data-userid="' + key + '">&times;</span><a href="https://community.zeit.de/user/' + key + '/komplettansicht">&#x1f441;</a></li>';
        });


        // let sortedABlacklist = aBlacklist.sort(function (a, b) {
        //     if (a < b) return -1;
        //     else if (a > b) return 1;
        //     return 0;
        // });

        document.getElementById("blacklist").innerHTML =
            '<ul>' + htmlBlacklist + '</ul>';


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