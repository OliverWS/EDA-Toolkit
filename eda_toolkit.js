
var qLogFile =  function () {
	var that = this;
	this.worker = new Worker("js/lib/eda_toolkit.worker.js");
	that.isEDAFile = true;
	that.didAlreadyLoad = false;
	that.filename = "EDA File";
	that.callbacks = {};
	this.handleMessage = function(event) {
		var msg = event.data;
		////console.log("Got message:");
		////console.log(event);
		switch (msg.cmd) {
		  case 'console':
		    //console.log(msg.msg);
		    break;
		  case 'metadata':
		    that.metadataDidLoad(msg.data);
		    break;
		  case 'data':
		    that.dataDidLoad(msg.data);
		    break;
		  case 'scrs':
		    that.callback(msg.data);
		    break;
		  case 'export':
		    that.callback(msg.data);
		    break;
		  case 'filter':
		    that.callback(msg.data);
		    break;
		  
		  case 'progress':
		  	that.updateProgress(100*msg.progress.toFixed(2));
		  	break;
		  
		  case 'downsampled':
		  	console.log("Got downsampled data back");
		  	if (msg.key) {
		  		var dat = msg.data;
		  		console.log(dat);
		  		that.callbacks[msg.key](dat);
		  	}
		  	else {
		  		that.callback(msg.data);
		  		that.callback = null;
		  	}
		  	break;
		  	
		  case undefined:
		    //console.log(msg);
		    break;
		  default:
		  	//console.log(msg);
		};
		if(that.validate() && !that.didAlreadyLoad) {
			that.didAlreadyLoad = true;
			that.didLoad();
		}
	
	};
	
	this.load = function(url, callback) {
		this.url = url;
		this.filename = url.split("/").slice(-1);
		
		this.callback = callback;
		if(this.worker == undefined) {
			this.worker = new Worker("js/eda_toolkit.worker.js");
		}
		this.worker.onmessage = this.handleMessage;
		this.worker.postMessage({cmd:"load",url:this.url});
		//console.log("Loading: " + this.url + "...");
	
	};
	
	this.loadText = function(data, callback, filename) {
		this.callback = callback;
		if(filename != undefined) this.filename = filename;
		if(this.worker == undefined) {
			this.worker = new Worker("js/eda_toolkit.worker.js");
		}
		this.worker.onmessage = this.handleMessage;
		this.worker.postMessage({cmd:"loadText","data":data});
		//console.log("Loading from text...");
	
	};
	
	
	this.updateProgress = function(progress) {
		if(this.progress != undefined) {
			$("#" + this.progress).find("div.progress-bar").css("width", Math.round(progress) + "%");
		}
		else {
			//console.log("Progress: " + Math.round(progress) + "%");
		}
	
	};
	
	this.didLoad = function() {
		//console.log(this);
		if(this.callback != undefined){
			this.callback.call(that);
		}
	};
	
	this.validate = function() {
		return (this.metadata && this.data);
	
	};
	
	this.metadataDidLoad = function(metadata) {
		//console.log("Got metadata");
		//console.log(metadata);
		this.metadata = metadata;
		this.startTime = this.metadata["Start Time"];
		this.sampleRate = this.metadata["Sampling Rate"];
		this.channels = this.metadata["Column Names"];
	
	};
	
	this.dataDidLoad = function(data) {
		//console.log("Got data");
		this.data = data;
		this.events = data.markers;
		this.data.length = this.channels.map(function(c){return that.data[c].length;}).min();
		var ms = (this.data.length/this.sampleRate)*1000;
		//console.log(ms);
		this.endTime = this.startTime.addMilliseconds(ms);
		this.duration = this.endTime.sub(this.startTime);
		//console.log("EDA Length: " + data.EDA.length);
		//console.log("EDA: " + data.EDA[0]);
		
	};
	
	this.setData = function(channel, newData){
		//console.log("Channel is " + channel);
		//console.log("Length of new data is " + newData.length);
		if (newData.length == that.data.length) {
			for (var i = 0; i < that.data.length; i++) {
				that.data[channel][i] = newData[i];
			}
		}
		else {
			//console.log("New data (" + newData.length + ") and original data + (" + that.data.length + ") have different lengths!");
		}
	};
	
	this.getData = function(channel) {
		return that.data[channel];
	
	};
	
	this.filter = function(channel, filterType, callback) {
		that.callback = function(newData) {
			//console.log("In callback, newData.length=" + newData.length);
			that.setData(channel, newData);
			callback(that);
		
		};
		var dat = that.getData(channel);
		//console.log("Sending data of length: " + dat.length);
		that.worker.postMessage({cmd:"filter", data:{"data":dat, "filterType": filterType, "width":that.sampleRate}});
		
	};
	
	this.offsetForTime = function(time) {
		var diff = time.sub(this.startTime);
		if(diff.valueOf() >= 0 && diff.valueOf() < this.duration.valueOf()) {
			return Math.round( diff.valueOf()/(1000.0/this.sampleRate) );
		
		}
		else if (diff.valueOf() >= 0 && diff.valueOf() == this.duration.valueOf()) {
			return this.data.length-1;
		}
		else {
			throw "Illegal Time: " + time +". Time must be between " + this.startTime + " and " + this.endTime;
		}
		
	};
	
	this.timeForOffset = function(offset) {
		var offsetMilliseconds = offset*(1000.0/this.sampleRate);
		if((offsetMilliseconds >= 0) && (offsetMilliseconds < this.duration.valueOf())) {
			return this.startTime.add(TimeDelta(offsetMilliseconds));
		
		}
		else if ((offsetMilliseconds >= 0) && (offsetMilliseconds == this.duration.valueOf())) {
			return this.endTime;
		}
		else {
			throw "Illegal Offset: " + offset +". Offset must be between " + 0 + " and " + this.data.length-1;
		}
		
	};
	this.get = function(callback, opts) {
		var opts = opts || {};
		var start = opts.start || this.timeForOffset(0);
		var end = opts.end || this.timeForOffset(that.data.EDA.length - 1);
		var channels = opts.channels || ["EDA","X","Y","Z"];
		var targetSamples = opts.targetSamples || (this.offsetForTime(end) - this.offsetForTime(start));
		console.log("start: " + start + "("+this.offsetForTime(start)+") \n end: "+ end + "("+this.offsetForTime(end)+") \n targetSamples: " + targetSamples);  
		that.getMultiChannelDataForOffsetRange(channels, this.offsetForTime(start), this.offsetForTime(end), targetSamples, 
		  function(data) {
		    console.log(data);
		    var combinedData = new Array();
		    var timesteps = np.timeRange(start,end,targetSamples);
		    for (var i = 0; i < data[0].length; i++) {
		      var sample = {};
		      for(var c=0; c < channels.length; c++){
		        sample[channels[c]] = data[c][i];
		      }
		      sample["time"] = timesteps[i];
		      combinedData.push(sample);
		    }
		    callback(combinedData);
		  
		  });
		
	  
	};
	
	this.getData = function(channel, targetSamples, callback) {
		var points = that.data[channel];
		if (targetSamples) {
			var token = (Math.random()*10).toString();
			that.callbacks[token] = callback;
			if(targetSamples > 0){
			  this.worker.postMessage({cmd:"downsampleMultiChannel", "data":{"points":data, target:targetSamples,key:token}});
			}
			else {
			  throw "Target Samples Error: target samples must be greater than 0 and less than " + this.data.length +", not " + targetSamples;
			}
		}
		else {
			return points;
		}
	
	};
	
	this.findSCRs = function(callback, start, end) {
		if(start == undefined) start = 0;
		if(end == undefined) end = that.data.EDA.length - 1;
		that.callback = callback;
		that.worker.postMessage({cmd:"scrs", data:{"points":this._getDataForOffsetRange("EDA", start, end), width: that.sampleRate}});
	
	};
	
	this.getDataForOffsetRange = function(channel, start, end, targetSamples, callback) {
		if(channel.toLowerCase() == "acc") {
			that.getMultiChannelDataForOffsetRange(["X","Y","Z"], start, end, targetSamples, callback);
		}
		else {
			var points = this._getDataForOffsetRange(channel, start, end);
			if (callback) {
				var token = (Math.random()*10).toString();
				that.callbacks[token] = callback;
				
				this.worker.postMessage({cmd:"downsample", data:{"points":points, target:targetSamples, key:token}});
			}
			else {
				return points;
			}
		}
	};
	
	that.getMultiChannelDataForOffsetRange = function(channels, start, end, targetSamples, callback) {
		var data = [];
		for (var i = 0; i < channels.length; i++) {
			data.push(this._getDataForOffsetRange(channels[i], start, end));
		}
		if (callback) {
			var token = (Math.random()*10).toString();
			that.callbacks[token] = callback;
			this.worker.postMessage({cmd:"downsampleMultiChannel", "data":{"points":data, target:targetSamples,key:token}});
		}
		else {
			return points;
		}
	};
	
	
	this._getDataForOffsetRange = function(channel, start, end) {
		if( (start >= 0) && (end < this.data.length) && this.data.hasOwnProperty(channel)) {
			return this.data[channel].slice(start, end);
		}
		else {
			return [];
		}
		
	
	};
	
	this.getDataForTimeRange = function(channel, startTime, endTime, targetSamples, callback) {
		var points = this._getDataForTimeRange(channel, startTime, endTime);
		
		if(callback) {
			that.callback = callback;
			this.worker.postMessage({cmd:"downsample", data:{"points":points, target:targetSamples}});
		}
		else {
			return points;
		}
	};
	
	
	
	this._getDataForTimeRange = function(channel, startTime, endTime) {
		var channel = channel || "EDA";
		var start = this.offsetForTime(startTime);
		var stop = this.offsetForTime(endTime);
		
		if(start != NaN && end != NaN) {
			if(this.data.hasOwnProperty(channel)) {
				return this.data[channel].slice(start, stop);
			}
		}
		else {
			return [];
		}
	
	};
	
	this.saveFileAs = function(file) {
		var b = new Blob([file], {type: "text/plain;charset=UTF-8"});
		saveAs(b, that.filename);
	};
	
	this.savePDF = function() {
		
	
	}
	
	this.saveToDropbox = function(dropbox) {
		this.exportToCSV(function(data) {
			dropbox.writeFile(that.filename, data, function() {
				new Notify("File uploaded to Dropbox!");				
			
			});
		});
	
	}
	
	
	this.exportToCSV = function(callback) {
		if (callback) {
			that.callback = callback;
		}
		else {
			that.callback = that.saveFileAs;
		}
		that.worker.postMessage({cmd:"export", data:{data:that.data, metadata:that.metadata, useBlob: false} });	
	}
};
