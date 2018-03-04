var page = require('webpage').create(),
    system = require('system'),
    address, output, size, file_type;

page.settings.userAgent = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5';

if (system.args.length < 3 || system.args.length > 5) {
  console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat]');
  console.log('  image (png/jpg output) examples: "1920px" entire page, window width 1920px');
  console.log('                                   "800px*600px" window, clipped to 800x600');
  phantom.exit(1);
} else {
  address = system.args[1];
  output = system.args[2];
  file_type = system.args[4];

  console.log("Address: ", address);
  console.log("Output: ", output);
  console.log("File type: ", file_type);

  page.viewportSize = { width: 3508, height: 4961 };

  if (system.args[3].substr(-2) === "px") {
    size = system.args[3].split('*');
    if (size.length === 2) {
      pageWidth = parseInt(size[0], 10);
      pageHeight = parseInt(size[1], 10);
      page.viewportSize = { width: pageWidth, height: pageHeight };
      page.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };
    } else {
      pageWidth = parseInt(system.args[3], 10);
      pageHeight = parseInt(pageWidth * 3/4, 10); // it's as good an assumption as any
      page.viewportSize = { width: pageWidth, height: pageHeight };
    }
    console.log("Viewport size: ", page.viewportSize.width, page.viewportSize.height);
  }

  var renderAndExit = function(){
    console.log(new Date().toISOString(), ": Rendering.");
    page.render(output, {
      format: file_type,
      quality: '100'
    });
    // This releases the page memory
    // Ensures garbage collection
    // Docs: http://phantomjs.org/api/webpage/method/close.html
    page.close();
    phantom.exit();
  }

  page.onConsoleMessage = function(msg, lineNum, sourceId) {
    if(msg == "Page loaded"){
      console.log(new Date().toISOString(), ": The page loaded.");
      renderAndExit();
    }
  };

  var settings = {
    encoding: "utf8"
  }

  page.open(address, settings, function (status) {
    if (status !== 'success') {
      console.log(address, ': Unable to load.');
      phantom.exit();
    }
  });
}
