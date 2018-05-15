let map;
// make the functions global so the API link can reach them.
function initMap() {}

 initMap = ()=> {
    let Marker2;
    infoWindow = new google.maps.InfoWindow;
    
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 20,
      mapTypeControl: true,
      mapTypeId: google.maps.MapTypeId.HYBRID, // once the page loaded the user see a {satellite} view of his location.
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DEFAULT,
        mapTypeIds: ['satellite','roadmap','hybrid']
      }
    });

  // Try HTML5 geolocation. get the user current location.
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    let pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    socket.emit('location', {lng: pos.lng, lat: pos.lat}); // send the {lng,lat} to determine the location of the user for the other user.

    infoWindow.setPosition(pos);
    map.setCenter(pos);

    let centerControlDiv = document.createElement('div'); // creating {Center Map} button
    let centerControl = new CenterControl(centerControlDiv, map, pos);
     /* passing the {div} element we just created.
      and the {map} variable that contain the actual map.
      with the {pos} variable that contain the user location
      {lat,lng}.
    */
    centerControlDiv.index = 1;  // positioning the {My location} button
    centerControlDiv.style['padding-top'] = '10px'; // styling the {My location} button
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv); // positioned into RIGHT-CENTER

  }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
  });
} else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

  function handleLocationError(browserHasGeolocation, infoWindow, pos){
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(map);
  }
