this.pdfLoad = function(){
	var images = [];
	
	var QueryString = function () {
		var query_string = {};
		var query = window.location.search.substring(1);
		//my url contains hash. my querystring exist in hash property so below code handles getting the query string from hash
		if(query == "" && window.location.hash){
			query = window.location.hash.slice(window.location.hash.indexOf('?')+1);
		}
		
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if (typeof query_string[pair[0]] === "undefined") {
				query_string[pair[0]] = decodeURIComponent(pair[1]);
			} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
				query_string[pair[0]] = arr;
			} else {
				query_string[pair[0]].push(decodeURIComponent(pair[1]));
			}
		} 
			return query_string;
	}();

  var url = decodeURIComponent(QueryString.doc); //'../../web/compressed.tracemonkey-pldi-09.pdf';
  PDFJS.disableWorker = true;
  PDFJS.workerSrc = './scripts/pdf.worker.js';
  
  function generateUID() {
    return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4)
  }
  var pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 1;
	  
      //canvas = document.getElementById('the-canvas'),
      //ctx = canvas.getContext('2d');

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
    pageRendering = true;
    document.getElementById('page_state').textContent = "Rendering..";
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
      var viewport = page.getViewport(scale);
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function () {
      	document.getElementById('page_state').textContent = "Ready";

        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }

		if(onPageRendered){
			onPageRendered(pageNum);
		}
      });
    });

    // Update page counters
    document.getElementById('page_num').textContent = pageNum;
  }
	
  /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  var captureAll = function(){
	images = [];
    var dirName = generateUID();
	for (var i=0; i<pdfDoc.numPages;i++){
		//advancePage(i+1);
		renderPageForCapture(i+1,dirName, postImagesIfFinished);
	 }
	 

  }

  var postImagesIfFinished = function(e,d){
  	console.debug("postImagesIfFinished:  " );
    if(e){
  		images.push({"status":"error", "message":e})
  	}
  	else{
  		images.push(d);
  	}
    //console.debug(JSON.stringify(d));
    //console.log("handler-postImagesIfFinished captured pages : " + images.length);
	var processed = false;
    if(images.length == pdfDoc.numPages){
        processed = true;
        console.debug("all processed");
    }
    //Yeay ... all finished
    //send data urls to api
    var apiUrl = "/api/pdfimages"
    //m4v , mp4, 
    if ($) {
        var imagesToSave = images[images.length-1];
        console.debug("Posting image to save..");
        $.post(apiUrl, {"images":[imagesToSave], "processed" : processed, "folderName":d.dirName},function(result){
           console.log("post images returned...");
            if(result.isError){
                //Call phantom
                if (typeof window.callPhantom === 'function') {
                    var status = window.callPhantom({
                        isError: 'true',
                        message:result.message,
                    });
                }   
                return;
            }
            if(result.isPartial){
                return;
            }
            console.log("All are converted...returning result."  + result.url);
            document.getElementById("conversion_result").textContent=result.url;
            //Call phantom
            if (typeof window.callPhantom === 'function') {
                console.log("returning result.");
                var status = window.callPhantom({
                    secret: 'ghostly',
                    message:result.message,
                    url:result.url,
                });
                return;
            }   
        });  
	}
  }
  var postImagesIfFinishedOld = function(e,d){
  	if(e){
  		images.push({"status":"error", "message":e})
  	}
  	else{
  		images.push(d);
  	}
    console.debug("handler-postImagesIfFinished captured pages : " + images.length);
	if(images.length == pdfDoc.numPages){
		//Yeay ... all finished
		//send data urls to api
	 	var apiUrl = "/api/pdfimages"
	
		if ($) {
            console.debug("handler-postImagesIfFinished posting data urls to api : ");
			$.post(apiUrl, {"images":images},function(result){
				document.getElementById("conversion_result").textContent=result.url;
				//Call phantom
                console.clear();
				if (typeof window.callPhantom === 'function') {
				  var status = window.callPhantom({
					secret: 'ghostly',
					message:result.message,
					url:result.url
				  });
				  //alert(status);
				  // Prints either 'Accepted.' or 'DENIED!'
                  //console.debug("handler-postImagesIfFinished posting data urls to api : ");
				}
			});
		}
	}
  }
	//document.getElementById('capture').addEventListener('click', captureAll);
	
	var  renderPageForCapture = function(num, dirName, callback) {
		var c = document.createElement( "canvas" );
		var c_ctx = c.getContext('2d');
		var pgNo = num;
        var uniqDirName = dirName;
		pdfDoc.getPage(pgNo)
		.then(function(page) {
			var v = page.getViewport(scale);
			c.height = v.height;
			c.width = v.width;

		  // Render PDF page into canvas context
			var renderContext = {
				canvasContext: c_ctx,
				viewport: v
			};
			var renderTask = page.render(renderContext);

			  // Wait for rendering to finish
			renderTask.promise.then(function () {
				try{
					var dataUrl = c.toDataURL("image/png");
					var data = {
						"status":"success",
						"message":"success",
						"dirName":uniqDirName,
						"pageNo":pgNo,
						"imageDataUrl":dataUrl
					};

					if(callback){
						callback(null,data);
					}
				}
				catch(e){
					if(callback){
						callback(e,null);
					}
				}			
		  	});
		});
	}
   
	/**
   * Asynchronously downloads PDF.
   */
   console.debug("handler-opening "+ url);
  	PDFJS.getDocument(url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
	//alert("downloaded");
	console.debug("handler-loaded file...start Capture");
    captureAll();
  });

}