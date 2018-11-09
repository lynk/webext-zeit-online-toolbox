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