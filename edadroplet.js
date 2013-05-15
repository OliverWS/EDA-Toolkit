var EDADroplet = function(id, callback, opts) {
	var that = this;
	var opts = opts || {};
	that.id = id;
	that.extension = opts.extension || "eda";
	that.callback = callback;
	that.edaFile = new qLogFile();
	that.edaFile.progress = "progress-indicator" ;
	
	that.draw = function(points) {	
	};
	that.graph = function(dat) {
		console.log("Preparing to graph");
		that.grapher = new Grapher( document.getElementById(that.id) );
		$("#"+that.id).find(".loader").remove();
		that.grapher.plot(that.edaFile);
		
		that.callback(that.edaFile);
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
		      	var bgoriginal = $(".dropzone").css("background-color");
		      	var borderoriginal = $(".dropzone").css("border-color");
		      	$(".dropzone").animate({"background-color":"#f2dede", "border-color":"#b94a48"}, 1000, function() {
		      		$(this).animate({"background-color":bgoriginal, "border-color":borderoriginal}, 1000);
		      	
		      	});
		      }
			  return false;
		}, {"label":"Drop EDA file here to view"});
	


}

var Loader = function(id, progressId) {
	
	$(id).append(
		$("<div>").addClass("loader")
			.append($("<h2>").text("Loading..."))
			.append($("<div>").attr("id", progressId).attr("class","progress progress-striped active")
				.append($("<div>").addClass("bar").attr("style", "width: 0%;"))
			)
	);
	var offset = ($(id).height() - $(id).find(".loader").height()  - $(id).find("h2").height())/2.0;
	$(id).find(".loader").css("margin-top",offset);
};
