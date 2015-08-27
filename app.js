var map;
var infoWindow = null;

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 37.718229, lng: -121.910362}, // center it on San Ramon, CA
		zoom: 12
	});
	initViewModel();
}

function initViewModel() {
	var viewModel = {
		searchKey: ko.observable(""),
		allLocations: ko.observableArray([
			{
				name: "Stoneridge Shopping Center",
				phone: "(925) 463-2778",
				pos: { lat: 37.695634, lng: -121.928839 }
			},
			{
				name: "In-N-Out Burger",
				phone: "(800) 786-1000",
				pos: { lat: 37.700464, lng: -121.907629 }
			},
			{
				name: "Applebee's",
				phone: "(925) 327-1400",
				pos: { lat: 37.765876, lng: -121.968040 }
			},
			{
				name: "Walmart Neighborhood Market",
				phone: "(925) 364-9207",
				pos: { lat: 37.729505, lng: -121.929129 }
			},
			{
				name: "San Ramon Community Center Library",
				phone: "(925) 973-2850",
				pos: { lat: 37.766812, lng: -121.953763 }
			},
			{
				name: "Gianni's Italian Bistro",
				phone: "(925) 820-6969",
				pos: { lat: 37.784036, lng: -121.980052 }
			},
			{
				name: "Pho Saigon",
				phone: "(925) 829-9361",
				pos: { lat: 37.709402, lng: -121.937141 }
			},
			{
				name: "Lucky Supermarket",
				phone: "(925) 828-1200",
				pos: { lat: 37.727937, lng: -121.944179 }
			},
			{
				name: "Five Guys Burgers and Fries",
				phone: "(925) 248-2050",
				pos: { lat: 37.704195, lng: -121.885062 }
			}
		]),
		markers: ko.observableArray([])
	};

	viewModel.removeMarkers = function(markers) {
		for (i=0; i < markers().length; i++) {
			markers()[i].setMap(null);
		}
		markers([]);
	};

	// using dependentObservable below so searchLocations is updated whenever searchKey is updated
	viewModel.searchedLocations = ko.dependentObservable(function() {
		var found = [];
		var marker;
		var loc;
		viewModel.removeMarkers(viewModel.markers);
		for (var i=0; i < viewModel.allLocations().length; i++) {
			if (viewModel.allLocations()[i].name.search(new RegExp(viewModel.searchKey(),"gi")) > -1) {
				loc = viewModel.allLocations()[i];
				found.push(loc);
				marker = new google.maps.Marker({ // markers are updated
					position: loc.pos,
					map: map,
					title: viewModel.allLocations()[i].name
				});
				marker.addListener('click', function(l) { // using IIFE here
					return function() {
						viewModel.getYelpInfo(l);
					};
				}(loc));
				viewModel.allLocations()[i].marker = marker;
				viewModel.markers().push(marker);
			}
		}
		return found;
	}, viewModel);

	viewModel.showInfoWindow = function(data, loc) {
		if (infoWindow === null) {
			infoWindow = new google.maps.InfoWindow();	
		}
		content = "<div><h3><a target='_blank' href='" + data.businesses[0].url +
			"'>" + data.businesses[0].name + 
			"</a></h3><p>Address: " + data.businesses[0].location.address[0] +
			"</p><p>Phone: " + data.businesses[0].phone +
			"</p><p>Review Count: " + data.businesses[0].review_count.toString() +
			"</p><p><img src='" + data.businesses[0].rating_img_url_large + "'></img></p></div>";
		infoWindow.setContent(content);
		infoWindow.open(map, loc.marker);
	};

	viewModel.animateMarker = function (marker) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(marker) {
			return function() {
				if (marker.getAnimation() !== null) {
					marker.setAnimation(null);
				}
			};
		}(marker), 3000); // animate bounce for 3 seconds
	};

	viewModel.getYelpInfo = function (loc) {
		viewModel.animateMarker(loc.marker);

	    var auth = {
	        consumerKey : "dCXaoGsZ80OoytNjvMvwTQ",
	        consumerSecret : "SXg85WbOjA_kaH0mEUrvK5y9gYQ",
	        accessToken : "u6tBvP-p1CdO3fvFvTBXNohn6AzSvh64",
	        accessTokenSecret : "9wZf4dKZdn8RrWEZoaTnisSpbsA",
	        serviceProvider : {
	            signatureMethod : "HMAC-SHA1"
	        }
	    };
		var accessor = {
			consumerSecret : auth.consumerSecret,
			tokenSecret : auth.accessTokenSecret
		};
	    //var terms = loc.name;
	    //var cll = loc.pos.lat.toString() + "," + loc.pos.lng.toString();

	    parameters = [];
        parameters.push(['phone', loc.phone]);
		parameters.push(['callback', 'cb']);
		parameters.push(['oauth_consumer_key', auth.consumerKey]);
		parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
		parameters.push(['oauth_token', auth.accessToken]);
		parameters.push(['oauth_signature_method', 'HMAC-SHA1']);


		var message = {
			// 'action' : 'http://api.yelp.com/v2/search', // for term search
			'action' : 'http://api.yelp.com/v2/phone_search', // for phone search
			'method' : 'GET',
			'parameters' : parameters
		};

		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);

		var parameterMap = OAuth.getParameterMap(message.parameters);
		console.log(parameterMap);

		$.ajax({
			'url' : message.action,
			'data' : parameterMap,
			'dataType' : 'jsonp',
			'jsonpCallback' : 'cb',
			'success' : function(data, textStats, XMLHttpRequest) {
				viewModel.showInfoWindow(data, loc);
			},
			'error': function(e) {
	    		$('errorStatus').text("Unable to load Yelp data!"); // show error if needed
	    	}
		});
	};


	ko.applyBindings(viewModel); // bind my viewmodel to the html, like magic!
}