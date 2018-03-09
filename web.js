require('dotenv').config({silent: true});

// Bug tracking
var debugger = require('./modules/services/logging').getDebugger();

// Custom Modules
var renderer = require('./modules/renderer/renderer');

// Express
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// support parsing of application/json type post data
app.use(bodyParser.json());

app.use(rollbar.errorHandler());

app.get('/', function(req, res){
  res.send('<html><head><title>Screenshots!</title></head><body><h1>Screenshots!</h1><form action="/render" method="POST">URL: <input name="order_id" value="" placeholder="http://"><br>Size:<input name="size" value="" placeholder="1024px or 1024px*1000px"><br><input type="hidden" name="redirect" value="true"><input type="submit" value="Get Screenshot!"></form></body></html>');
});

app.post('/v1/render', function(request, response) {
  if(process.env.SISU_RENDERER_ACCESS_TOKEN){
    if(!request.body.access_token || request.body.access_token != process.env.SISU_RENDERER_ACCESS_TOKEN){
      return response.status(401).json({ 'unauthorized': ' _|_ ' });
    }
  }

  var file_type = request.body.file_type;
  if (storage.FILE_TYPES.indexOf(file_type) === -1){
    return response.status(500).json({
      'error': 'call /render/[file_type] where file_type is either jpg or png'
    });
  }

  if(!request.body.filename) {
    return response.status(400).json({
      'error': 'You need to provide a filename.'
    });
  }

  if(!request.body.aws_directory) {
    return response.status(400).json({
      'error': 'You need to provide an AWS location for the print.'
    });
  }

  if(!request.body.order_id) {
    return response.status(400).json({
      'error': 'You need to provide an order id.'
    });
  }

  // Respond as quickly as possible
  // to say we're handling this request
  response.status(200).json({
    'status': "OK"
  });

  renderer.renderImage(request.body);
});

var port = process.env.PORT || 8000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
