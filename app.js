const express      = require('express'),
      path         = require('path'),
      favicon      = require('serve-favicon'),
      logger       = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser   = require('body-parser'),
      http         = require('http'),

      index = require('./routes/index'),
      users = require('./routes/users'),

      socketIO = require('socket.io'),
      app = express(),
      server = http.createServer(app),
      io = socketIO(server),

      NodeGeocoder = require('node-geocoder'), // fetch user location

      {generateLocation, generateMarkerPosition, generateNotification, generatePlace, generateCount} = require('./public/javascripts/generateFunctions');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

  
const options = {
  provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.API_KEY || 'AIzaSyD2WraBku8-rUkGgRojCLPu68o546DtulY', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);


io.on('connection', (socket) =>{
  console.log('connected , i\'m server-side.');

  socket.on('location',(lng,lat)=>{
    io.emit("userLoc", generateLocation(lng,lat)); // send the user location (lat , lng)
  });

  socket.broadcast.emit('notification', generateNotification('a new user is connected!'));

  io.of('/').clients((error, clients) => {
    if (error) throw error;
    console.log(clients.length); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
    io.emit('UsersLength', generateCount(clients.length)); // number of clients connected.
  });


  socket.on('place', (place) =>{
  });
  
  socket.on('MarkerPosition',(position)=>{
    socket.broadcast.emit("setMarkerPosition", generateLocation(position)); // generate a new marker position for other users except the sender.
      // Using callback
      console.log(position)
      geocoder.reverse({lat:position.lat, lon:position.lng}, function(err, res) {
        console.log(res);
        socket.broadcast.emit('userPlace', generatePlace(res[0].formattedAddress)); //  displays the sender's location to the other user.
      });
  });

});

server.listen(4000, ()=>{
  console.log('server is up on 4000');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
