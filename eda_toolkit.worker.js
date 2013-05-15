//importScripts("jquery.js");
importScripts("numjs.js");
importScripts("signals.js");
//importScripts("https://raw.github.com/eligrey/BlobBuilder.js/master/BlobBuilder.min.js");
var separator = "---------------------------------------------------------";

var console = {};
console.log = function(msg) {
	self.postMessage({cmd:"console","msg":msg});

};
self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'load':
      self.get(data.url, self.parse);
      break;
    
    case 'loadText':
      self.parse(data.data);
      break;
    
    case 'downsample':
    	self.downsample(data.data);
    	break;
    case 'downsampleMultiChannel':
    	self.downsampleMultiChannel(data.data);
    	break;

    case 'scrs':
    	self.SCRs(data.data);
    	break;
    
    case 'export':
    	self.export(data.data);
    	break;
    
    case 'filter':
    	self.filter(data.data);
    	break;
    
    
    case 'stop':
      self.postMessage('WORKER STOPPED: ' + data.msg + '. (buttons will no longer work)');
      self.close(); // Terminates the worker.
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);

self.parse = function(text) {
	var headerPlusBody = text.toString().split(separator);
	var headers = headerPlusBody[0].split("\n");
	var parsedHeaders = self.parseHeaders(headers);	
	if(parsedHeaders["File Version"] < 1.5) {
		self.parseTextData(headerPlusBody[1], ["Z","Y","X","Batt","Temperature","EDA"]);
	}
	else {
		self.parseBinaryData(headerPlusBody[1], ["Z","Y","X","Batt","Temperature","EDA"]);
	}
}

self.parseHeaders = function(metadata) {
	var headers = {};
	for(var n=0; n < metadata.length; n++) {
		var row = metadata[n];
		if(row.indexOf(": ") > -1) {
			var property = row.split(": ")[0];
			var value = row.split(": ")[1];
			if(value != undefined && value != "") {
				headers[property] = value.autoconvert();
			}
		}
	
	}
	self.metadata = metadata;
	self.postMessage({cmd:"metadata", data:headers});
	return headers;
}

self.SCRs = function(opts) {
	//var data = signals.sanitize(opts.points,[0.0,0.0],[NaN,"-"]);
	var width = opts.width || 8;
	
	var crossings = signals.peaks(data, width);
	console.log("Crossings:");
	console.log(crossings);
	self.postMessage({cmd:"scrs", data:crossings[0]});

};


self.filter = function(opts) {
	var data = opts.data;
	var width = opts.width || self.metadata["Sampling Rate"];
	var filteredData;
	console.log("Self.Filter: Got data of " + data.length);
	switch (opts.filterType) {
		case "median":
			filteredData = signals.medianFilter(data, width);
			break;
		case "min":
			filteredData = signals.minFilter(data, width);
			break;
		case "max":
			filteredData = signals.maxFilter(data, width);
			break;
		case "gaussian":
			filteredData = signals.gaussianFilter(data, width);
			break;
		default:
			filteredData = signals.gaussianFilter(data, width);
			break;
		
	}
	
	self.postMessage({cmd:"filter", data: filteredData});

};


self.downsample = function(opts) {
	console.log("In downsample");
	var data = signals.sanitize(opts.points,[0.0,0.0],[NaN,"-"]);
	var target = opts.target;
	
	//start with naive downsampling;
	var downsampled = [];
	var inc = Math.floor(data.length/target);
	console.log("Data length: " + data.length + " Target: " + target + " so increment is " + inc);
	if(data.length <= target){
		downsampled = data;
	}
	else {
		//var data = signals.medianFilter(data,inc);
		var data = gaussianFilter(data, inc, 20);
		
		for(var n=0; n < data.length; n+= inc) {
			downsampled.push(data[n]);
		
		}
		
	}
	console.log("Downsampled to : " + downsampled.length);
	self.postMessage({cmd:"downsampled", data:downsampled,"key":opts.key});
	//console.log(downsampled);
};

self.downsampleMultiChannel = function(opts) {
	console.log("In downsampleMultiChannel");
	var target = opts.target;
	var downsampledData = [];
	for (var i = 0; i < opts.points.length; i++) {
		var points = opts.points[i];
		var data = signals.sanitize(points,[0.0,0.0],[NaN,"-"]);
			
		var downsampled = [];
		var inc = Math.floor(data.length/target);
		console.log("Data length: " + data.length + " Target: " + target + " so increment is " + inc);
		if(data.length <= target){
			downsampled = data;
		}
		else {
			//var data = signals.medianFilter(data,inc);
			var data = gaussianFilter(data, inc, 20);
			
			for(var n=0; n < data.length; n+= inc) {
				downsampled.push(data[n]);
			
			}
			
		}
		downsampledData.push(downsampled);
	}
	console.log("Downsampled " + opts.points.length + " channels to : " + downsampled.length);
	self.postMessage({cmd:"downsampled", "data":downsampledData,"key":opts.key});
	//console.log(downsampled);
};


