var lat = 0,
	lon = 0,
	streetViewCity = "",
	streetViewLat = 0,
	streetViewLon = 0,
	precision = 4,
	currDirection = {},
	stargates = [],
	useCompass = false,
	customLocation = false,
	inViewThreshold = 5;

var key = "AIzaSyCFg8QIYCz0sblX-amDpcBfNfVMkWcEAuE";
var keyAppend = "&key=" + key;

var staticStreetViewString = "https://maps.googleapis.com/maps/api/streetview?location={lat},{lon}&size=200x200&sensor=false&heading={heading}"+keyAppend;
var staticMapString = "https://maps.googleapis.com/maps/api/staticmap?center={lat},{lon}&size=200x200&sensor=false&markers={lat},{lon}"+keyAppend;

function generateStaticMapString(lat,lon){
	var s = staticMapString;
	s = s.replace(/\{lat\}/g,lat);
	s = s.replace(/\{lon\}/g,lon);
	return s;
}
function generateStaticStreetViewString(lat,lon, heading){
	var s = staticStreetViewString;
	s = s.replace(/\{lat\}/g,lat);
	s = s.replace(/\{lon\}/g,lon);
	s = s.replace(/\{heading\}/g, heading || currDirection.degrees);
	return s;
}

$(document).ready(function() {
	var $lat = $("#lat"),
		$lon = $("#lon"),
		$geolocationLabel = $("#geolocation-label"),
		$myLocation = $("#myLocation"),
		$flipper = $("#flipper"),
		$showMap = $("#show-map"),
		$inViewResults = $("#in-view-results"),
		$useCompass = $("#use-compass"),
		$myModal = $("#myModal"),
		$modalBody = $myModal.find(".modal-body"),
		$streetViewImage = $("#streetViewImage"),
		$navigateHere = $("#navigate-here"),
		$customLocation = $("#custom-location"),
		$numberCitiesInView = $("#number-cities-in-view"),
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

	$navigateHere.on("click", function(e){
		e.preventDefault();
		console.log( "setting current lat to streetview lat" );
		lat = streetViewLat;
		lon = streetViewLon;
		$myLocation.attr("src", generateStaticMapString(lat,lon));
		$lat.html(lat);
		$lon.html(lon);
		$customLocation.addClass("label-warning").html( streetViewCity );
		customLocation = true;
		$myModal.modal("hide");
	});

	function showModal(e){
		var lat = $(this).data('lat');
		var lon = $(this).data('lon');
		var city = $(this).data('city');

		streetViewLat = lat;
		streetViewLon = lon;
		streetViewCity = city;

		$streetViewImage.attr("src",generateStaticStreetViewString(lat,lon) );

		$myModal.modal();
	}


	function loadStargates(res){
		$.getJSON(res, function(data){
			stargates = data.stargates;
		});
	}

	function getStargatesInAzimut(){
		$inViewResults.empty();
		$numberCitiesInView.html("0");
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

			if( azimuth + inViewThreshold > currDirection.degrees && azimuth - inViewThreshold < currDirection.degrees && streetViewCity != name ){
				var $li = $('<li data-city="'+ name +'"  data-lat="'+ slat +'" data-lon="'+ slon +'"><a href="#">Open "'+ name +'" street view</a></li>');
				$inViewResults.append( $li );
				$li.on("click", showModal);

				var curr = parseInt($numberCitiesInView.html());
				if( !curr ){
					curr = 0;
				}
				curr++;
				$numberCitiesInView.html(curr);
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
			if( !customLocation ){
				var latitude  = position.coords.latitude;
				var longitude = position.coords.longitude;

				latitude = parseInt(latitude*Math.pow(10, precision))/Math.pow(10, precision);
				longitude = parseInt(longitude*Math.pow(10, precision))/Math.pow(10, precision);

				lat = latitude;
				lon = longitude;

				$lat.html(latitude);
				$lon.html(longitude);

				$geolocationLabel.removeClass("label-warning label-danger label-success").addClass("label-success");

				$myLocation.attr("src", generateStaticMapString(lat,lon));
			}
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


	var updateStreetViewTimer = 0,
		deviceorientationTimer = 0;

	function checkDeviceOrientation(event){
		clearTimeout(deviceorientationTimer);
		deviceorientationTimer = setTimeout(function(){
			if( event.alpha && useCompass ){
				console.log( 'compass' );
				var compassOrientation = 360 - Math.floor(event.alpha);

				if( compassOrientation != Math.floor(currDirection.degrees) ){
					$azimut.val(compassOrientation).trigger("change");
					knobRelease( compassOrientation );

					clearTimeout(updateStreetViewTimer);
					updateStreetViewTimer = setTimeout(function(){
					},10);
						console.log( 'updating streetViewImage' );
						$streetViewImage.attr("src",generateStaticStreetViewString(streetViewLat,streetViewLon, compassOrientation) );
				}
			}else{
				console.log( 'no compass' );
				$useCompass.removeClass("btn-primary").addClass("btn-default");
				//hide the compass button
			}
		},45);
	}
});

