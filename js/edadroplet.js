var EDADroplet = function(id, callback, opts) {
	var that = this;
	var opts = opts || {};
	that.id = id;
	that.extension = opts.extension || "eda";
	that.callback = callback;
	that.edaFile = new qLogFile();
	that.edaFile.progress = "progress-indicator-" + parseInt(Math.random()*10000, 10) ;	
	that.draw = function(points) {	
	};
	that.graph = function(dat) {
		console.log("Preparing to graph");
		that.grapher = new Grapher( document.getElementById(that.id) );
		$("#"+that.id).find(".loader").remove();
		that.grapher.plot(that.edaFile);
		
		that.callback(that.edaFile, that.grapher);
	};
	
	that.dropzone = new Dropzone(that.id,
		function (file) {
			 var reader = new FileReader();
			  
			  console.log(file);
			  if(file.name.endsWith("." + that.extension)){
			  	var loader = new Loader("#" + that.id, that.edaFile.progress);
			  			
			  	console.log("Loading file...");
			  	reader.onload = function (event) {
			  	  console.log(event.target);
			  	  that.fileContents = event.target.result;
			  	  that.edaFile.loadText(event.target.result, that.graph, file.name);
			  	  return false;
			  	};
			  	
			  	reader.readAsBinaryString(file);
		      }
		      else {
		      	$(".dropzone").addClass("error");
		      	setTimeout(function() {$(".dropzone").removeClass("error");}, 1000);
		      }
			  return false;
		}, {"label":"Drop EDA file here to view"});
	


};

