require('dotenv').config({silent: true});

// Express
var express = require('express');
var bodyParser = require('body-parser');

var childProcess = require('child_process');
var fs = require('fs');
var rimraf = require('rimraf');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// support parsing of application/json type post data
app.use(bodyParser.json());


app.post('/v1/render', function(request, response) {
  // Respond as quickly as possible
  // to say we're handling this request
  response.status(200).json({
    'status': "OK"
  });

  var file_type = request.body.file_type;

  var filename = request.body.filename + "." + file_type;
  var parent_dir = "./pics/" + request.body.aws_directory.split("/")[0];
  var filenameFull = "./pics/" + request.body.aws_directory + "/" + filename;
  // console.log(new Date().toISOString(), ": Filename -> ", filenameFull);
  var canvas_url = process.env.SISU_API_URL + "/render/prints/" + request.body.order_id + "?render_token=" + process.env.SISU_RENDER_TOKEN;
  var orderObject = {
    id: request.body.order_id,
    filename: filename,
    filenameFull: filenameFull,
    awsDirectory: request.body.aws_directory,
    redirect: request.body.redirect
  };
  var childArgs = [
    'rasterize.js',
    canvas_url,
    filenameFull,
    request.body.size? request.body.size : '',
    request.body.file_type? request.body.file_type : 'jpg',
    orderObject
  ];

  var uploadToS3 = function(order){
    fs.readFile(order.filenameFull, function(err, temp_png_data){
      rimraf(parent_dir, function(){
        console.log("Deleted files!");
      });
      console.log("Order ID: ", order.id, order.filenameFull);
    });
  }

  //grap the screen
  var phantomProcess = childProcess.spawn('phantomjs', childArgs, {
    stdio: 'inherit'
  });

  phantomProcess.on('exit', function(code) {
    console.log(new Date().toISOString(), ': Phantom process exited with code ' + code.toString())
    uploadToS3(childArgs[5]);
  });
});

var port = process.env.PORT || 8000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
