var _file = require("file");
var _fs = require('fs-extra');
var _path = require("path");
var _ = require("underscore");
var AdmZip = require('adm-zip');
var easyzip	        = require("easy-zip").EasyZip;
var archiver = require('archiver');

exports.getNextFileName = function(originalName, dir){

	var ext = _path.extname(originalName);
	var nameWithoutExt = _path.basename(originalName,ext);
	var findNext  = true;
	var files = getDirectoryContents(dir);
	var newFileName = nameWithoutExt + ext;
	var counter = 0;
	do{
		var file = _.findWhere(files, {"name" : newFileName});
		if(file)
		{
			newFileName = nameWithoutExt + "(" + ++counter + ")" + ext;
		}
		else{
			findNext  = false;
		}
	}while(findNext )
	
	return newFileName;
}
//get contents of the  given directory
var nextId = 0;
var getDirectoryContents = function(path){
    var files = [];
	var dir = _fs.readdirSync(path);
    for (var i = 0; i < dir.length; i++) {
      var name = dir[i];
      var target = path + '\\' + name;
      if(endsWith(path, "\\"))
      {
        target = path + '' + name;
      }
      
      try{
        var stats = _fs.statSync(target);
        if (stats.isFile()) {
          files.push({"id":++nextId, "name":name, "path":target, "type":"file"});
          
        } else if (stats.isDirectory()) {
          
          files.push({"id":++nextId, "name":name, "path":target, "type":"dir", "children":[]});
        }
      }
      catch (e)
      {
        files.push({"id":++nextId, "name":name, "path":target, "type":"unknown"});
        console.error(e)
      }
    }
	return files;
}

var endsWith = function (str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var _dirExistsSync = function(d) {
    try { 
        _fs.statSync(d); 
        return true 
    }
    catch (er) { return false }
}
var _createDirIfNotExist = function(path){
    if(!_dirExistsSync(path)){
        _fs.mkdirpSync(path);
    }
}
/***
 * Synchronously check if dir exist and create it recursively as per path.
 */
exports.createDirIfNotExist = function(path){
    _createDirIfNotExist(path);
}

/***
 * Check if dir exist synchronously
 */
exports.dirExistsSync = function(d) {
    return _dirExistsSync(d)
}
exports.admZipFolder = function (folderPath, targetZip, callback) {
    var exist = _dirExistsSync(folderPath);
    if(!exist){
        return callback("source folder does not exist.");
    }
    if(targetZip == null){
        return callback("target zip path required");
    }
    var admZip = new AdmZip();
    var files = getDirectoryContents(folderPath);
    files.forEach(function(f){
        var b = _fs.readFileSync(f.path);
        admZip.addFile(f.path,b);    
    });
    admZip.writeZip(targetZip);
    return callback(null);
}
exports.zipFolder = function (folderPath, targetZip, callback) {
    var exist = _dirExistsSync(folderPath);
    if(!exist){
        return callback("source folder does not exist.");
    }
    if(targetZip == null){
        return callback("target zip path required");
    }
    
    var output = _fs.createWriteStream(targetZip);
    var zip = archiver('zip');
    zip.on('error', function(err) {
        console.log("zip stream error: " + err.message);
        callback(err.Message);
    });
    zip.on('end', function() {
        console.log('Archive wrote %d bytes', zip.pointer());
    });
    output.on('close', function() {
        console.log('done with the zip', targetZip);
    });
    
    
    zip.pipe(output);
    zip.bulk([
        { src: [ '**/*' ], cwd: folderPath, expand: true }
    ]);
    
    zip.finalize();
    return callback(null);
    // zip.finalize(function(err, bytes) {
    //     if(err) {
    //         return callback(err);
    //     }
    //     console.log('done:', bytes);
    //     return callback(null);
    // });
    
    
    
}