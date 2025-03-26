let map, service, directionsService, directionsRenderer;
let infowindow;

function initMap(lat, lng) {
    const userLocation = new google.maps.LatLng(lat, lng);

    map = new google.maps.Map(document.getElementById("map"), {
        center: userLocation,
        zoom: 14,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    infowindow = new google.maps.InfoWindow();

    const request = {
        location: userLocation,
        radius: 1000,
        type: ["tourist_attraction"]
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
                createMarker(results[i], userLocation);
            }
        }
    });
}

function createMarker(place, userLocation) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
    });

    google.maps.event.addListener(marker, "click", () => {
        calculateTravelTime(userLocation, place.geometry.location, place);
    });
}

function calculateTravelTime(start, end, place) {
    const selectedMode = document.getElementById("transport-mode").value;

    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[selectedMode]
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);

            const travelTime = result.routes[0].legs[0].duration.text;
            const bestTimeToVisit = getBestTimeToVisit(place.types);
            infowindow.setContent(`
                <strong>${place.name}</strong><br>
                Travel Time: ${travelTime}<br>
                Best Time to Visit: ${bestTimeToVisit}
            `);
            infowindow.open(map);
        }
    });
}

function getBestTimeToVisit(types) {
    if (types.includes("museum")) return "Morning";
    if (types.includes("park")) return "Evening";
    if (types.includes("restaurant")) return "Lunch or Dinner";
    return "Daytime";
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                initMap(position.coords.latitude, position.coords.longitude);
                document.getElementById("info").innerHTML = "Showing nearby places...";
            },
            () => {
                document.getElementById("info").innerHTML = "Location access denied.";
            }
        );
    } else {
        document.getElementById("info").innerHTML = "Geolocation is not supported by this browser.";
    }
}
