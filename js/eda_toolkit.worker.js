var separator = "---------------------------------------------------------\r\n";
var LF = "\n";
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
	var type = self.detectFormat(text.toString());
	switch (type) {
		case "edafile":
			var headerPlusBody = text.toString().split(separator);
			var headers = headerPlusBody[0].split(LF);
			var parsedHeaders = self.parseHeaders(headers);	
		
			if(parsedHeaders["File Version"] < 1.1) {
				self.parseTextData(headerPlusBody[1], ["Z","Y","X","Battery","Temperature","EDA"]);
			}
			else if((parsedHeaders["File Version"] < 1.5) && (parsedHeaders["File Version"] > 1.09)) {
				self.parseTextData(headerPlusBody[1], parsedHeaders["Column Names"]);
			}
			else {
				self.parseBinaryData(headerPlusBody[1], ["Z","Y","X","Battery","Temperature","EDA"]);
			}
			break;
		case "csv":
			var headerPlusBody = text.toString().split(LF);
			
			var headers = headerPlusBody.slice(0, 4);
			console.log("Headers: " + headers.join("|"));
			var body = text.toString().replace(headers[0]+LF, "");
			var parsedHeaders = self.parseDSVHeaders(headers,",");	
			console.log("Parsed Headers: " + parsedHeaders["Column Names"].join(","));
			console.log(body);
			self.parseTextData(body, parsedHeaders["Column Names"]);
			break;
		case "tsv":
			var headerPlusBody = text.toString().split(LF);
			
			var headers = headerPlusBody.slice(0, 4);
			console.log("Headers: " + headers.join("|"));
			var body = text.toString().replace(headers[0]+LF, "");
			var parsedHeaders = self.parseDSVHeaders(headers,"\t");	
			console.log("Parsed Headers: " + parsedHeaders["Column Names"].join("\t"));
			console.log(body);
			self.parseTextData(body, parsedHeaders["Column Names"]);
			break;
		
		default:
			var headerPlusBody = text.toString().split(LF);
			var headers = headerPlusBody.slice(0, 4);
			var body = text.toString().replace(headers[0]+LF, "");
			var parsedHeaders = self.parseDSVHeaders(headers,",");	
			self.parseTextData(body, parsedHeaders["Column Names"]);
			break;
			
	}
}

self.detectFormat = function(text) {
	if (text.indexOf("\n") == -1) {
		LF = "\r";
	}

	if (text.indexOf(separator) > -1) {
		LF = "\r\n";
		return "edafile";
	}
	else if ((text.indexOf("\t") > -1) && !(text.indexOf(",") > -1)) {
		return "tsv";
	}
	else {
		return "csv";
	}


};

self.parseDSVHeaders = function(metadata,del) {
	colNames = metadata[0].replace(/\n/g,"").split(del);
	var headers = {};
	headers["Column Names"] = colNames;
	//now we have to infer sample rate based on some samples. Assume that time column is left-most
	var rows = [];
	for (var i = 1; i < metadata.length; i++) {
		rows.push(metadata[i].split(del));
	}
	if (rows.length > 1) {
		try {
			var t1 = Date.parse(rows[0][0]);
			var t2 = Date.parse(rows[1][0]);
			var fs = 1000.0/(t2-t1);
			headers["Sampling Rate"] = fs;
		}
		catch (error) {
			headers["Sampling Rate"] = 1.0;
		}
	}
	self.metadata = metadata;
	headers["Start Time"]  = new Date( t1 );
	self.postMessage({cmd:"metadata", data:headers});
	
	return headers;

};

self.parseHeaders = function(metadata) {
	var headers = {};
	var validColumnNames = [], colNames;
	for(var n=0; n < metadata.length; n++) {
		var row = metadata[n];
		if(row.indexOf(": ") > -1) {
			var property = row.split(": ")[0];
			var value = row.split(": ")[1];
			if(value != undefined && value != "") {
				headers[property] = value.autoconvert();
			}
		}
		else if(row.indexOf("|") > -1){
			//Now parse out the channels directly
			//" Z-axis | Y-axis | X-axis | Battery | °Celsius | EDA(uS) "
			colNames = row.replace(/^\s*|\s*$/g, "");
			colNames = colNames.split("|");
			console.log("Column Names: " + colNames);
			for (var i = 0; i < colNames.length; i++) {
				colNames[i] = colNames[i].replace(/^\s*|\s*$/g, "")
				switch (colNames[i]) {
					case "Z-axis":
						colNames[i] = "Z";
						break;
					case "Y-axis":
						colNames[i] = "Y";
						break;
					case "X-axis":
						colNames[i] = "X";
						break;
					case "°Celsius":
						colNames[i] = "Temperature";
						break;
					case "EDA(uS)":
						colNames[i] = "EDA";
						break;
					case "�Celsius":
						colNames[i] = "Temperature";
						break;
					default:
						if (colNames[i].indexOf("Celsius") > -1) {
							colNames[i] = "Temperature";
						}
						break;
				}
				if (colNames[i].toLowerCase() != "events") {
					validColumnNames.push(colNames[i]);
				}
			}
			
			headers["Column Names"] = validColumnNames;
		}
	
	}
	self.metadata = metadata;
	self.postMessage({cmd:"metadata", data:headers});
	headers["Column Names"] = colNames;
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
	var data = signals.sanitize(opts.points,[0.0],[NaN]);
	var target = opts.target;
	
	//start with naive downsampling;
	var downsampled = [];
	var inc = Math.ceil(data.length/target);
	console.log("Data length: " + data.length + " Target: " + target + " so increment is " + inc);
	if(data.length <= target){
		downsampled = data;
	}
	else {
		//var data = signals.medianFilter(data,inc);
		var data = gaussianFilter(data, int(inc), 20);
		
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
		var data = signals.sanitize(points,[0.0],[NaN]);
			
		var downsampled = [];
		var inc = Math.floor(data.length/target);
		console.log("Data length: " + data.length + " Target: " + target + " so increment is " + inc);
		if(data.length <= target){
			downsampled = data;
		}
		else {
			//var data = signals.medianFilter(data,inc);
			//var data = gaussianFilter(data, int(inc), 20);
			
			for(var n=0; n < data.length; n+= inc) {
				downsampled.push(data[n]);
			
			}
			
		}
		downsampledData.push(downsampled);
	}
	console.log("Downsampled " + opts.points.length + " channels to : " + downsampled.length);
	console.log(downsampledData);
	self.postMessage({cmd:"downsampled", "data":downsampledData,"key":opts.key});
};


