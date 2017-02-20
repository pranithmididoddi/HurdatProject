import {
    HTTP
} from 'meteor/http'

Storms = new Mongo.Collection('storms');

if (Meteor.isClient) {

  var markerLocation ;
  var gpointsdata = "";
  var drawgraphs = true;

    
    HTTP.get(Meteor.absoluteUrl("file01.json"), function(err, result) {

        result.data.forEach(function(doc) {
            Storms.insert(doc);
        });

        HTTP.get(Meteor.absoluteUrl("file02.json"), function(err, result) {

            result.data.forEach(function(doc) {
                Storms.insert(doc);
            });

        });

        //   console.log(Storms.find().fetch());




    });




    Session.set('query', 0);
    //When query form is submitted saves values to different sessons
    Template.queryForm.events({
        'submit form': function(event) {
            $("#stormdetails").removeClass("hide");
            $("#polygonDetails").addClass("hide");
            event.preventDefault();
            Session.set('query', 1);
            const name = event.target.name.value;
            const year = event.target.year.value;
            Session.set('queryName', name);
            Session.set('queryYear', year);
            event.target.name.value = "";
            event.target.year.value = "";
        }
    });
    //When storm is selected queries that storm and project GPS coordinates
    //and 64 knot wind radii
    Template.stormDetails.events({
        'click.select': function(event) {
            $("#polygonarea").addClass("hide");
            event.preventDefault();
            console.log("IDD" + this._id);
            var coords = Storms.findOne({
                "_id": this._id
            }, {
                fields: {
                    'latLng': 1,
                    '34NE': 1,
                    '34SE': 1,
                    '34SW': 1,
                    '34NW': 1
                }
            });
            Session.set('queryCoords', coords.latLng);
            Session.set('NE', coords['34NE']);
            Session.set('SE', coords['34SE']);
            Session.set('SW', coords['34SW']);
            Session.set('NW', coords['34NW']);
            $('.select').removeClass('selected');
            $(event.currentTarget).addClass('selected');
            initMap(true);

            //initMap();
        }
    });



    var pointarray = [];



    Template.polygonForm.events({
        'click #generatepolygon': function(e) {

            // document.getElementById("pleasewait").className = "";
            $("#pleasewait").removeClass("hide");
            //console.log(pointarray);
            var stormdata = Storms.find().fetch();



            var dpolygon = new google.maps.Polygon({
                paths: pointarray,
                strokeColor: '#FF0000',
                strokeOpacity: 0.5,
                strokeWeight: 2,
                fillColor: '#FF1A1A',
                fillOpacity: 0.2
            })
            
            dpolygon.setMap(map);




            var pointsdata = "";

            var polygonstorms = new Array();

            for (var count = 0; count < stormdata.length; count++) {


                var latlngarray = stormdata[count].latLng;

                if (polygonstorms.indexOf(stormdata[count].name) > -1) {
                    //console.log("contains");
                    continue;
                }
                //console.log("execiting");


                polygonstorms.push(stormdata[count].name);

                //console.log(latlngarray);

                for (var count1 = 0; count1 < latlngarray.length; count1++) {


                    var lpoint = new google.maps.LatLng(latlngarray[count1][0], latlngarray[count1][1]);
                    // console.log(lpoint);
                    //      console.log();

                    if (google.maps.geometry.poly.isLocationOnEdge(lpoint, dpolygon)) {

                        //  pointsdata  = pointsdata + ":: Name : "+ stormdata[count].name +"<br>";
                        break;
                    }
                    if (google.maps.geometry.poly.containsLocation(lpoint, dpolygon)) {
                        pointsdata = pointsdata + " <p class='select ' name='" + stormdata[count]._id + "'>" + stormdata[count].name + " : " + stormdata[count].id + "</p>";

                        //console.log(stormdata[count].name);
                        break;
                    }
                }
            }

            $("#polygonDetails").html(pointsdata);
            $("#stormdetails").addClass("hide");
            $("#polygonDetails").removeClass("hide");

            // document.getElementById("pleasewait").className = "hide";
            $("#pleasewait").addClass("hide");

            $("p").click(function() {

			     console.log('removing');
			    
 polyLine.setMap(null);
				for(var temp=0;temp<poly.length;temp++) {
				        poly[temp].setMap(null);
				}
			 
                var id = $(this).attr("name");

                $('.select').removeClass('selected');
                $(this).addClass('selected');


                drawPolyGonOnClick(id);
            });
        }
    });
    //Helper that queries either with name or year
    Template.stormDetails.helpers({
        storms: function() {
            var qName = Session.get('queryName');
            var qYear = Session.get('queryYear');

            console.log(qName);
            console.log(qYear);
            var hur = "";
            if (qName != "") {
                hur = Storms.find({
                    "name": {
                        $regex: new RegExp('^' + qName, "gi")
                    }
                }).fetch();
            }
            if (qYear != "") {
                hur = Storms.find({
                    "id": {
                        $regex: new RegExp(qYear + '$', "g")
                    }
                }).fetch();
            }

            return hur;
        },


        didQuery: function() {
            var checkQuery = Session.get('query');
            if (checkQuery > 0) {
                return true;
            }
            return false;
        },
        selectedClass: function() {
            var stormID = this._id;
            var selectedStorm = Session.get("selectedStorm");
            if (stormID == selectedStorm) {
                return "selected";
            }
        }
    });

    Template.stormMap.onRendered(function() {
        Session.set('queryCoords', []);
        initMap(true);
    });




    var map, point;
    var nePoint, sePoint;
    var ne, se, sw, nw;
    var neRadius;
    var poly = [];
	
    var polyLine;

    var polyarea = 0;
    var gcontainslocation = false;
    drawPoly = function(array) {

       // console.log(array);
        poly.push(new google.maps.Polygon({
            path: array,
            strokeColor: '#FF0000',
            strokeOpacity: 0.5,
            strokeWeight: 2,
            fillColor: '#FF1A1A',
            fillOpacity: 0.2
        }));
		if(drawgraphs) {
        poly[poly.length - 1].setMap(map);
        polyarea = polyarea + google.maps.geometry.spherical.computeArea(poly[poly.length - 1].getPath());
		}
		if(markerLocation!=undefined) {
		console.log(markerLocation)
         if (google.maps.geometry.poly.containsLocation(markerLocation, poly[poly.length - 1])) {
             gcontainslocation = true;
          }
		  }
        //console.log(z);

    }



    drawPLine = function(array) {
        polyLine = new google.maps.Polyline({
            path: array,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 1
        });
		
		if(drawgraphs) {
        polyLine.setMap(map);
	    polyarea = polyarea + google.maps.geometry.spherical.computeArea(polyLine.getPath());
       }
		if(markerLocation!=undefined) {
		if (google.maps.geometry.poly.isLocationOnEdge(markerLocation, polyLine)) {
          
		    gcontainslocation = true;
         }
		 }

    }

    initMap = function(initializer) {

        polyarea = 0;
        coords = Session.get('queryCoords');
        ne = Session.get('NE');
        se = Session.get('SE');
        sw = Session.get('SW');
        nw = Session.get('NW');

        if(initializer) {
        var mapOptions = {
            zoom: 4,
            center: new google.maps.LatLng(30.0, -65.0)
        };
        map = new google.maps.Map(document.getElementById('map'),
            mapOptions);
		}

        var array = [];
        var pLine = [];




        for (i = 0; i < coords.length; i++) {

            point = new google.maps.LatLng(coords[i][0], coords[i][1]);
            pLine.push(point);
            if (ne[i] < 0) {
                neRadius = 0;
            } else {
                neRadius = ne[i] * 1852;
            }
            for (j = 0; j <= 90; j = j + 18) {
                nePoint = new google.maps.geometry.spherical.computeOffset(point, neRadius, j);
				if(!nePoint.equals(point)) {
                array.push(nePoint);
				}
            }
            if (se[i] < 0) {
                seRadius = 0;
            } else {
                seRadius = ne[i] * 1852;
            }
            for (k = 90; k <= 180; k = k + 18) {
                sePoint = new google.maps.geometry.spherical.computeOffset(point, seRadius, k);
				if(!sePoint.equals(point)) {

                array.push(sePoint);
				}
            }
            if (sw[i] < 0) {
                swRadius = 0;
            } else {
                swRadius = sw[i] * 1852;
            }
            for (l = 0; l <= 270; l = l + 18) {
                swPoint = new google.maps.geometry.spherical.computeOffset(point, swRadius, l);
				if(!swPoint.equals(point)) {

                array.push(swPoint);
				}
            }
            if (nw[i] < 0) {
                nwRadius = 0;
            } else {
                nwRadius = nw[i] * 1852;
            }
            for (m = 0; m < 360; m = m + 18) {
                nwPoint = new google.maps.geometry.spherical.computeOffset(point, nwRadius, m);
				if(!nwPoint.equals(point)) {

                array.push(nwPoint);
				}
            }
             
            drawPoly(array);
			
            array = [];
        }
        drawPLine(pLine);
        pLine = [];
		
		if(drawgraphs) {

		
		
        //console.log(polyarea);
        polyarea = Math.sqrt(polyarea * 0.000621371192);
        polyarea = polyarea / 4;
        polyarea = parseFloat(polyarea).toFixed(2);

        console.log(polyarea);

        // $('#polygonarea').removeAttr("style");
        //	$( "#polygonarea" ).show();	


        $("#polygonarea").text("" + polyarea + " Sq miles");

        google.maps.event.addListener(map, 'mousemove', function(event) {
            displayCoordinates(event.latLng);
        });

        function displayCoordinates(pnt) {

            var lat = pnt.lat();
            lat = lat.toFixed(4);
            var lng = pnt.lng();
            lng = lng.toFixed(4);
            //   console.log("Latitude: " + lat + "  Longitude: " + lng);

            $("#latitudelong").text("Latitude: " + lat + "  Longitude: " + lng)
        }

        google.maps.event.addListener(map, 'click', function(event) {
            placeMarker(event.latLng);
            displayPointStorms(event.latLng);

        });
		
	
        function displayPointStorms(location) {
		markerLocation = location;
		drawgraphs = false;
            $("#pleasewait").css('visibility', 'visible');

            var pointsdata = "";
            var lat = location.lat();
            var lng = location.lng();
			
			var plocation = new google.maps.LatLng(lat, lng);
            console.log(lat);
            console.log(lng);

            var stormdata = Storms.find().fetch();
            for (var count = 0; count < stormdata.length; count++) {
		   // if(stormdata[count].id == "AL012011"){
            var coords = stormdata[count];
                   Session.set('queryCoords', coords.latLng);
            Session.set('NE', coords['34NE']);
            Session.set('SE', coords['34SE']);
            Session.set('SW', coords['34SW']);
            Session.set('NW', coords['34NW']);
            $('.select').removeClass('selected');
            $(event.currentTarget).addClass('selected');
			
            initMap(false);
			
			if(gcontainslocation){
	               pointsdata = pointsdata + " <p class='select ' name='" + stormdata[count]._id + "'>" + stormdata[count].name + " : " + stormdata[count].id + "</p>";

			}
			gcontainslocation = false;
            }
			$("#polygonDetails").html(pointsdata);

			//console.log(gpointsdata);
            console.log("checked");
            $("#pleasewait").css('visibility', 'hidden');


            $("#polygonDetails").html(pointsdata);
            $("#stormdetails").addClass("hide");

            $("#polygonDetails").removeClass("hide");

            $("p").click(function() {

			 polyLine.setMap(null);
				for(var temp=0;temp<poly.length;temp++) {
				        poly[temp].setMap(null);
				}
			 
                var id = $(this).attr("name");
                $('.select').removeClass('selected');
                $(this).addClass('selected');


                drawPolyGonOnClick(id);
                

            });

            // document.getElementById("pleasewait").className = "hide";
            //$( "#pleasewait" ).addClass("hide");
	    	drawgraphs = true;


        }




        function placeMarker(location) {
            pointarray.push(location);
            var marker = new google.maps.Marker({
                position: location,
                map: map
            });
            console.log(location)
        }

        }

    }

    function drawPolyGonOnClick(id) {
        console.log(id);
        $("#polygonarea").addClass("hide");
        var coords = Storms.findOne({
            "_id": id
        }, {
            fields: {
                'latLng': 1,
                '34NE': 1,
                '34SE': 1,
                '34SW': 1,
                '34NW': 1
            }
        });
        console.log(coords);
        Session.set('queryCoords', coords.latLng);
        Session.set('NE', coords['34NE']);
        Session.set('SE', coords['34SE']);
        Session.set('SW', coords['34SW']);
        Session.set('NW', coords['34NW']);
        $('.select').removeClass('selected');
        console.log("init map");
        initMap(false);
        
     
       
    }



}
if (Meteor.isServer) {




}