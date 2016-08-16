
var system = require('system');
var page = require('webpage').create();
var url = "";

var args = system.args;
if (args.length === 1) {
  console.log(JSON.stringify({"message" : 'require url to the pdf viewer page', }));
} 
else {
  args.forEach(function(arg, i) {
  });
  url = args[1];
}

page.open(url, function(status) {
 if (status !== 'success') {
    console.log('Unable to access network' + status);
    phantom.exit();
  } 
});
page.onConsoleMessage = function(msg, lineNum, sourceId) {
  //console.debug('PHANTOM: ' + msg );
};
page.onResourceError = function(resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
    //console.debug("failure reason: " + page.reason );
    console.log(JSON.stringify(resourceError));
    phantom.exit();
};
/**
 * Event handler for the Phantom.callback which is raised from PDF viewer 
 * page after all images are captured or if there is an error 
 * To PAss this output to the caller of the method, we need to write data to console.
 */
page.onCallback = function(data) {
  if (data && data.secret && (data.secret === 'ghostly')) {
    console.clear();
    
    console.log(JSON.stringify(data));
    phantom.exit();
  }
  if (data && data.isError) {
    console.clear();
    console.log(JSON.stringify(data));
    phantom.exit();
  }
};
