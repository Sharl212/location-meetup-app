const socket = io();

  socket.on('connect',() =>{
    console.log('connected, i\'m a client-side.');
  });

  socket.on('notification', (result)=>{ // notify the user that a friend is connected.
    console.log(result);
    document.getElementById('notify').innerHTML = `${result.text}`
    setInterval(()=>document.getElementById('notify').innerHTML = null, 3000) // notify the user that there's another user is connected right now.
  })

  socket.on('UsersLength', (result)=>{ // count how many people are connected at the moment.
    document.getElementById('count').innerHTML = `${result.count-1} is connected`;
  })

  socket.on('disconnect', ()=>{
    console.log('User disconnected.',Marker2);
    document.getElementById('count').innerHTML = `${result.count-1}`
  });

  socket.on('userPlace', (result)=>{ // friend specific location
      document.getElementById('place_status').innerHTML = `Friend Location<br/>${result.place}`;    
      console.log(result.place);
    }
  );

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
 