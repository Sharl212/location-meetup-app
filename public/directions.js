// let socket = socketIOClient("/");

const socket = io();

socket.on('connect',() =>{
  console.log('connected, i\'m a client-side.');
});

socket.on('notification', (result)=>{
  console.log(result);
  document.getElementById('notify').innerHTML = `${result.text}`
  setInterval(()=>document.getElementById('notify').innerHTML = null, 3000) // notify the user that there's another user is connected right now.
})

socket.on('UsersLength', (result)=>{
  document.getElementById('count').innerHTML = `${result.count}`
})

socket.on('disconnect', ()=>{
  console.log('User disconnected.',Marker2);
  document.getElementById('count').innerHTML = `${result.count-1}`
});

socket.on('userPlace', (result)=>
  {
    console.log(result.place);
    document.getElementById('place_status').innerHTML = `Friend Location<br/>${result.place}`;
  }
);

let map;

// make the functions global so the API link can reach them.
function initMap() {}
function calcRoute() {}


 initMap = ()=> {
  let directionsService = new google.maps.DirectionsService();
  let directionsDisplay = new google.maps.DirectionsRenderer({
    suppressMarkers: true
  });

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

  directionsDisplay.setMap(map);

  const DirectionsRoute = () =>{
    calcRoute(directionsService, directionsDisplay);
  };

  document.getElementById('start').addEventListener('change', DirectionsRoute);
  document.getElementById('end').addEventListener('change', DirectionsRoute);
  infoWindow = new google.maps.InfoWindow;


  
  let Marker2;


  // Try HTML5 geolocation. get the user current location.
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    let pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };


    socket.emit('location', {lng: pos.lng, lat: pos.lat}); // send the {lng,lat} to determine the location of the user for the other user.

    socket.on('userLoc', (loc)=>{ // generate the other user marker using his location. (lat,lng).
      Marker2 = new google.maps.Marker({ // a blue marker placed on the other user provided location.
          position: loc.lng,
          map: map,
          title: 'Friend location.',
          animation: google.maps.Animation.DROP,
          draggable:false,
          icon: "https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png", // a parking place icon.
          id: 'marker2'
        });

    });

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

function CenterControl(controlDiv, map, center) {
      // We set up a variable for this since we're adding event listeners
      // later.
      let control = this;

      let marker = new google.maps.Marker({ // a red marker placed on the user location.
            position: pos,
            map: map,
            title: 'Your current location',
            animation: google.maps.Animation.DROP,
            draggable:true,
            id: 'marker'
      });


      document.getElementById('myLocation').value = marker.position.toString().replace(/[()]/g, ''); // set "My Location" (start point) to the marker's position.
      console.log("your current location ", marker.position)

      socket.on("setMarkerPosition", (position)=>{
        const markerPos = position.lng;
        const lat = markerPos.lat.toString().replace(/[()]/g, '');
        const lng = markerPos.lng.toString().replace(/[()]/g, '');
        
        console.log("Marker position :", markerPos);

          Marker2.setPosition(markerPos);
          document.getElementById('end').value = `${lat},${lng}`; // set the direction to the other user location by {lat,lng}
          DirectionsRoute(); // trigger the Direction Service
      });
      

      // Set the center property upon construction
      control.center_ = center;
      controlDiv.style.clear = 'both';

      // Set CSS for the control border
      let goCenterUI = document.createElement('div');
      goCenterUI.id = 'goCenterUI';
      goCenterUI.title = 'Click to recenter the map';
      controlDiv.appendChild(goCenterUI);

      // Set CSS for the control interior
      let goCenterText = document.createElement('div');
      goCenterText.id = 'goCenterText';
      goCenterText.innerHTML = 'My location';
      goCenterUI.appendChild(goCenterText);

      // Set up the click event listener for 'My location': Set the center of
      // the map
      // to the current center of the control.
      goCenterUI.addEventListener('click', () => {
        let currentCenter = control.getCenter();
        map.setCenter(currentCenter);
        
        marker.setAnimation(google.maps.Animation.BOUNCE); // make the marker BOUNCE when {my location} button is pressed.
        setTimeout(()=> marker.setAnimation(null), 1500); // stop bouncing after 1.5seconds.
      });

      marker.addListener('drag', function(){ // while dragging the marker a popup notify the user dropping will change location.
          infoWindow.setContent('Drop to set a new location');
          infoWindow.open(map,marker);
          console.log('dragging..');
      });

      // change the location based on where the user drag & dropped the marker.
      marker.addListener('dragend', () => {
          infoWindow.close();
          let newCenter = map.getCenter();
          control.setCenter(marker.position); // set the location to the marker's position.

          socket.emit('MarkerPosition', marker.position); // send marker's current position to the server {other user connected}.

          document.getElementById('myLocation').value = marker.position.toString().replace(/[()]/g, ''); // convert the number to string then remove the '()' using regex.
          const Geocoder = new google.maps.Geocoder();

          Geocoder.geocode({'location':marker.position}, (results)=>{
            document.getElementById('myLocationString').innerHTML = `Your Location<br/>${results[0].formatted_address}`;
            console.log(results[0].formatted_address); // formatted address for the user's location {El-Tahrir Square, Qasr Ad Dobarah, Qasr an Nile, Cairo Governorate, Egypt}
            // socket.emit('place', {place: results[0].formatted_address});
          });

          if(document.getElementById("end").value !== "") { // prevent the directions service to run if the "end point" is not provided.
            DirectionsRoute(); // re trigger the directions function when the user changes his location manually.
          }
      });

      // marker BOUNCE when clicked then stop after 1.5seconds.
      marker.addListener('click', ()=>{
        if (marker.getAnimation() !== null){
          marker.setAnimation(null);
        } else{
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(()=> marker.setAnimation(null), 1500);
        }
        // open a popup to notify the user changing location is by dragging the marker.
        infoWindow.setContent('Drag to change your location');
        infoWindow.open(map,marker);
        setTimeout(()=>infoWindow.close(), 1100);
      });

      /**
      * Define a property to hold the center state.
      * @private
      */
      CenterControl.prototype.center_ = null;

      /**
      * Gets the map center.
      * @return {?google.maps.LatLng}
      */
      CenterControl.prototype.getCenter = function() {
        return this.center_;
      };

      /**
      * Sets the map center.
      * @param {?google.maps.LatLng} center
      */
      CenterControl.prototype.setCenter = function(center) {
        this.center_ = center;
      };

    }
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


 calcRoute = (directionsService, directionsDisplay) =>{ // set the directions to the specified B point
  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    travelMode: 'WALKING'
  }, (response, status) => {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
