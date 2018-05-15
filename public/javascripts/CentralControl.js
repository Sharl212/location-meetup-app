function CenterControl(controlDiv, map, center) {
    // We set up a variable for this since we're adding event listeners
    // later.
    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer({
      suppressMarkers: true
    });
    
    directionsDisplay.setMap(map);

    const DirectionsRoute = () =>{
        calcRoute(directionsService, directionsDisplay);
    };
  
    document.getElementById('start').addEventListener('change', DirectionsRoute);
    document.getElementById('end').addEventListener('change', DirectionsRoute);
        
    let control = this;

    let marker = new google.maps.Marker({ // a red marker placed on the user location.
          position: center, // pos
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
