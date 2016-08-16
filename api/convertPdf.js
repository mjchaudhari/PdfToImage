var _file = require("file");
var _fs = require("fs");
var _path = require("path");
var _ = require("underscore");

var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs2')
var binPath = phantomjs.path
var url = "http://localhost:8080/pdfviewer?doc=http:%252F%252Flocalhost:8080%252Fapi%252Ffile%252FmyPdf(5).pdf";

/**
 * Convert the given pdf file. Note: The Pdf must be accessible on http and must not be password protected.
 * @param:{request} request object. It needs to run the pdf viewer.
 * @param : {string} fileUrl: Url to the file
 */
exports.convertToPdf = function( pdfViewerUrl, callback){
    //var pdfViewerUrl = req.protocol + '://' + req.get('host')  + "/pdfviewer?doc=" + encodeURI(fileUrl);;
    
  console.log("dir name : " + __dirname);
  console.log("convertPdf.js ... starting child process");
  var phantomScriptFile = path.join(__dirname, 'phantomPdfConvert.js');
  phantomScriptFile = phantomScriptFile.replace(/ /g, '\\ ');
  var childArgs = [
    phantomScriptFile,
    pdfViewerUrl
  ];
  
  childProcess.execFile(binPath, childArgs, {"cwd":"."},function(err, stdout, stderr) {
    
    if(stderr){
      console.log(stderr);
      callback(stderr,null);
      
      return;
    }
    if (stdout) {
      console.log(stdout);
      callback(null, stdout);
      
      return;  
    }
    
    
    if(err){
      console.log(err)
      callback(err,null);
      
      return;
    }
  })
}

exports.testPhantom = function(callback){
  
}