var lat = 0,
	lon = 0;

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
	}

	getCurrentCoordinates();


	$showMap.on("click", function(e){
		e.preventDefault();
		$flipper.toggleClass('flip');
		console.log("flip");
	});


	function getCurrentCoordinates() {
		if (!navigator.geolocation){
			$geolocationLabel.removeClass("label-warning").addClass("label-danger");
			return;
		}

		function success(position) {
			var latitude  = position.coords.latitude;
			var longitude = position.coords.longitude;

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

