var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

//added
var jsforce = require('jsforce');
var creds = require('./credentials.json');
var socket_io = require( "socket.io" );

var app = express();

// Socket.io
var io = socket_io();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

//added
var conn = new jsforce.Connection({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com'
});

// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected" );
});

conn.login(creds.username, creds.password, function (err, userInfo) {
    if (err) { return console.error(err); }
    // Now you can get the access token and instance URL information.
    // Save them to establish connection next time.
    console.log(conn.accessToken);
    console.log(conn.instanceUrl);
    // logged in user property
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);

    //add subscription
    conn.streaming.topic("/u/notifications/DemoGenericChannel").subscribe(function (message) {
        //console.log('Event Type : ' + message.event.type);
        //console.log('Event Created : ' + message.event.createdDate);
        //console.log('Object Id : ' + message.sobject.Id);
        //console.log('Donation Name : ' + message.sobject.Name);
        console.log(message);
        
        //io.sockets.emit("streamingmsg", { name: message.sobject.Name, amount: message.sobject.na9force__Amount__c });
        io.sockets.emit("streamingmsg", { name: message.payload, amount: '' });
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