self.export = function(opts) {
	var data = opts.data;
	var metadata = opts.metadata;
	
	var csv = "";
	var channels = ["Z","Y","X","Batt","Temperature","EDA"];
	//Generate headers
	var headers = "";
	headers += "Log File Created by EDA Toolkit - " + (new Date()).getYear() +"\r\n";
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
		bb.push(csv);
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
		if (columnHeaders[col].toLowerCase() != "events") {
			data[columnHeaders[col]] = [];
		}
	}
	data.markers = [];
	var lines = body.split(LF);
	var length = lines.length;
	for(var n=0; n < length; n++) {
		if((n % 1000) == 0) { 
			self.postMessage({cmd:"progress", progress:(float(n)/length)});
		}
		if(lines[n].indexOf(",,,,,") > -1 ){
			//It's an event
			data.markers.push({index:n,comment:"",type:"manual"} );
		}
		
		else {
			var values = lines[n].split(",");
			for(var c=0; c < values.length; c++) {
				var value = values[c];
				if(value != undefined && value != "" && value.length>0 && value.charCodeAt(0) != 13) {
					if (columnHeaders[c].toLowerCase() == "events") {
						console.log("Value: " + value + " | value.length=" + value.length + " | value.charCode=" + value.charCodeAt(0));
						data.markers.push({index:n,comment:value,type:"generated"});
					}
					else{
						data[columnHeaders[c]].push(value.autoconvert());
					}
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
	body = body.replace(/^\r\n*/g, "");
	var data_packets = body.split(EOL);
	data.markers = [];
	var length = data_packets.length;
	for(var n=0; n < length; n++){
	   if((n % 1000) == 0) { 
	   	self.postMessage({cmd:"progress", progress:(float(n)/length)});
	   }
	    
	    try {
	    	
	    	var line = data_packets[n];
	    	if (line.length != 12) {
	    		console.log(line);
	    		console.log("Line length: "+ line.length + " at index: " + n  + " of " + length);
	    		
	    	}
	    	//console.log("Line: " + line + " | Length: " + line.length);
	        // check for blank lines that could occur at EOF and log them
	        if(line.length == 0) {
	            console.log("> Encountered a blank line at #" + index + " of (headless) binData - this is most likely EOF");
	            break;
	        }
	        
	        var samples = unpackStruct(line);
			if (line.length != 12) {
				console.log(samples);
				
			}
	        //# using unrolled loop for speed and code readability
	        
	        
	        var acc_z = unpackSigned(samples[0]);
	        var acc_y = unpackSigned(samples[1]);
	        var acc_x = unpackSigned(samples[2]);
	        var bat_v = unpackUnsigned(samples[3]) * 10.0;
	        var temp  = unpackSigned(samples[4]);
	        var eda   = unpackUnsigned(samples[5]);
			//console.log("EDA: " + eda);
			
			
	        if( eda >= 999 && acc_x <= -999.0) {
				data.markers.push({index:n,comment:"",type:"manual"} );
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
			console.log("Problem while unpacking binary data: " + error);
			continue;
		}
	}
	
	self.postMessage({cmd:"data", "data":data});
	
};

self.get = function(url, callback) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.responseType = 'arraybuffer';
	xmlhttp.open("GET",url,false);
	xmlhttp.send();
	var uInt8Array = new Uint8Array(xmlhttp.response);
	var i = uInt8Array.length;
	var binaryString = new Array(i);
	while (i--)
	{
	  binaryString[i] = String.fromCharCode(uInt8Array[i]);
	}
	var data = binaryString.join('');
	self.parse( data );
	console.log(data);	
};