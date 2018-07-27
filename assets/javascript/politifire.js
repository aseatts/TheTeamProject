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
        console.log("****************************************************************************");

        // Instead of using iteration loops, Firebase has a forEach function to traverse through each child element in the database
        snapshot.forEach(function (childSnapshot) {
            // childData will be the actual contents of the child
            // in this case, all the player values
            var childData = childSnapshot.val();

            console.log("publishing childData");
            console.log(childData);

            var officialKey = childSnapshot.key;
            console.log("officialKey:  " + officialKey);

            // condition check to see if the key for this childata is already in the global keyTracker variable
            // if it is not, proceeds with rest of function to add the childdata into global officials array
            if (!(keyTracker.includes(officialKey))) {
                keyTracker.push(officialKey);

                console.log("childSnapshot.name:  " + childData.name);
                console.log("childSnapshot.title:  " + childData.title);
                console.log("childSnapshot.party:  " + childData.party);
                console.log("childSnapshot.phone:  " + childData.phone);
                console.log("childSnapshot.photourl:  " + childData.photourl);
                console.log("childSnapshot.url:  " + childData.url);

                console.log("childSnapshot.address.street:  " + childData.address.street);
                console.log("childSnapshot.address.city:  " + childData.address.city);
                console.log("childSnapshot.address.state:  " + childData.address.state);
                console.log("childSnapshot.address.zip:  " + childData.address.zip);

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

                console.log("testing governmentOfficial array");
                console.log(governmentOfficial);
                console.log("adding governmentOfficial array to global variable array officialsArray");
                officialsArray.push(governmentOfficial);

            }

        })

        console.log("****************************************************************************");
    });


    // "2506+Collins+Blvd%2C+Garland%2C+TX+75044"
    $("#goButton").on("click", function (event) {
        database.ref("/officials").remove();

        // Don't refresh the page!
        event.preventDefault();

        $(".tab").removeClass("hideThis");

        var url = "https://www.googleapis.com/civicinfo/v2/representatives";

        var address = $("#inputAddress").val();

        console.log("Address:  " + address);

        url += '?' + $.param({
            'key': "AIzaSyDKoK-NJwyImI187Wcawi0CW99q6S9Go1I",
            'address': address,
            'levels': "administrativeArea1"
        });

        // var url = "https://www.googleapis.com/civicinfo/v2/representatives?address=2506+Collins+Blvd%2C+Garland%2C+TX+75044&levels=country&levels=administrativeArea1&key=AIzaSyDKoK-NJwyImI187Wcawi0CW99q6S9Go1I"

        console.log("Query URL: " + url);


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

            var governmentOfficialIndices = [];

            console.log(result);

            // Record the number of officials pulled up by Google Civic API
            var officialsCount = result.officials.length;
            console.log("officialsCount:  " + officialsCount);



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

                console.log("================================================================================");
                console.log("Starting loop #" + x);
                console.log("");
                console.log("governmentOfficial array: ");
                console.log(governmentOfficial);


                // Setting Official's Name
                console.log("");
                console.log("official's name:  " + result.officials[x].name);
                governmentOfficial.name = result.officials[x].name;

                // Setting Party Affiiliation
                console.log("");
                console.log("party affiliation:  " + result.officials[x].party);
                governmentOfficial.party = result.officials[x].party;

                // Setting Phone Number
                console.log("");
                console.log("result.officials[" + x + "].phones[0]:  " + result.officials[x].phones[0]);
                governmentOfficial.phone = result.officials[x].phones[0];


                // Setting Address
                console.log("");
                console.log("Parsing through address array from result.officials[" + x + "]");
                console.log("result.officials[0].address[0].line1:  " + result.officials[0].address[0].line1);
                governmentOfficial.address.street = result.officials[x].address[0].line1;

                console.log("result.officials[0].address[0].city:  " + result.officials[0].address[0].city);
                governmentOfficial.address.city = result.officials[x].address[0].city;

                console.log("result.officials[0].address[0].state:  " + result.officials[0].address[0].state);
                governmentOfficial.address.state = result.officials[x].address[0].state;

                console.log("result.officials[0].address[0].zip:  " + result.officials[0].address[0].zip);
                governmentOfficial.address.zip = result.officials[x].address[0].zip;


                // Conditional check to see if a URL exists 
                console.log("is this here:  " + result.officials[x].urls);
                if (result.officials[x].urls)
                    governmentOfficial.url = result.officials[x].urls[0];

                // Inner loop to parse through social media array data
                // first checks if there are any social channel data first before proceeding with the loop
                if (result.officials[x].channels) {
                    console.log("");
                    console.log("Starting inner loop for social media array");
                    console.log("Parsing through channels (social) array from result.officials[" + x + "]");
                    console.log("Length of social array:  " + result.officials[x].channels.length);
                    for (var y = 0; y < result.officials[x].channels.length; y++) {
                        var socialchannel = { sitetype: "", siteID: "" };

                        console.log("Y Loop #" + y);
                        console.log("Setting site type");
                        socialchannel.sitetype = result.officials[x].channels[y].type;
                        console.log("result.officials[" + x + "].channels[" + y + "].type:  " + result.officials[x].channels[y].type);

                        console.log("Setting site id");
                        socialchannel.siteID = result.officials[x].channels[y].id;
                        console.log("result.officials[" + x + "].channels[" + y + "].id:  " + result.officials[x].channels[y].id);

                        governmentOfficial.socialchannel.push(socialchannel);
                    }
                } else {
                    console.log("");
                    console.log("Official doesn't have any social media.");
                    var socialchannel = { sitetype: "None", siteID: "None" };
                    governmentOfficial.socialchannel.push(socialchannel);
                }

                // Checking if the official has a photo or not
                if (result.officials[x].photoUrl)
                    governmentOfficial.photourl = result.officials[x].photoUrl;

                // Determining the Official's title
                for (var a = 0; a < result.offices.length; a++) {
                    for (var b = 0; b < result.offices[a].officialIndices.length; b++) {
                        console.log("result.offices[" + a + "].officialIndices[" + b + "]: " + result.offices[a].officialIndices[b]);
                        if (result.offices[a].officialIndices[b] === x) {
                            governmentOfficial.title = result.offices[a].name;
                            console.log("Government title is:  " + governmentOfficial.title);
                        }
                    }
                }

                // // Pushing the governmentOfficial object into global officialsArray
                // officialsArray.push(governmentOfficial);

                // Pushing the governmentOfficial object to Firebase Database
                database.ref("/officials").push(governmentOfficial);



                console.log(officialsArray);
                console.log("officialsarray[" + x + "]:");
                console.log(officialsArray[x]);

                console.log("================================================================================");
            }

            console.log("");
            console.log("For Loop Complete - finished parsing both arrays for data");
            console.log("");
            console.log("Checking newly created Officials array for data parsed from Ajax Call");
            for (var z = 0; z < officialsArray.length; z++) {
                console.log(officialsArray[z]);
            }

            console.log("=========================");


            console.log("Calling HTML generation for each politician");
            generateHTML();

            // console.log("calling politifactsQuery() function");
            // polifactsQuery();

        }).fail(function (err) {
            throw err;
        });


    });


    function polifactsQuery(namesearch, divlocation) {
        console.log("");
        console.log("politifactsQuery function called");

        console.log(namesearch);
        console.log(divlocation);


        var queryName = "";

        queryName = namesearch.replace(/\s+/g, '-').toLowerCase();
        console.log("Name is now:  " + queryName);

        // Add the name variable for the person you want to run through the politifact API. 
        // 
        // 2.) When the document is ready, load some JSON from our API. JSON is our friend.
        //
        $.getJSON("http://www.politifact.com/api/statements/truth-o-meter/people/" + queryName + "/json/?n=3&callback=?",
            //
            // 3.) Once we have our JSON loaded, let's do a function with it. 
            //
            function (data) {
                //
                // 4.) Let's create a variable to hold our HTML. 
                // Note, we have two widgets on this page. 
                // We shouldn't have two variables that have the same name.
                //

                if ((data === undefined) || (data.length == 0)) {
                    console.log("No data found.");

                    $("#"+divlocation).append("No statements found on Politifacts");
                    console.log("Testing");
                    console.log(data);
                } else {
                    console.log("Data found");
                    console.log(data);
                    var pfHTML4 = '<table id="mainTable"> ';
                    //
                    // 5.) Now, we need to loop through each item in our JSON data.
                    //
                    $.each(data, function (index, item) { // index is the count; item is the data.
                        //
                        // 6.) For each statement, grab the headline and URL.
                        //
                        index = index + 1; // The index starts with 0; add 1 to make it human-friendly
    
    
                        pfHTML4 += '<tr class="clickable-row " data-href="https://www.sitepoint.com/community/t/how-to-center-link-in-middle-of-box/83850/3"> <th> <img class= "head" src="' + item.speaker.canonical_photo + '"></img></th>'
    
                        pfHTML4 += '<td colspan="2">' + '<a href="' + "https://www.politifact.com" + item.statement_url + '" target="_blank">' + item.ruling_headline + '</a></h3>';
                        console.log("politfact url:  " + item.statement_url);
                        pfHTML4 += '<hr class= "break"><p>' + item.statement + '&nbsp;</td>'
                        pfHTML4 += '<th><img class= "ruling" src="' + item.ruling.canonical_ruling_graphic + '" alt="' + item.ruling_headline + '" /> </th></tr>';
                    });
                    //
                    // 7.) Take all of the HTML written to pfHTML2 and append it a DIV on the page.
                    //
    
                    console.log("trying to append html for poltifacts result");
                    $("#" + divlocation).append(pfHTML4);

                }

            }
        );
    }

    function generateHTML() {
        console.log("");
        console.log("generateHTML function called");

        console.log("");

        // console.log("calling globalOfficialsArray");
        // console.log(globalOfficialsArray);

        console.log("calling OfficialsArray");
        console.log(officialsArray);

        // console.log(globalOfficialsArray === officialsArray);

        for (var x = 0; x < officialsArray.length; x++) {

            // Create the tab buttons for each Politician's name
            var dynamicTabButton = $("<button>");

            console.log("official name:  " + officialsArray[x].name);
            var name = officialsArray[x].name;

            name = name.replace(/\s+/g, '-');
            console.log("short name:  " + name);

            dynamicTabButton.attr({ class: "tablinks", onclick: "openOfficial(event, '" + name + "')" });
            dynamicTabButton.html(officialsArray[x].name);

            $(".tab").append(dynamicTabButton);


            // Create the tab content div for each Politician
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


            // $("#officialWebURL-"+ x).text(officialsArray[x].url);


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

            console.log("starting social media for loop");
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

            var politifactsResultsRowDIV = $("<div>").attr({class : "row politfacts-results text-center justify-contenter-center"});
            infoDIV.append(politifactsResultsRowDIV);

            var politfactsResultsColDiv = $("<div>").attr({id: "politifacts-results-" + x, class: "col-12 w-25 p-1"});
            politifactsResultsRowDIV.append(politfactsResultsColDiv);

            // calls politifacts json query to add relevant politifacts data and truth-o-meter img
            console.log("calling the politfactsQuery function here");
            polifactsQuery(name, "politifacts-results-" + x);


        }
    }

});

function openOfficial(evt, officialName) {
    // Declare all variables
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