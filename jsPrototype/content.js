function newContent(selection) {
    //console.log(selection);
    var container = document.createElement("DIV");
    container.id = selection + "-content";
    container.classList.add('container')
    var body = document.getElementById('body');
    body.appendChild(container);
    var prevContainers = document.getElementsByClassName('container');
    for (var j = 0; j < prevContainers.length - 1; j++) {
        prevContainers[j].classList.add('hidden');
    }
    if (prevContainers[prevContainers.length - 1].id == container.id) {
        //console.log(container.id);
        if(selection + '-content' == "paths-content"){
            pathList();
        }
    }
    if (prevContainers[prevContainers.length - 2].id == "paths-content") {
        var pathOptions = document.getElementsByClassName('path');
        for(var i = 0; i < pathOptions.length; i++){
            if(pathOptions[i].id == selection){
                singlePath(i,selection);
            }
        }
        
    }
}

function pathList() {

    function getResponse() {

        var userLocation = ["51.4538025", "-2.6092754"];
        var distPreference = "1000";
        var url = 'https://opendata.bristol.gov.uk/api/records/1.0/search/?dataset=leisure-rides-cycling&q=&sort=-dist&facet=route_name&facet=difficulty&facet=max_time&facet=data_source&geofilter.distance=' + userLocation[0] + '%2C' + userLocation[1] + '%2C' + distPreference;


        $.getJSON(url, {

        })
            .done(function (data) {
                // sort of a long dump you will need to sort through
                var results = data.records;


                var container = document.getElementById("paths-content");
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
                    routeContainer.classList.add("path");
                    routeContainer.classList.add("option");
                    //routeContainer.attributes
                    routeContainer.innerHTML = "<h2>" + routeName + "</h2>" + "<p>" + result.fields.description + "</p>";

                    routenumber++;
                });


            })
            .fail(function (err) {
                // the error codes are listed on the dev site
                console.log(err);
            });
    };

    getResponse();
}

function singlePath(pathnum,id){
    function getResponse() {

        var userLocation = ["51.4538025", "-2.6092754"];
        var distPreference = "1000";
        var url = 'https://opendata.bristol.gov.uk/api/records/1.0/search/?dataset=leisure-rides-cycling&q=&sort=-dist&facet=route_name&facet=difficulty&facet=max_time&facet=data_source&geofilter.distance=' + userLocation[0] + '%2C' + userLocation[1] + '%2C' + distPreference;


        $.getJSON(url, {

        })
            .done(function (data) {
                // sort of a long dump you will need to sort through
                var results = data.records;

                    var container = document.getElementById(id+"-content");
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
                    /*var mmrID = pathcont.map_my_ride;
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
                */
                    container.innerHTML = contentString;
                   // console.log(pathcont);
                

            })
            .fail(function (err) {
                // the error codes are listed on the dev site
                console.log(err);
            });
    };

    getResponse();
}