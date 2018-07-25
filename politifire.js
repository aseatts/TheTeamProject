
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

function execute() {
    var url = "https://www.googleapis.com/civicinfo/v2/representatives";
    url += '?' + $.param({
        'key': "AIzaSyDKoK-NJwyImI187Wcawi0CW99q6S9Go1I",
        'address': "2506+Collins+Blvd%2C+Garland%2C+TX+75044",
        'levels': "administrativeArea1"
    });

    // var url = "https://www.googleapis.com/civicinfo/v2/representatives?address=2506+Collins+Blvd%2C+Garland%2C+TX+75044&levels=country&levels=administrativeArea1&key=AIzaSyDKoK-NJwyImI187Wcawi0CW99q6S9Go1I"

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

        // console.log("=========================");
        // console.log("Parsing through offices array.");
        // console.log(result.offices);
        // console.log("Length of result.offices array:  " + result.offices.length);
        
        // console.log("");

        // console.log("office title:  " + result.offices[0].name);

        // console.log("Length of result.offices[0].officialIndices array:  " + result.offices[0].officialIndices.length);
        // console.log("result.offices[0].officialIndices[0] (used to associate with officials array index):  " + result.offices[0].officialIndices[0]);
        
        // console.log("=========================");

        // console.log("");

        // console.log("=========================");
        // console.log("Parsing through officials array.");
        // console.log(result.officials);
        // console.log("Length of result.officials array:  " + result.officials.length);

        // Record the number of officials pulled up by Google Civic API
        var officialsCount = result.officials.length;
        console.log("officialsCount:  " + officialsCount);



        for (var x = 0; x < officialsCount; x++)
        {
            var governmentOfficial = { name: "", 
            title: "", 
            party: "", 
            address: { street: "", city: "", state: "", zip: "" }, 
            socialchannel: [], 
            phone: "", 
            url: "", 
            photourl: "none.jpg" };

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
            console.log("result.officials["+x+"].phones[0]:  " + result.officials[x].phones[0]);
            governmentOfficial.phone = result.officials[x].phones[0];


            // Setting Address
            console.log("");
            console.log("Parsing through address array from result.officials["+x+"]");
            console.log("result.officials[0].address[0].line1:  " + result.officials[0].address[0].line1);
            governmentOfficial.address.street = result.officials[x].address[0].line1;

            console.log("result.officials[0].address[0].city:  " + result.officials[0].address[0].city);
            governmentOfficial.address.city = result.officials[x].address[0].city;
        
            console.log("result.officials[0].address[0].state:  " + result.officials[0].address[0].state);
            governmentOfficial.address.state = result.officials[x].address[0].state;
            
            console.log("result.officials[0].address[0].zip:  " + result.officials[0].address[0].zip);
            governmentOfficial.address.zip = result.officials[x].address[0].zip;
            governmentOfficial.url = result.officials[x].urls[0];

            // Inner loop to parse through social media array data
            console.log("");
            console.log("Starting inner loop for social media array");
            console.log("Parsing through channels (social) array from result.officials["+x+"]");
            console.log("Length of social array:  " + result.officials[x].channels.length);
            for (var y = 0; y < result.officials[x].channels.length; y++)
            {
                var socialchannel = { sitetype: "", siteID: ""};

                console.log("Y Loop #" + y);
                console.log("Setting site type");
                socialchannel.sitetype = result.officials[x].channels[y].type;
                console.log("result.officials[" + x + "].channels[" + y + "].type:  " + result.officials[x].channels[y].type);

                console.log("Setting site id");
                socialchannel.siteID = result.officials[x].channels[y].id;
                console.log("result.officials[" + x + "].channels["+ y +"].id:  " + result.officials[x].channels[y].id);

                governmentOfficial.socialchannel.push(socialchannel);
            }

            // Checking if the official has a photo or not
            if (result.officials[x].photoUrl)
                governmentOfficial.photourl = result.officials[x].photoUrl;

            // Determining the Official's title
            for (var a = 0; a < result.offices.length; a++)
            {
                for (var b = 0; b < result.offices[a].officialIndices.length; b++)
                {
                    console.log("result.offices["+a+"].officialIndices["+b+"]: " + result.offices[a].officialIndices[b]);
                    if (result.offices[a].officialIndices[b] === x)
                    {
                        governmentOfficial.title = result.offices[a].name;
                        console.log("Government title is:  " + governmentOfficial.title);
                    }
                }
            }

            // Pushing the governmentOfficial object into global officialsArray
            officialsArray.push(governmentOfficial);

            // Pushing the governmentOfficial object to Firebase Database
            database.ref("/officials").push({governmentOfficial});
            console.log(officialsArray);
            console.log("officialsarray[" + x + "]:");
            console.log(officialsArray[x]);

            console.log("================================================================================");
        }
        
        console.log("");
        console.log("For Loop Complete - finished parsing both arrays for data");
        console.log("");
        console.log("Checking newly created Officials array for data parsed from Ajax Call");
        for (var z = 0; z < officialsArray.length; z++)
        {
            console.log(officialsArray[z]);
        }

        // console.log("");
        // console.log("");
        // console.log("showing array of phones found for an official:");
        // console.log(result.officials[0].phones);
        // console.log("Length of result.officials[0].phones array:  " + result.officials[0].phones.length);


        // console.log("");


        // console.log(result.officials[0].address);
        // console.log("Length of result.officials[0].address array:  " + result.officials[0].address.length);
        // console.log("result.officials[0].address[0].line1:  " + result.officials[0].address[0].line1);
        // console.log("result.officials[0].address[0].city:  " + result.officials[0].address[0].city);
        // console.log("result.officials[0].address[0].state:  " + result.officials[0].address[0].state);
        // console.log("result.officials[0].address[0].zip:  " + result.officials[0].address[0].zip);

        // console.log("");

        // console.log("showing array of urls found for an official:");
        // console.log(result.officials[0].urls);
        // console.log("Length of result.officials[0].urls array:  " + result.officials[0].urls.length);
        // console.log("result.officials[0].urls[0]:  " + result.officials[0].urls[0]);


        // console.log(result.officials[0].channels);
        // console.log("Length of result.officials[0].channels array:  " + result.officials[0].channels.length);
        // console.log("result.officials[0].channels[0].type:  " + result.officials[0].channels[0].type);
        // console.log("result.officials[0].channels[0].id:  " + result.officials[0].channels[0].id);
        // console.log("result.officials[0].channels[1].type:  " + result.officials[0].channels[1].type);
        // console.log("result.officials[0].channels[1].id:  " + result.officials[0].channels[1].id);


        // console.log("result.officials[0].photoUrl:  " + result.officials[0].photoUrl);
        // console.log("Does photoURL[0] equal to null?  " + (result.officials[0].photoUrl));
        // console.log("Does photoURL[1] equal to null?  " + (result.officials[1].photoUrl));
        // console.log("Does photoURL[2] equal to null?  " + (result.officials[2].photoUrl));
        // console.log("Does photoURL[3] equal to null?  " + (result.officials[3].photoUrl));

        console.log("=========================");
    }).fail(function (err) {
        throw err;
    });
}