var FolderDroplet = function(id, callback, opts) {
	var that = this;
	var opts = opts || {};
	that.id = id;
	that.extension = opts.extension || "eda";
	that.callback = callback;
	that.vsize = opts.vsize || {};
	that.vsize.width = that.vsize.width || 640;
	that.vsize.height = that.vsize.height || 320;
	that.graphs = [];
	that.videoFiles = [];
	that.msg = opts.msg || "<i class='icon-folder-open'></i>  Drop folder here to view";
	//<link href="http://vjs.zencdn.net/c/video-js.css" rel="stylesheet">
	//<script src="http://vjs.zencdn.net/c/video.js"></script>
	$(document).append($("<script>").attr("src","http://vjs.zencdn.net/c/video.js"));
	$(document).append($("<link>").attr("href","http://vjs.zencdn.net/c/video-js.css").attr("rel","stylesheet"));
	
	that.handleError = function(f) {
		$(".dropzone").addClass("error");
		setTimeout(function() {$(".dropzone").removeClass("error");}, 1000);
		
	
	};
	that.handleEDA = function(file, type) {
		console.log("Loading file...");
		if (type == "link") {
			var edaDivId = "EDA" + ($("div.edaGraph").length + 1);
			$("#" + that.id).append($("<div>").attr("id",edaDivId).addClass("edaGraph").addClass("row-fluid"));
			var edaFile = new qLogFile();
			edaFile.progress = "progress-indicator-" + parseInt(Math.random()*10000, 10) ;	
			var loader = new Loader("#" + edaDivId, edaFile.progress);
			edaFile.load(file.link, 
			function() {
				var edaFile = this;
				console.log("Preparing to graph");
				var grapher = new Grapher( document.getElementById(edaDivId) );
				$("#"+edaDivId).find(".loader").remove();
				grapher.plot(edaFile);
				
				that.graphs.push(grapher);
				that.callback(that.graphs);
				
				
			
			}, file.name);
		}
		else {
			var reader = new FileReader();
			
			reader.onload = function (event) {
			  console.log(event.target);
			  var edaDivId = "EDA" + ($("div.edaGraph").length + 1);
			  $("#" + that.id).append($("<div>").attr("id",edaDivId).addClass("edaGraph").addClass("row-fluid"));
			  var edaFile = new qLogFile();
			  edaFile.progress = "progress-indicator-" + parseInt(Math.random()*10000, 10) ;	
			  var loader = new Loader("#" + edaDivId, edaFile.progress);
			  that.fileContents = event.target.result;
			  edaFile.loadText(event.target.result, 
			  function() {
			  	var edaFile = this;
			  	console.log("Preparing to graph");
			  	var grapher = new Grapher( document.getElementById(edaDivId) );
			  	$("#"+edaDivId).find(".loader").remove();
			  	grapher.plot(edaFile);
			  	
			  	that.graphs.push(grapher);
			  	that.callback(that.graphs);
			  	
			  	
			  
			  }
			  , file.name);
			  return false;
			};
			
			reader.readAsBinaryString(file);
		}
	
	};
	
			
	that.setupHandlers = function(vplayer) {
		console.log("Video Width: " + $("video").width());
		$("video").attr("height", 320);
		$("video").attr("width",$("video").attr("height")*16.0/9.0 );
		for (var i = 0; i < that.videoFiles.length; i++) {
			var player = that.videoFiles[i];
			if (that.videoFiles.length == 1) {
				$("#" + player.id).css("margin-left", ($("#" + that.id).width() - $("#" + player.id).width())/2);
			}
			player.addEvent("timeupdate", function(e) {
	
				if($("#" + this.id).attr("data-start-time")){
					var videoStart = new Date(parseInt($("#" + this.id).attr("data-start-time")));
				}
				else {
	
					var startTime = $("#" + this.id).find("video").attr("filename");
					//01-17-2013 09:03:45.mp4
					var date = startTime.split(" ")[0].split("-").map(parseInt);
					var time = startTime.split(" ")[1].split(".m")[0].split("_").map(parseFloat);
					console.log(date + " " + time);
					var videoStart = new Date(date[0], date[1]-1, date[2], time[0], time[1], Math.floor(time[2]),(time[2]-Math.floor(time[2]))*1000.0 );
					$("#" + this.id).attr("data-start-time", videoStart.valueOf());
				}
				
				console.log("Current Time: " + this.currentTime());
				var delta = new TimeDelta(this.currentTime()*1000);
				for (var n = 0; n < that.graphs.length; n++) {
					var g = that.graphs[n];
					try {
						g.updateCursor(videoStart.add(delta));
					}
					catch (error) {
						console.log(error);
					}
					
				}
	
			});
			
		}
		if (that.bookmark) {
			var t = that.bookmark.split("-").map(parseInt);
			var time = t[0]*60*60 + t[1]*60 + t[0];
			for (var i = 0; i < that.videoFiles.length; i++) {
				that.videoFiles[i].currentTime(time);
				console.log("Current time for video: " + that.videoFiles[i].id + " is " + that.videoFiles[i].currentTime());
				that.videoFiles[i].play();
				that.videoFiles[i].pause();
				setTimeout(function() {
				that.videoFiles[i].play();
				that.videoFiles[i].pause();
				
				
				}, 400);
			}
		}
		
		
	
	};
		
	
	that.handleVideo = function(file,type) {
	
		
		console.log("Got video file: " + file.name);
		if(type == "link"){
			var name = file.name;
			var type = "video/" + name.split(".")[name.split(".").length-1];
			var vid = file.link;
		}
		else {
			var metadata = file;
			var vid = window.webkitURL.createObjectURL(file);
			
			var name = metadata.name;
			var type = metadata.type;
		}
			var vidid = "video" + parseInt(Math.random()*1000+"",10);
		//<video id="video" controls="" preload="auto" name="media"><source src="data/1/clip-2013-01-17 09;03;57.m4v" ></video>					
		$("#" +that.id).prepend(
			$("<video>")
				.attr("controls","")
				.attr("class","video-js vjs-default-skin video")
				.attr("filename",name )
				.attr("preload","auto")
				.attr("id",vidid)
				.attr("name","media")
				.attr("src",vid)
				.attr("type",type)
		);
		$("#" +that.id).css("width","auto");
		$("#" +that.id).css("height","auto");
		_V_(vidid).ready(function(){
			var player = this;
			console.log("Video loaded!");
			player.size(that.vsize.width,that.vsize.height);
			if($("#" + this.id).attr("data-start-time")){
				var videoStart = new Date(parseInt($("#" + this.id).attr("data-start-time")));
			}
			else {

				var startTime = $("#" + this.id).find("video").attr("filename");
				//01-17-2013 09:03:45.mp4
				var date = startTime.split(" ")[0].split("-").map(parseInt);
				var time = startTime.split(" ")[1].split(".m")[0].split("_").map(parseFloat);
				console.log(date + " " + time);
				var videoStart = new Date(date[0], date[1]-1, date[2], time[0], time[1], Math.floor(time[2]),(time[2]-Math.floor(time[2]))*1000.0 );
				$("#" + this.id).attr("data-start-time", videoStart.valueOf());
			}
			if (isNaN(videoStart)) {
				//Open datetime picker
				var tpid = this.id + "_timepicker";
				$("#" + this.id).popover({
					type:"auto",
					title:"<strong>Please specify video start time</strong> <a class='close' href='#' onclick=\"$(\'#" + this.id + "\').popover(\'hide\')\" aria-hidden='true'>&times;</a>",
					trigger:"manual",
					html:true,
					content:'<div class="input-group"><span class="input-group-addon"><i class="icon-time"></i></span><input id="' + tpid + '" type="text" class="form-control" placeholder="yyyy-mm-dd HH:MM:SS Z"></div>'
				
				});
				$("#" + this.id).popover("show");
				$("#" + tpid).on("change", function() {
					console.log($(this).attr("value"));
					$("#" + vidid).attr("data-start-time", moment($(this).attr("value").valueOf()));
				
				});
			}
			that.videoFiles.push(player);
		});
	
	
	
	};

	var loadFiles = function (file, isDone, type) {
			  var type = type || "file_entry";
			  if(isDone){
			  	setTimeout(that.setupHandlers, 500	);
			  	that.callback(that.graphs);
			  	return;
			  }
			  console.log(file);
			  var extension = file.name.split(".")[file.name.split(".").length-1].toLowerCase();
			  
			  switch (extension) {
			  	case "eda":
			  		that.handleEDA(file, type);
			  		break;
			  	case "reda":
			  		that.handleEDA(file,type);
			  		break;
			  	case "csv":
			  		that.handleEDA(file,type);
			  		break;
			  	case "tsv":
			  		that.handleEDA(file,type);
			  		break;
			  	case "avi":
			  		that.handleVideo(file,type);
			  		break;
				case "mov":
					that.handleVideo(file,type);
					break;
			  	case "mp4":
			  		that.handleVideo(file,type);
			  		break;
				case "bookmark":
					that.bookmark = file.name.split(".")[0];
					break;

			  	default:
			  		that.handleError(file);
			  }
			  
			  
			  return false;
		};
	
	that.dropzone = new Dropzone(that.id, loadFiles, {"label":that.msg, "allowFolders":true});
	
	if (urlParams("file") != null) {
		var url = urlParams("file");
		var file = {};
		file.link = url;
		file.name = url.split("/").slice(-1)[0];
		loadFiles(file, false, "link");
		loadFiles({},true,"");
		that.dropzone.remove();
	};


}
	


	$(document).on("keydown", function(e) {
		  switch (e.which) {
		    case 39: // right arrow
		    //case 32: // space
		    //case 34:  // page down
		    {
		      if ($("video").length > 0) {
		      	_V_($("video").attr("id")).currentTime(_V_($("video").attr("id")).currentTime()+0.02);
		      }
		      else {
			      for (var i = 0; i < graphers.length; i++) {
			      	var g = graphers[i];
			      	var s = g.datasource.timeForOffset(g.datasource.x(0)).add(1000);
			      	var e = g.datasource.timeForOffset(g.datasource.x(g.w)).add(1000);
			      	g.zoom(s,e,"zoomin");
			      }
		      }
		      break;
		    }
		    case 8: { // delete
		      //step(d3.event.shiftKey ? +1 : -1);
		      break;
		    }
		    case 37: // left arrow
		    case 33: { // page up
				if ($("video").length > 0) {
					console.log("Video time: " + _V_($("video").attr("id")).currentTime());
					_V_($("video").attr("id")).currentTime(_V_($("video").attr("id")).currentTime()-0.02);
				}
				else {
				    for (var i = 0; i < graphers.length; i++) {
				    	var g = graphers[i];
				    	var s = g.datasource.timeForOffset(g.datasource.x(0)).sub(1000);
				    	var e = g.datasource.timeForOffset(g.datasource.x(g.w)).sub(1000);
				    	g.zoom(s,e,"zoomin");
				    }
				}
		      
		      break;
		    }
		    default: return;
		  }
		
	
	});
