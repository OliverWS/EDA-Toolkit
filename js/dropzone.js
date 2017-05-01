var Dropzone = function(el,callback,opts) {
	var that = this;
	var opts = opts || {};
	that.active = true;
	that.allowFolders = opts.allowFolders || true;
	that.width = (opts.width || $("#"+el).width()) || 300;
	that.height = (opts.height || $("#"+el).height()) || that.width;
	that.autoremove = opts.autoremove || true;
	that.callback = callback;
	margin = opts.margin || 10;
	that.styles = new StyleSheet();
	
	
	var drop = that.styles.addStyle(".dropzone");
	drop.addProperty("background-color: #CCC");
	drop.addProperty("width: " + (that.width - 2*margin) + "px");
	drop.addProperty("height: " + (that.height - 2*margin) + "px");
	drop.addProperty("margin: " + margin + "px");
	drop.addProperty("border: " + that.width/100 + "px dashed");
	drop.addProperty("border-color: #333");
	drop.addProperty("border-radius: 50px");
	drop.addProperty("opacity: 0.75");
	
	var stripes = that.styles.addStyle(".stripes");
	stripes.addProperty("background-image: -webkit-linear-gradient(-45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)");
	
	stripes.addProperty("-webkit-background-size: 100px 100px");
		
	var dropzone = document.getElementById(el);
	dropzone.className += " dropzone stripes ";
	if(opts.label){
		var label = $("<h1>").html(opts.label);
		$(dropzone).append(label);
		var h = $(label).height();
		$(label).css("margin-top",((that.height- h)/2)).css("text-align","center").css("vertical-align","middle");
	}
	try {
		if ( !(Dropbox === undefined) ) {
					var randomID = parseInt(Math.random()*10000).toString()
					$(dropzone).find("h1").append('<br/><input type="dropbox-chooser" name="selected-file" id="db-chooser-' + randomID + '" data-link-type="direct" data-multiselect="true" data-extensions=".eda .csv .tsv .avi .webm .mov .mp4 .m4v" />')	
					    document.getElementById("db-chooser-" + randomID).addEventListener("DbxChooserSuccess",
					        function(e) {
					        	console.log(e);
					            var files = e.files;
					            for (var i = 0; i < files.length; i++) {
					            	var f = files[i];
					            	that.callback(f,false,"link");			
					            	
					            }
					            that.callback({},true);
					            if(that.autoremove){
					            	that.remove();
					            }
					            
					        },false);
							
		}	
	}
	catch (e) {
	   // statements to handle any exceptions
	   console.log(e); // pass exception object to error handler
	}
		

	var randomID_B = parseInt(Math.random()*10000).toString()
		$(dropzone).find("h1").after('<br/><input type="file" name="files[]" id="' + randomID_B + '"  multiple />');
			$("#"+randomID_B).css("display","inline-block")
			.css("position","relative")
			.css("left", "50%")
			.css("margin-left", "-45px");

		    document.getElementById(randomID_B).onchange = function(e) {
		        	console.log(e);
    				var files = e.target.files; // FileList object
		            for (var i = 0; i < files.length; i++) {
		            	var f = files[i];
		            	that.callback(f);			
		            	
		            }
		            that.callback({},true);
		            if(that.autoremove){
		            	that.remove();
		            }
		            
		        };

	dropzone.ondragover = function () { if(this.className.indexOf("hover") < 0){this.className += ' hover';} return false; };
	dropzone.ondragend = function () { this.className.replace("hover", ""); return false; };
	dropzone.ondrop = function(e) {	
		e.preventDefault();
		if(that.allowFolders){
			var entry = that.getFirstFile(e);
			if(entry.isDirectory){
				if (document.getElementById("foldername")) {
					document.getElementById("foldername").innerHTML = entry.name ;
				}
				that.traverseFileTree(entry);
				that.callback({},true);			
				if(that.autoremove){
					that.remove();
				}
			}
			else {
				for (var i = e.dataTransfer.files.length - 1; i >= 0; i--) {
					var file = e.dataTransfer.files[i];
					that.callback(file);
				};
				that.callback({},true);			
				if(that.autoremove){
					that.remove();
				}
			}
		}
		else{
			var file = e.dataTransfer.files[0];
		
			that.callback(file);
			if(that.autoremove){
				that.remove();
			}

		}
	};
	that.getFiles = function(e) {
		if(window.safari != undefined){
			return e.dataTransfer.files;
		}
		else{
			return e.dataTransfer.items;
		}
	}
	that.getFirstFile = function(e) {
		if(window.safari != undefined){
			return that.getFiles(e)[0];
		}
		else{
			return that.getFiles(e)[0].webkitGetAsEntry();
		}
	}

	that.traverseFileTree = function(item, path) {
	  path = path || "";
	  if (item.isFile && item.name[0] != ".") {
	    // Get file
	    item.file(function(file) {
	      that.callback(file);
	    });
	  } else if (item.isDirectory && item.name[0] != ".") {
	    // Get folder contents
	    var dirReader = item.createReader();
	    dirReader.readEntries(function(entries) {
	      var ents = [];
	      for (var i=0; i<entries.length; i++) {
	      	ents.push(entries[i]);
	      }
	      ents.sort(function(a,b) {return a.name.localeCompare(b.name);});
	      for (var i = 0; i < ents.length; i++) {
	      	that.traverseFileTree(ents[i], path + item.name + "/");
	      }
	      
	    });
	  }
	}
	
	that.dropzone = dropzone;
	that.remove = function() {
		$(dropzone).find("h1").remove();
		$(dropzone).find("input").remove();
		dropzone.className = dropzone.className.replace("dropzone", "");
		dropzone.className = dropzone.className.replace("stripes", "");
		dropzone.ondragover = null;
		dropzone.ondragend = null;
		dropzone.ondrop = null;
		that.active = false;
	};	
};

var Loader = function(id, progressId) {
	
	$(id).append(
		$("<div>").addClass("loader")
			.append($("<h2>").text("Loading..."))
			.append($("<div>").attr("id", progressId).attr("class","progress progress-striped active")
				.append($("<div>").addClass("progress-bar").attr("role","progressbar").attr("style", "width: 0%;"))
			)
	);
	//  <div class="progress-bar"  role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 45%">
	
	var offset = ($(id).height() - $(id).find(".loader").height()  - $(id).find("h2").height())/2.0;
	$(id).find(".loader").css("margin-top",offset);
};


var StyleSheet = function() {
	var that = this;
	that.css = document.createElement('style');
	that.css.type = 'text/css';
	that.styles = [];
	that.css = document.head.appendChild(that.css);
	that.addStyle = function(selector) {
		var style = {};
		style.selector = selector;
		style.properties = [];
		that.styles.push(style);
		style.addProperty = function(prop) {
			this.properties.push(prop);
			that.update();
		};
		that.update();
		return style;
	};
	
	that.update = function() {
		var content = "\n";
		for(var n=0; n < that.styles.length; n++){
			var style = that.styles[n];
			var styleText = "";
			styleText += style.selector + " {\n";
			for(var x=0; x < style.properties.length; x++){
				var prop = style.properties[x];
				styleText += "    " + prop + ((prop.indexOf(";") > -1) ? "\n" : ";\n");
			}
			styleText += "\n}\n\n";
			content += styleText;
		}
		
		that.css.innerHTML = content;
	
	};
	that.update();
	
	

};