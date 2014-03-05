var lat = 0,
	lon = 0,
	precision = 4,
	currDirection = {},
	stargates = [],
	useCompass = false,
	inViewThreshold = 5;

$(document).ready(function() {
	var $lat = $("#lat"),
		$lon = $("#lon"),
		$geolocationLabel = $("#geolocation-label"),
		$myLocation = $("#myLocation"),
		$flipper = $("#flipper"),
		$showMap = $("#show-map"),
		$inViewResults = $("#in-view-results"),
		$useCompass = $("#use-compass"),
		$azimut = $(".azimut");

    $azimut.knob({
		"min":  0,
		"max": 360,
		"change": knobRelease,
		"release": knobRelease
	});

	function knobRelease(v){
		currDirection.degrees = v;
		currDirection.radians = v * (Math.PI/180);
		getStargatesInAzimut();
	}

	getCurrentCoordinates();
	loadStargates("stargates.json");


	$showMap.on("click", function(e){
		e.preventDefault();
		$flipper.toggleClass('flip');
		console.log("flip");
	});

	$useCompass.on("click", function(e){
		e.preventDefault();
		useCompass = !useCompass;
		if( $useCompass.hasClass("btn-default") ){
			$useCompass.removeClass("btn-default").addClass("btn-primary");
		}else{
			$useCompass.removeClass("btn-primary").addClass("btn-default");
		}
	});


	function loadStargates(res){
		$.getJSON(res, function(data){
			stargates = data.stargates;
		});
	}

	function getStargatesInAzimut(){
		$inViewResults.empty();
		var stargatesInAzimut = [];
		for(var i=0,l=stargates.length, found = 0; i<l; i++){
			var stargate = stargates[i],
				slat = stargate.lat,
				slon = stargate.lon,
				name = stargate.name;

			var deltaLat = slat - lat,
				deltaLon = slon - lon;

			var wicked = Math.atan2(deltaLon,deltaLat);

			var azimuth = (wicked > 0 ? wicked : (2*Math.PI + wicked)) * 360 / (2*Math.PI);

			if( azimuth + inViewThreshold > currDirection.degrees && azimuth - inViewThreshold < currDirection.degrees ){
				if( found == 0 ){
					found++;
					var $title = $("<h1>Cities in your view</h1>");
					$inViewResults.append( $title );
				}
				var $button = $('<button class="btn btn-default btn-sm" data-toggle="modal" data-target="#myModal">Open "'+ name +'" street view</button>');
				$inViewResults.append( $button );
				//console.log( name, azimuth/**/, currDirection.degrees/**/ );
			}else{
			}
		}
		return stargatesInAzimut
	}


	function getCurrentCoordinates() {
		if (!navigator.geolocation){
			$geolocationLabel.removeClass("label-warning label-danger label-success").addClass("label-danger");
			return;
		}
		navigator.geolocation.watchPosition(success, error, {timeout:3000,maximumAge:0,enableHighAccuracy:true});

		function success(position) {
			var latitude  = position.coords.latitude;
			var longitude = position.coords.longitude;

			latitude = parseInt(latitude*Math.pow(10, precision))/Math.pow(10, precision);
			longitude = parseInt(longitude*Math.pow(10, precision))/Math.pow(10, precision);

			lat = latitude;
			lon = longitude;

			$lat.html(latitude);
			$lon.html(longitude);

			$geolocationLabel.removeClass("label-warning label-danger label-success").addClass("label-success");

			$myLocation.attr("src", "http://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&sensor=false");
		};

		function error() {
			$geolocationLabel.removeClass("label-warning label-danger label-success").addClass("label-danger");
		};	
	}

	if (window.DeviceOrientationEvent) {
		window.addEventListener("deviceorientation", checkDeviceOrientation, true);
		console.log( "yep" );
	}else{
		console.log( "nope" );
	}

	function checkDeviceOrientation(event){
		if( event.alpha && useCompass ){
			console.log( 'compass' );
			var compassOrientation = 360 - Math.floor(event.alpha);

			if( compassOrientation != Math.floor(currDirection.degrees) ){
				$azimut.val(compassOrientation).trigger("change");
				knobRelease( compassOrientation );
			}
		}else{
			console.log( 'no compass' );
			$useCompass.removeClass("btn-primary").addClass("btn-default");
			//hide the compass button
		}
	}

});

