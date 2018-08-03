$(document).ready(function () {

    // Our Team Project Firebase DB details
    var config = {
        apiKey: "AIzaSyDE69uyplbf3RicfsXU-vHHqgICPxZ6-FA",
        authDomain: "smu-coding-group-project.firebaseapp.com",
        databaseURL: "https://smu-coding-group-project.firebaseio.com",
        projectId: "smu-coding-group-project",
        storageBucket: "",
        messagingSenderId: "285720676843"
    };
    firebase.initializeApp(config);

    // Create a variable to reference the database.
    var database = firebase.database();

    var officialsArray = [];

    // var globalOfficialsArray = [];

    var keyTracker = [];

    // Empties the database if user refreshes the page by accident
    database.ref("/officials").remove();

    database.ref("/officials").on("value", function (snapshot) {

        // Instead of using iteration loops, Firebase has a forEach function to traverse through each child element in the database
        snapshot.forEach(function (childSnapshot) {
            // childData will be the actual contents of the child
            // in this case, all the player values
            var childData = childSnapshot.val();

            var officialKey = childSnapshot.key;

            // condition check to see if the key for this childata is already in the global keyTracker variable
            // if it is not, proceeds with rest of function to add the childdata into global officials array
            if (!(keyTracker.includes(officialKey))) {
                keyTracker.push(officialKey);

                var socialArray = [];

                for (var x = 0; x < childData.socialchannel.length; x++) {
                    var socialchannel = { sitetype: childData.socialchannel[x].sitetype, siteID: childData.socialchannel[x].siteID };
                    socialArray.push(socialchannel);
                }

                var governmentOfficial = {
                    name: childData.name,
                    title: childData.title,
                    party: childData.party,
                    address: { street: childData.address.street, city: childData.address.city, state: childData.address.state, zip: childData.address.zip },
                    socialchannel: socialArray,
                    phone: childData.phone,
                    url: childData.url,
                    photourl: childData.photourl
                };

                officialsArray.push(governmentOfficial);
            }
        })
    });

    // Event Listen for the go button
    $("#goButton").on("click", function (event) {
        googleCivic();
    });

    $("#inputAddress").keydown(function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            googleCivic();
        }
    });

    function googleCivic() {
        $(".tab").empty();
        $(".insert-tab-content-here").empty();
        database.ref("/officials").remove();
        officialsArray = [];

        // Don't refresh the page!
        event.preventDefault();

        $(".tab").removeClass("hideThis");

        var url = "https://www.googleapis.com/civicinfo/v2/representatives";

        var address = $("#inputAddress").val();

        url += '?' + $.param({
            'key': "AIzaSyDKoK-NJwyImI187Wcawi0CW99q6S9Go1I",
            'address': address,
            'levels': "administrativeArea1"
        });


        $.ajax({
            url: url,
            method: 'GET',
        }).done(function (result) {
            // INFO ABOUT GOOGLE CIVIC API
            //
            // THE GOOGLE CIVIC API RETURNS TWO ARRAYS FOR THE AJAX REQUEST:
            // FIRST ARRAY STORES THE GOVERNMENT OFFICIAL'S TITLE AND A SUB-ARRAY CONTAINING
            // INDEX VALUES TO INDICATE WHICH OFFICIAL IN THE 2ND ARRAY CARRIES THIS GOVERNMENT TITLE
            //
            // SECOND ARRAY CONTAINS MORE RELEVANT INFORMATION ABOUT THE GOVERNMENT OFFICIAL, SUCH AS:
            // NAME, OFFICE ADDRESS, PHONE NUMBER, SOCIAL MEDIA HANDLES, PARTY AFFILIATION, RELATED WEBSITE AND USUALLY A PHOTO URL

            // Record the number of officials pulled up by Google Civic API
            var officialsCount = result.officials.length;

            for (var x = 0; x < officialsCount; x++) {
                var governmentOfficial = {
                    name: "",
                    title: "",
                    party: "",
                    address: { street: "", city: "", state: "", zip: "" },
                    socialchannel: [],
                    phone: "",
                    url: "No URL",
                    photourl: "./assets/images/none.png"
                };



                // Setting Official's Name
                governmentOfficial.name = result.officials[x].name;

                // Setting Party Affiiliation
                governmentOfficial.party = result.officials[x].party;

                // Setting Phone Number
                governmentOfficial.phone = result.officials[x].phones[0];


                // Setting Address
                governmentOfficial.address.street = result.officials[x].address[0].line1;
                governmentOfficial.address.city = result.officials[x].address[0].city;
                governmentOfficial.address.state = result.officials[x].address[0].state;
                governmentOfficial.address.zip = result.officials[x].address[0].zip;


                // Conditional check to see if a URL exists in array for that official
                if (result.officials[x].urls)
                    governmentOfficial.url = result.officials[x].urls[0];

                // Inner loop to parse through social media array data
                // first checks if there are any social channel data first before proceeding with the loop
                if (result.officials[x].channels) {
                    for (var y = 0; y < result.officials[x].channels.length; y++) {
                        var socialchannel = { sitetype: "", siteID: "" };

                        socialchannel.sitetype = result.officials[x].channels[y].type;

                        socialchannel.siteID = result.officials[x].channels[y].id;

                        governmentOfficial.socialchannel.push(socialchannel);
                    }
                } else {
                    var socialchannel = { sitetype: "None", siteID: "None" };
                    governmentOfficial.socialchannel.push(socialchannel);
                }

                // Checking if the official has a photo or not
                if (result.officials[x].photoUrl)
                    governmentOfficial.photourl = result.officials[x].photoUrl;

                // Determining the Official's title
                for (var a = 0; a < result.offices.length; a++) {
                    for (var b = 0; b < result.offices[a].officialIndices.length; b++) {
                        if (result.offices[a].officialIndices[b] === x) {
                            governmentOfficial.title = result.offices[a].name;
                        }
                    }
                }

                // Pushing the governmentOfficial object to Firebase Database
                database.ref("/officials").push(governmentOfficial);
            }

            // Calling HTML generation for each politician
            setTimeout(generateHTML(), 3000);

        }).fail(function (err) {
            throw err;
        });
    }

    // Function that receives 2 parameters, the official's name and the div location to append data to
    function polifactsQuery(namesearch, divlocation) {
        var queryName = "";

        // Lower-case all letters and replace all spaces with hypens to meet formatting criteria for politifacts json query
        queryName = namesearch.replace(/\s+/g, '-').toLowerCase();

        $.getJSON("https://www.politifact.com/api/statements/truth-o-meter/people/" + queryName + "/json/?n=3&callback=?",
            function (data) {

                if ((data === undefined) || (data.length == 0)) {
                    $("#" + divlocation).append("No statements found on Politifacts");
                } else {

                    var pfHTML4 = '<table id="mainTable"> ';

                    $.each(data, function (index, item) {
                        index = index + 1;

                        pfHTML4 += '<tr class="clickable-row " data-href="https://www.sitepoint.com/community/t/how-to-center-link-in-middle-of-box/83850/3"> <th> <img class= "head" src="' + item.speaker.canonical_photo + '"></img></th>'

                        pfHTML4 += '<td colspan="2">' + '<a href="' + "https://www.politifact.com" + item.statement_url + '" target="_blank">' + item.ruling_headline + '</a></h3>';
                        pfHTML4 += '<hr class= "break"><p>' + item.statement + '&nbsp;</td>'
                        pfHTML4 += '<th><img class= "ruling" src="' + item.ruling.canonical_ruling_graphic + '" alt="' + item.ruling_headline + '" /> </th></tr>';
                    });

                    // Appends the results to the passed divlocation found in the parameters
                    $("#" + divlocation).append(pfHTML4);
                }
            }
        );
    }

    // Function that dynamically generates the results data from Google Civic ajax call and displays for the user
    function generateHTML() {
        $(".tab").empty();
        $(".insert-tab-content-here").empty();


        for (var x = 0; x < officialsArray.length; x++) {

            // Create the tab buttons for each Politician's name
            var dynamicTabButton = $("<button>");

            var name = officialsArray[x].name;

            name = name.replace(/\s+/g, '-');

            // Dynamically generate tabs for each of the politician found in the query results
            dynamicTabButton.attr({ class: "tablinks", onclick: "openOfficial(event, '" + name + "')" });
            dynamicTabButton.html(officialsArray[x].name);
            $(".tab").append(dynamicTabButton);


            // Create the tab content div for each politician
            var dynamicTabDiv = $("<div>");
            dynamicTabDiv.attr({ id: name, class: "tabcontent" });
            $(".insert-tab-content-here").append(dynamicTabDiv);

            // Setting up skeleton of content div
            var infoDIV = $("<div>").prop("id", "info");
            dynamicTabDiv.append(infoDIV);

            var rowDIV = $("<div>").prop("class", "row major-row");
            infoDIV.append(rowDIV);


            // div content for the Politician's Contact Info
            var colDIV = $("<div>").attr({ class: "col-4" });
            colDIV.html("<h3>Contact Info</h3>");

            rowDIV.append(colDIV);

            colDIV.append("<li><b>Name:</b> <span id='officialName-" + x + "'></span></li>");
            colDIV.append("<li><b>Title:</b> <span id='officialTitle-" + x + "'></span></li>");
            colDIV.append("<li><b>Party:</b> <span id='officialParty-" + x + "'></span></li>");
            colDIV.append("<li><b>Phone:</b> <span id='officialPhone-" + x + "'></span></li>");
            colDIV.append("<li><span id='officialWebURL-" + x + "'></span></li>");
            colDIV.append("<li><span id='officialAddress-" + x + "'></span></li>");

            $("#officialName-" + x).text(officialsArray[x].name);
            $("#officialTitle-" + x).text(officialsArray[x].title);
            $("#officialParty-" + x).text(officialsArray[x].party);
            $("#officialPhone-" + x).text(officialsArray[x].phone);

            var politicianURL = '<a href="' + officialsArray[x].url + '">' + officialsArray[x].url + '</a>';
            $("#officialWebURL-" + x).append(politicianURL);

            $("#officialAddress-" + x).append(officialsArray[x].address.street + "<br>" + officialsArray[x].address.city + ", " + officialsArray[x].address.state + " " + officialsArray[x].address.zip);


            // div to hold the Politician's photo
            var picDIV = $("<div>").attr({ class: "col-4", style: "background-color:white;text-align: center;", id: "officialPhoto-" + x });
            rowDIV.append(picDIV);

            var picIMG = $("<img>").attr({ src: officialsArray[x].photourl, height: "300px" });
            $("#officialPhoto-" + x).append(picIMG);


            // div to hold Politician's social media accounts
            // uses a table to display info
            var dynamicTable = $("<table>").attr("class", "col-4 table table-striped table-dark");
            dynamicTable.append("<thead><tr><th scope='col'>Social Media</th><th scope='col'>ID</th></tr></thead>");

            var tableRowData = "";

            for (var y = 0; y < officialsArray[x].socialchannel.length; y++) {
                var tableData = "<tr><td>" + officialsArray[x].socialchannel[y].sitetype + "</td><td>" + officialsArray[x].socialchannel[y].siteID + "</td><tr>";
                tableRowData += tableData;
            }

            // adds table data for social media channels
            dynamicTable.append("<tbody>" + tableRowData + "</tbody>");
            rowDIV.append(dynamicTable);


            // creates the DIV for the politifacts query
            var politifactsContainerDiv = $("<div>").attr("id", "politifacts-banner");
            infoDIV.append(politifactsContainerDiv);

            var politifactsBannerDIV = $("<div>").attr("class", "well shadow rounded");
            politifactsBannerDIV.html("Politifact Results");
            politifactsContainerDiv.append(politifactsBannerDIV);

            var politifactsResultsRowDIV = $("<div>").attr({ class: "row politfacts-results text-center justify-contenter-center" });
            infoDIV.append(politifactsResultsRowDIV);

            var politfactsResultsColDiv = $("<div>").attr({ id: "politifacts-results-" + x, class: "col-12 w-25 p-1" });
            politifactsResultsRowDIV.append(politfactsResultsColDiv);

            // calls politifacts json query to add relevant politifacts data and truth-o-meter img
            polifactsQuery(name, "politifacts-results-" + x);
        }
    }

});

// W3 school example about tabs
function openOfficial(evt, officialName) {
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(officialName).style.display = "block";
    evt.currentTarget.className += " active";
}