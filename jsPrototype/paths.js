function paths(subpath, pathnum) {


    function getResponse() {

        var userLocation = ["51.4538025", "-2.6092754"];
        var distPreference = "1000";
        var url = 'https://opendata.bristol.gov.uk/api/records/1.0/search/?dataset=leisure-rides-cycling&q=&sort=-dist&facet=route_name&facet=difficulty&facet=max_time&facet=data_source&geofilter.distance=' + userLocation[0] + '%2C' + userLocation[1] + '%2C' + distPreference;


        $.getJSON(url, {

        })
            .done(function (data) {
                // sort of a long dump you will need to sort through
                var results = data.records;

                if (subpath) {
                    var container = document.getElementsByClassName('path-details')[0];
                    var contentString = "";
                    var pathcont = results[pathnum].fields;
                    var routeName = pathcont.route_name;
                    var color = pathcont.colour_code;
                    container.style.backgroundColor = "#" + color;

                    contentString += "<h2>" + routeName + "</h2>";
                    contentString += "<p>" + pathcont.description + "</p>";
                    contentString += "<p>Difficulty: " + pathcont.difficulty + "</p>";
                    contentString += "<p>Length: " +pathcont.distance+"miles</p>";
                    contentString += "<p>Distance from this location: " + pathcont.dist + "metres</p>";
                    contentString += "<p>Duration: " + pathcont.min_time + "-" + pathcont.max_time + "minutes</p>";
                    contentString += '<img src="'+pathcont.edited+'" alt="image of '+routeName+' cycle route">';
                    var mmrID = pathcont.map_my_ride;
                    mmrID = mmrID.split("route-")[2];
                    
                    
                    if(mmrID == null){
                        mmrID = pathcont.map_my_ride;
                        mmrID = mmrID.split("view/")[1];
                    } if(mmrID == null){
                        mmrID = pathcont.map_my_ride;
                        mmrID = mmrID.split("route-")[1];
                    }
                    if(mmrID){
                        contentString += '<iframe id="mapmyfitness_route" src="https://snippets.mapmycdn.com/routes/view/embedded/'+mmrID+'?width=600&height=400&&line_color=E60f0bdb&rgbhex=DB0B0E&distance_markers=1&unit_type=imperial&map_mode=ROADMAP&last_updated=2014-02-06T10:46:47+00:00" height="400px" width="100%" frameborder="0"></iframe>';
                    }
                
                    container.innerHTML = contentString;
                    console.log(pathcont);
                } else {
                    var container = document.getElementById("paths-1");
                    var routenumber = 0;
                    results.forEach(result => {
                        //                    console.log(result.fields);

                        var routeName = result.fields.route_name;

                        // console.log(result.fields.colour_code);

                        var route = document.createElement("DIV");
                        var routeID = routeName.replace(/\s/g, '-');
                        routeID = routeID.toLowerCase();
                        route.id = routeID;
                        container.appendChild(route);
                        var routeContainer = document.getElementById(routeID);
                        routeContainer.classList.add("cycle-route");
                        routeContainer.classList.add("route-" + routenumber);
                        //routeContainer.attributes
                        routeContainer.innerHTML = "<h2>" + routeName + "</h2>" + "<p>" + result.fields.description + "</p>";

                        routenumber++;
                    });
                }

            })
            .fail(function (err) {
                // the error codes are listed on the dev site
                console.log(err);
            });
    };

    getResponse();

}
/*
function searchMarvel() {
    $('.marvel-box .event-list').html(' ');
    marvel();
}

function closeModal(){
    $('.event-modal').remove();
}

function eventSearch(elem) {
    $('.event-modal').remove();

    var PRIV_KEY = "2958cf8845739d1ea90fbbf08da226879b318dce";
    var PUBLIC_KEY = "7819fc3155538eee9ff8e53ec99d33e9";

    function getEventSearch() {

        // you need a new ts every request
        var ts = new Date().getTime();
        var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();

        // the api deals a lot in ids rather than just the strings you want to use
        var name = elem.textContent;
        var url = 'https://gateway.marvel.com:443/v1/public/events';


        $.getJSON(url, {
            ts: ts,
            apikey: PUBLIC_KEY,
            hash: hash,
            name: name,
        })
            .done(function (data) {
                // sort of a long dump you will need to sort through
                var results = data.data.results;
                results.forEach(result => {
                    console.log(result);
                    var title = result.title;
                    var eventThumb = result.thumbnail.path + '.' + result.thumbnail.extension;
                    var eventDescription = result.description;
                    var fullDeets = result.urls[0].url;
                    var EVENTMODAL = '<div class="event-modal"><button onclick="closeModal()" class="no-modal"></button><div class="event-content"><h1>'+title+'</h1><img src="'+ eventThumb+'"><p>'+eventDescription+'</p><a target="_blank" href="'+fullDeets+'">click here for more info</a></div></div>';
$('section.marvel-page').append(EVENTMODAL);
                });
            })
            .fail(function (err) {
                // the error codes are listed on the dev site
                console.log(err);
            });
    };

    getEventSearch();
}
*/
