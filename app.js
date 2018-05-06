var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const http = require('http');

var index = require('./routes/index');
var users = require('./routes/users');

const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const {generateLocation, generateMarkerPosition, generateNotification, generatePlace} = require('./public/main');
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


io.on('connection', (socket) =>{
  console.log('connected , i\'m server-side.');

  socket.on('location',(lng,lat)=>{
    io.emit("userLoc", generateLocation(lng,lat)); // send the user location (lat , lng)
  });

  socket.broadcast.emit('notification', generateNotification('a new user is connected!'));

  socket.on('place', (place) =>{
    io.emit('userPlace', generatePlace(place)); // console log the sender location to both sides.
  });
  
  socket.on('MarkerPosition',(position)=>{
    socket.broadcast.emit("setMarkerPosition", generateLocation(position)); // generate a new marker position for other users except the sender.
  });

});

server.listen(4000, ()=>{
  console.log('server is up on 4000');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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
