var express 		= require("express");
var bodyParser		= require("body-parser");
var _fs 			= require("fs");
var _path 			= require("path");
var _g 				= require("./config.js");
var childProcess	= require("child_process");
var shortid	        = require("shortid");
var easyzip	        = require("easy-zip").EasyZip;
var mime            = require('mime-types')
var converter       = require('./api/convertPdf.js');
var fileCtrl       = require('./api/fileController.js');


/** multer is used to save the uploaded file */
var multer  = require('multer')
var upload = multer({ dest: _g.config.workingFolder})
/** Permissible loading a single file, 
    the value of the attribute "name" in the form of "recfile". **/
//var type = upload.single('file');

var fileController 	= require("./api/fileController");

var port 	= 8080;//:process.env.PORT;
var router 	= express.Router();
var app 	= express();
var path 	= __dirname;

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

app.use(router);
app.use(express.static(__dirname + "/client"));

// Routs------------------------------------------------------------------------------

router.get("/", function (req, res) {
	res.send({"message":"You are running node server"});
});

router.get("/index", function (req, res) {
	//sconsole.log(req);
	res.sendFile(__dirname + "/client/index.html");
});

router.get("/pdfviewer", function (req, res) {
	//sconsole.log(req);
	res.sendFile(__dirname + "/client/views/pdfviewer.html");
});
/**
 * Save base 64 images to disk and return the zip
 * @param {[object]}:data
 * @param {string}:data.dirName of the pdf. Create the directory for this pdf
 * @param {string}:data.pageNo
 * @param {string}:data.imageDataUrl
 */
router.post("/api/pdfimages", function(req, res){
	if(req.body.images == null){
		res.send({"message":"No image data recieved"});
		return;
	}
	
	var tempDirName = req.body.images[0].dirName // shortid.generate();
	var dir =  _path.join(_g.config.workingFolder, tempDirName);
	if (!_fs.existsSync(dir)){
		_fs.mkdirSync(dir);
	}

	req.body.images.forEach(function(d) {
		
		var base64Data = d.imageDataUrl.replace(/^data:image\/png;base64,/, "");
		var filePath =  _path.join(dir, d.pageNo + '.png');
		_fs.writeFile(filePath, base64Data, 'base64', function(err) {
			console.log("fileSaved at "  + filePath);
		});	
	});
    if(req.body.processed == true || req.body.processed == "true"){
        var zipFilePath = _path.join(_g.config.workingFolder, tempDirName + '.zip')
        fileCtrl.zipFolder(dir,zipFilePath,function(err){
            if(err){
                res.json({"isError":true,message:"failed to zip the images."});
                return;
            }
            var fileUrl = req.protocol + '://' + req.get('host')  + "/api/file/" + tempDirName + '.zip'
            res.json({"isError":false,"message":"zip created.","url":fileUrl});
        });
    }
    else{
        res.send({"isError":false,"message":"image saved","isPartial":true});
    }
	
});
/**
 * convert the posted file and return the path of the result files.
 */
router.get("/api/file/:fileName", function(req, res){
	if(req.params.fileName == null){
		res.json({"message":"error", "data":"file name required"});
		return;
	}
	var fileName = req.params.fileName;
	var file = _path.join(_g.config.workingFolder,fileName);
    var contentType = mime.lookup(file) || 'application/octet-stream';
	//res.sendFile(file);
    _fs.readFile(file, function(error, content) {
        console.log("call back readFile:" + fileName);
        if (error) {
            res.writeHead(500);
            res.end();
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
	
});
/**
 * convert the posted file and return the path of the result files.
 */
router.post("/api/upload",upload.single("file"), function(req, res){
	
	var file = req.file;
	console.log(file.fieldname + ' uploaded to  ' + file.path);
	var nextFileName = fileController.getNextFileName(file.originalname, _g.config.workingFolder);
	var newFilePath = _g.config.workingFolder + "\\" + nextFileName;
	var fileUrl = req.protocol + '://' + req.get('host')  + "/api/file/" + nextFileName
	_fs.rename(file.path, newFilePath, function(err, d){
		
		var viewerUrl = req.protocol + '://' + req.get('host')  + "/pdfviewer?doc=" + encodeURI(fileUrl);
		
		converter.convertToPdf(viewerUrl, function(err, result){
			if(err){
                if(_g.isValidJSON(err)){
                    res.json(JSON.parse(err));    
                }
				else {
                    res.json({"result":err})
                }
				return;
			}
            
            if(_g.isValidJSON(result)){
                    res.json(JSON.parse(result));    
                }
				else {
                    res.json({"result":result})
                }
				return;
			
		});
		
	})
});

/**
 * convert the posted file and return the path of the result files.
 */
router.post("/api/convert", function(req, res){

	//var viewerUrl = req.protocol + '://' + req.get('host')  + "/index#/pdfviewer?doc=" + encodeURI(fileUrl);
	converter.convertToPdf("", function(err, result){
		if(err){
			res.json({"result":"Error", "message":err});
			return;
		}
		res.json({"result":"Error", "message":result});	
	});
});


app.listen(port, "0.0.0.0");

console.log("Server startd at:" + port)