var VideoDroplet = function(id, callback, opts) {
	var that = this;
	var opts = opts || {};
	that.id = id;
	that.extension = opts.extension || false;
	that.callback = callback;
	
	that.insertVideo = function(vid, metadata) {
		var name = metadata.name;
		var type = metadata.type;
		//<video id="video" controls="" preload="auto" name="media"><source src="data/1/clip-2013-01-17 09;03;57.m4v" ></video>					
		$("#" +that.id).append(
			$("<video>")
				.attr("controls","")
				.attr("class","video-js vjs-default-skin")
				.attr("filename",name )
				.attr("preload","auto")
				.attr("id","video")
				.attr("name","media")
				.attr("src",vid)
				.attr("type",type)
		);
		$("#" +that.id).css("width","auto");
		$("#" +that.id).css("height","auto");
		_V_("video").ready(function(){
			var player = this;
			player.size(854,480);
			that.callback(player);
		});
	};
	
	that.dropzone = new Dropzone(that.id,
		function (file) {
			 var reader = new FileReader();
			  that.file = file;
			  
			  if(file.name.endsWith("." + that.extension) || (that.extension == false)){
			  	that.insertVideo(window.webkitURL.createObjectURL(file), file);
			  	
		      }
		      else {
		      	var bgoriginal = $("#"+that.id).find(".dropzone").css("background-color");
		      	var borderoriginal = $("#"+that.id).find(".dropzone").css("border-color");
		      	$("#"+that.id).find(".dropzone").animate({"background-color":"#f2dede", "border-color":"#b94a48"}, 1000, function() {
		      		$(this).animate({"background-color":bgoriginal, "border-color":borderoriginal}, 1000);
		      	
		      	});
		      }
			  return false;
		}, {"label":"Drop video file here to view"});
	


}

var Loader = function(id) {
	
	$(id).append(
		$("<div>").addClass("loader")
			.append($("<h2>").text("Loading..."))
			.append($("<div>").attr("id", "progress-indicator").attr("class","progress progress-striped active")
				.append($("<div>").addClass("bar").attr("style", "width: 0%;"))
			)
	);
	var offset = ($(id).height() - $(id).find(".loader").height()  - $(id).find("h2").height())/2.0;
	$(id).find(".loader").css("margin-top",offset);
};
