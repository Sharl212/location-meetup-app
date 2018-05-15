calcRoute = (directionsService, directionsDisplay) =>{ // set the directions to the specified B point
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING'
    }, (response, status) => {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert(`Directions request failed due to ${status}`);
        }
    });
}