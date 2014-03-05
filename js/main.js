var lat = 0,
	lon = 0,
	precision = 4,
	currDirection = 0,
	stargates = [];

$(document).ready(function() {
	var $lat = $("#lat"),
		$lon = $("#lon"),
		$geolocationLabel = $("#geolocation-label"),
		$myLocation = $("#myLocation"),
		$flipper = $("#flipper"),
		$showMap = $("#show-map");

    $(".azimut").knob({
		"min":  0,
		"max": 360,
		"release": knobRelease
	});

	function knobRelease(v){
		console.log( v );
		currDirection = v / (Math.PI*180);
		console.log( currDirection );
		getStargatesInAzimut();
	}

	getCurrentCoordinates();
	loadStargates("stargates.json");


	$showMap.on("click", function(e){
		e.preventDefault();
		$flipper.toggleClass('flip');
		console.log("flip");
	});


	function loadStargates(res){
		$.getJSON(res, function(data){
			stargates = data.stargates;
		});
	}

	function getStargatesInAzimut(){
		var stargatesInAzimut = [];
		for(var i=0,l=stargates.length; i<l; i++){
			var stargate = stargates[i],
				slat = stargate.lat,
				slon = stargate.lon,
				name = stargate.name;

			var deltaLat = slat - lat,
				deltaLon = slon - lon;

			var azimuth = Math.atan2(deltaLon,deltaLat);

			console.log( azimuth, currDirection );
		}
		return stargatesInAzimut
	}


	function getCurrentCoordinates() {
		if (!navigator.geolocation){
			$geolocationLabel.removeClass("label-warning").addClass("label-danger");
			return;
		}

		function success(position) {
			var latitude  = position.coords.latitude;
			var longitude = position.coords.longitude;


			latitude = parseInt(latitude*Math.pow(10, precision))/Math.pow(10, precision);
			longitude = parseInt(longitude*Math.pow(10, precision))/Math.pow(10, precision);

			lat = latitude;
			lon = longitude;

			$lat.html(latitude);
			$lon.html(longitude);

			$geolocationLabel.removeClass("label-warning").addClass("label-success");

			$myLocation.attr("src", "http://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&sensor=false");
		};

		function error() {
			$geolocationLabel.removeClass("label-warning").addClass("label-danger");
		};

		navigator.geolocation.getCurrentPosition(success, error);
	}
});