self.export = function(opts) {
	var data = opts.data;
	var metadata = opts.metadata;
	
	var csv = "";
	var channels = ["Z","Y","X","Batt","Temperature","EDA"];
	//Generate headers
	var headers = "";
	headers += "Log File Created by EDA Toolkit - 2012\r\n";
	headers += "File Version" + ": " + 1.01 + "\r\n";
	headers += "Firmware Version" + ": " + metadata["Firmware Version"]+ "\r\n";
	headers += "UUID" + ": " + metadata["UUID"]+ "\r\n";
	headers += "Sampling Rate" + ": " + metadata["Sampling Rate"].toFixed(0)+ "\r\n";
	headers += "Start Time" + ": " + metadata["Start Time"].toQFormat()+ "\r\n";
	headers += "Z-axis | Y-axis | X-axis | Battery | °Celsius | EDA(uS)\r\n";
	headers += "---------------------------------------------------------\r\n";
	csv += headers;
	//Generate body
	for (var i = 0; i < data[channels[0]].length; i++) {
		try {
			var line = channels.map(function(channel) {return data[channel][i].toFixed(3);}).join(",") + "\r\n";
			csv += line;
			
		}
		catch (error) {
			console.log(error);
		}
	}
	if (opts.useBlob == true) {
		var bb = new BlobBuilder;
		bb.append(csv);
		self.postMessage({cmd:"export", data:bb.getBlob("text/plain;charset=utf-8")});
		
	}
	else {
		self.postMessage({cmd:"export", data:csv});
		
	}
};

self.parseTextData = function(body, columnHeaders) {
	console.log(columnHeaders);
	var data  = {};
	for(var col=0; col < columnHeaders.length; col++){
		data[columnHeaders[col]] = [];
	}
	data.markers = [];
	var lines = body.split("\n");
	var length = lines.length;
	for(var n=0; n < length; n++) {
		if((n % 1000) == 0) { 
			self.postMessage({cmd:"progress", progress:(float(n)/length)});
		}
		if(lines[n].indexOf(",,,,,") > -1){
			//It's an event
			data.markers.push(n);
		}
		else {
			var values = lines[n].split(",");
			for(var c=0; c < values.length; c++) {
				var value = values[c];
				if(value != undefined && value != "") {
				
					data[columnHeaders[c]].push(value.autoconvert());
				}
			}
			
		}
	
	}
	
	self.postMessage({cmd:"data", "data":data});
	

};


self.parseBinaryData = function(body, columnHeaders) {
	var EOL = "\xe5\xe2";
	var data  = {};
	for(var col=0; col < columnHeaders.length; col++){
		data[columnHeaders[col]] = [];
	}
	
	var data_packets = body.split(EOL);
	//console.log(data_packets);
	var length = data_packets.length;
	for(var n=0; n < length; n++){
	   if((n % 1000) == 0) { 
	   	self.postMessage({cmd:"progress", progress:(float(n)/length)});
	   }
	    
	    try {
	    	
	    	var line = data_packets[n];
	    	//console.log("Line: " + line + " | Length: " + line.length);
	        // check for blank lines that could occur at EOF and log them
	        if(line.length == 0) {
	            console.log("> Encountered a blank line at #" + index + " of (headless) binData - this is most likely EOF");
	            break;
	        }
	        
	        var samples = unpackStruct(line);
	        //console.log(samples);
	        //# using unrolled loop for speed and code readability
	        
	        
	        var acc_z = unpackSigned(samples[0]);
	        var acc_y = unpackSigned(samples[1]);
	        var acc_x = unpackSigned(samples[2]);
	        var bat_v = unpackUnsigned(samples[3]) * 10.0;
	        var temp  = unpackSigned(samples[4]);
	        var eda   = unpackUnsigned(samples[5]);
			//console.log("EDA: " + eda);
			
			
	        if( eda >= 999 && acc_x <= -999.0) {
	            data.markers.append(index);
	        }
	        else {
	        	data[columnHeaders[0]].push(acc_z);
	        	data[columnHeaders[1]].push(acc_y);
	        	data[columnHeaders[2]].push(acc_x);
	        	data[columnHeaders[3]].push(bat_v);
	        	data[columnHeaders[4]].push(temp);
	        	data[columnHeaders[5]].push(eda);	        	
	        }
		}
		catch (error) {
			continue;
		}
	}
	
	self.postMessage({cmd:"data", "data":data});
	
};

self.get = function(url, callback) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET",url,false);
	xmlhttp.send();
	var text = xmlhttp.responseText;
	
	self.parse( text );
	
};