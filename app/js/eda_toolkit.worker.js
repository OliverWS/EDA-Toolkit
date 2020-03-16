/**
* EDA Toolkit
* Copyright 2016 Oliver Wilder-Smith 
*/
var e = Math.E;
var pi = Math.PI;
var np = {};
var MU = "\u03BC";


urlParams = (function()
	{
		var items = location.search.substring(1).split("&");
		var map = {};

		var translate =
		{
			"true" : true,
			"false" : false,
			"null" : null
		};

		for (var i=0, l=items.length; i<l; i++)
		{
			var item = items[i];
			var pos = item.indexOf("=");

			var name = pos == -1 ? item : item.substring(0, pos);
			var value = pos == -1 ? true : item.substring(pos+1);

			if (value in translate) {
				value = translate[value];
			} else if ("" + parseFloat(value, 10) == value) {
				value = parseFloat(value, 10);
			}

			map[name] = value;
		}

		// Cleanup temporary reference types
		items = translate = null;

		/**
		 * {String} Returns the value of the given parameter @name {String}.
		 */
		return function get(name) {
			return name in map ? map[name] : null;
		}
	})();

float = function(val) {
	return val*1.0;
};

int = function(val) {
	return parseInt(val, 10);
};

pow = function(val,points) {
	return Math.pow(val, points);
};

round = function(val, digits) {
	var digits = digits || 0;
	return val.toFixed(digits);

};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var log = function(e) {
	if(window.console){
		console.log(e);
	}
}



var toast = function(msg) {
	var el = document.createElement("div");
	el.className = "toast alert alert-info";
	el.innerHTML = msg;
	el.style.position = "absolute";
	el.style.display = "block";
	el.style.width = "30%";
	el.style.left = "50%";
	el.style.top = "50%";
	el.style["margin-left"] = "-15%";
	el.style["margin-top"] = "0px";
	document.getElementsByTagName("body")[0].appendChild(el);
	$(".toast").fadeOut(0);
	$(".toast").fadeIn(500);
	setTimeout(function() {$(".toast").fadeOut(500);}, 3000);
	
};



Math.trunc = function(num, digits) {
	return num.toFixed(digits);
};

function testBit(data, offset) {
	var mask = 1 << offset;
	    return(data & mask)
}

function truncate(number, points) {
	var points = points || 0;
	return Math.trunc(number*pow(10, points))/float(pow(10, points), points);

}

function unpackStruct(bytes) {
	var struct = [];
	for(var n=0; n < bytes.length; n+=2){
		var msb = bytes.charCodeAt(n);
		var lsb = bytes.charCodeAt(n+1);
		var combo = msb*256 + lsb;	
		struct.push(combo);
	}
	return struct;

};


function unpackSigned(data) {
	var isNegative = ( testBit(data, 15) > 0 );
	var dotOffset =  (data >> 13) & 3; //Rotate and mask w/ 0x0003
	var value = float(data & 1023)/1000.0;
	if( isNegative )
	    return truncate(round((-1.0) * value * (pow(10, dotOffset)), 3 - dotOffset), 3 - dotOffset)
	else
	    return truncate(round(value * (pow(10, dotOffset)), 3 - dotOffset), 3 - dotOffset)
	

}

function unpackUnsigned(data) {
	var dotOffset =  (data >> 14) & 3; //Rotate and mask w/ 0x0003
	var value = float(data & 16383)/10000.0;
	return truncate(round(value * (pow(10, dotOffset)), 4 - dotOffset), 4 - dotOffset);
	/*
	dotOffset =  (data >> 14) & 3 #Rotate and mask w/ 0x0003
	value = (data & int("0x3FFF", 16))/10000.0
	return truncate(round(value * pow(10, dotOffset), 4 - dotOffset), 4 - dotOffset)
	*/
}

Number.prototype.pad = function(padding) {
	var s = "" + this;
	var padding_needed = (padding - s.length);
	for (var i = 0; i < padding_needed; i++) {
		s = '0' + s;
	}	
	return s;
};

String.prototype.pad = function(padding) {
	var s = "" + this;
	var padding_needed = (padding - s.length);
	for (var i = 0; i < padding_needed; i++) {
		s = '0' + s;
	}	
	return s;
};



Date.prototype.toQFormat = function() {
	var output = "";
	output += this.getFullYear() + "-" + (this.getMonth()+1).pad(2) + "-" + this.getDate().pad(2);
	output += " ";
	output += this.getHours().pad(2) + ":" + this.getMinutes().pad(2) + ":" + this.getSeconds().pad(2);
	output += " ";
	output += "Offset:" + ( (this.getTimezoneOffset() > 0) ? "+" + (this.getTimezoneOffset()/60).pad(2) : (this.getTimezoneOffset()/60).pad(2) );
	return output;
};

Array.prototype.isValid = function() {
	 var arr = this;
	 return (arr.filter(function(d){ return !isNaN(d);}).length == arr.length);
};



parseDate = function(val) {
	//2011-04-27 18:55:39 Offset:-04
	var dateString = val.split(" ")[0];
	var time = val.split(" ")[1];
	var tz = float(val.split(" ")[2].split(":")[1]);
	
	var year = int( dateString.split("-")[0] );
	var month = int(  dateString.split("-")[1] - 1 );
	var day = int(  dateString.split("-")[2] );
	
	var hours = int( time.split(":")[0] );
	var minutes = int( time.split(":")[1] );
	var seconds = int( time.split(":")[2] );
	
	
	return (new Date(year, month, day, hours, minutes, seconds, 0));

};




var TimeDelta = function(delta) {
	var that = {};
	if(!delta.isPrototypeOf(Object)) {
		that.days = Math.floor(delta/(1000*60*60*24));
		that.hours = Math.floor( (delta % (1000*60*60*24))/(1000*60*60) );
		that.minutes = Math.floor( (delta % (1000*60*60))/(1000*60) );
		that.seconds = Math.floor( (delta % (1000*60))/(1000) );
		that.milliseconds = Math.floor( (delta % (1000)) );
	}
	else {
		that.days = delta.days || 0;
		that.hours = delta.hours || 0;
		that.minutes = delta.minutes || 0;
		that.seconds = delta.seconds || 0;
		that.milliseconds = delta.milliseconds || 0;
	}
	
	that.toString = function() {
		return this.days + " days " + this.hours + ":" + this.minutes + ":" +this.seconds + "." + this.milliseconds.toFixed(3);
	
	};
	
	that.valueOf = function() {
		var value = 0;
		value += 1000*60*60*24*this.days;
		value += 1000*60*60*this.hours;
		value += 1000*60*this.minutes;
		value += 1000*this.seconds;
		value += this.milliseconds;
		return value;
	};
	
	return that;

};


Date.prototype.sub = function(date) {
	var diff = this.valueOf() - date.valueOf();
	return TimeDelta(diff);
};

Date.prototype.add = function(delta) {
	return new Date(this.valueOf() + TimeDelta(delta).valueOf());
};


Date.prototype.addMilliseconds = function(ms) {
	var newDate = new Date(this.valueOf() + ms);
	return newDate;
	

};


Date.prototype.addSeconds = function(seconds) {
	return this.addMilliseconds(seconds*1000);

};

Date.prototype.addMinutes = function(mins) {
	return this.addSeconds(60*mins);
};

Date.prototype.addHours = function(hours) {
	return this.addMinutes(60*hours);
}

Date.prototype.addDays = function(days) {
	return this.addHours(24*days);
}

Date.prototype.getMinutesSinceMidnight = function() {
	var midnight = new Date(this.toString());
	midnight.setHours(0);
	midnight.setMinutes(0);
	midnight.setSeconds(0);
	midnight.setMilliseconds(0);
	
	var timeInMinutes = (midnight.valueOf() - this.valueOf())/(60*1000);
	return timeInMinutes;

};

Date.prototype.shortString = function(showDay) {
	if (showDay) {
		return this.toLocaleDateString() + " " + this.toLocaleTimeString();
	}
	else {
		return this.toLocaleTimeString();
	}
};


String.prototype.contains = function(substr) {

	return (this.indexOf(substr) > -1);

}

String.prototype.isnum = function() {
	try {
		var f = parseFloat(this.toString());
		return true;
	}
	catch (error) {
		return false;
	}

};

String.prototype.isdate = function() {
	try {
		var d = new Date(this.toString());
		if(!d.valueOf().isNaN()){
			return true;
		}
		else {
			return false;
		}
	}
	catch (error) {
		return false;
	}

};


String.prototype.autoconvert = function() {
{
		try {
			return parseDate(this.toString());
		}
		catch (error) {

		}
		try {
			if (this.toString().indexOf(":") > 0) {
				var d = Date.parse(this.toString());
				if(!isNaN(d)){
					console.log("Parsed '" + this.toString() + "' to " + (new Date(d)).toString())
					return new Date(d);
				}

			}

		}
		catch (error) {
			console.log(error)
		}
		try {
			var n =  parseFloat(this.toString());
			if(!isNaN(n)) {
				return n;
			}
			else {
				return this.toString();
			}
		}
		catch (error) {
			return this.toString();
		}
	}

};

guess = function(x) {
	if (typeof(x) != "string") {
		return typeof(x);
	}
	else if (x.isdate()) {
		return "date";
	}
	else if (x.isnum()) {
		if(x.toString().contains(".") || x.toString().contains(",")) {
			return "float";
		}
		else {
			return "int";
		}	
	}
	else {
		return "unknown";
	}


}

autoformat = function(x) {
	var format = guess(x);
	switch (format) {
		case "float":
			return float(x);
			break;
		case "int":
			return int(x);
			break;
		case "date":
			return new Date(x);
			break;
		default:
			return x;
			break;
		
	}
}



// a = 1/(σ√(2π)), b = μ, c = σ
gaussian = function(x, width) {
	var c = Math.sqrt(width);
	var a = 1/(c*Math.sqrt(2*pi));
	var b = 0;
	
	var exp = -1*(Math.pow((x-b),2)/(2*c*c));
	var fx = a*Math.pow(e,exp);
	return fx;
}

gaussianKernel = function(width,resolution) {
	var kernel = new Array();
	for(var n=-1*resolution/2; n < resolution/2; n++) {
		kernel.push(gaussian(n, width));
	}
	return kernel;
}


gaussianFilter = function(values, width, resolution){
	var result = new Array();
	if(resolution == undefined){
		resolution = 100;
	}
	for(var n=0; n < values.length; n++){
		var start = (n-resolution/2) < 0? 0 : n - resolution/2;
		var end = (n+resolution/2)>=values.length? values.length-1 : n + resolution/2;
		
		var kernel = gaussianKernel(width, end-start);
		result.push(np.sum(convolve(kernel,values.slice(start,end))));
	}
	return result;

}

np.timeRange = function(start,end,nsteps) {
	var duration = end-start;
	var step = Math.floor(float(duration)/nsteps);
	var tr = new Array();
	for (var i=0; i < nsteps; i++) {
		tr.push(start.addMilliseconds(step*i));
	}
	return tr;

}

np.arange = function(start,end,step) {
	if(step == undefined){
		step = 1;
	}
	var range = new Array();
	for(var n=start; n < end; n+=step){
		range.push(n);
	}
	return range;
}

np.round = function(val, step){
	var remainder = val%step;
	if(remainder > step/2){
		val = (Math.round(val/step)+1)*step;
	}
	else {
		val = (Math.round(val/step))*step;
	}
	return val;
}


np.map = function(func, arr) {
	var result = new Array();
	for(var n=0; n < arr.length; n++){
		result.push(func(arr[n]));
	}
	return result;
}


np.max = function(arr){
	var max = -Infinity;
	for(var n=0; n < arr.length; n++){
		if(arr[n] > max){
			max = arr[n];
		}
	}
	return max;
}

np.min = function(arr){
	var min = Infinity;
	for(var n=0; n < arr.length; n++){
		if(arr[n] < min){
			min = arr[n];
		}
	}
	return min;
}



convolve = function(mat1,mat2) {
	var result = new Array();
	if(mat1.length != mat2.length){
		return false;
	}
	else {
		for(var n=0; n < mat1.length; n++){
			result.push(mat1[n]*mat2[n]);
		}
		return result;
	}
}


np.sum = function(values) {
	var result = 0;
	for(var n=0;n<values.length;n++) {
		if(!values[n].isNaN()){
			result += values[n];
		}
	}
	return result;
}




Array.prototype.max = function(){
	var arr = this.filter(function(d) {return !isNaN(d)});
	var max = -Infinity;
	for(var n=0; n < arr.length; n++){
		if(arr[n] > max){
			max = arr[n];
		}
	}
	return max;
}

Array.prototype.min = function(){
	var arr = this.filter(function(d) {return !isNaN(d)});
	var min = Infinity;
	for(var n=0; n < arr.length; n++){
		if(arr[n] < min){
			min = arr[n];
		}
	}
	return min;
}


Array.prototype.find = function(val){
	var arr = this;
	var results = new Array();
	for(var n=0; n < arr.length; n++){
		if(arr[n] == val){
			results.push(n);
		}
	}
	
	return results;
}

Array.prototype.map = function(func) {
	var arr = this;
	var result = new Array();
	for(var n=0; n < arr.length; n++){
		result.push(func(arr[n]));
	}
	return result;
}

Array.prototype.max = function(){
	var arr = this;
	var max = -Infinity;
	for(var n=0; n < arr.length; n++){
		if(arr[n] > max){
			max = arr[n];
		}
	}
	return max;
}

Array.prototype.min = function(){
	var arr = this;
	var min = Infinity;
	for(var n=0; n < arr.length; n++){
		if(arr[n] < min){
			min = arr[n];
		}
	}
	return min;
}

Array.prototype.map = function(func) {
	var arr = this;
	var result = new Array();
	for(var n=0; n < arr.length; n++){
		result.push(func(arr[n]));
	}
	return result;
}

float = function(val) {
	return val*1.0;
};

int = function(val) {
	return parseInt(val, 10);
};

Array.prototype.clone =  function() {
	var arr = this;
	var copy = new Array();
	for(var n=0; n < arr.length; n++) {
		copy.push(arr[n]);
	}
	return copy;
};

gaussian = function(x, width) {
	var c = Math.sqrt(width);
	var a = 1/(c*Math.sqrt(2*pi));
	var b = 0;
	
	var exp = -1*(Math.pow((x-b),2)/(2*c*c));
	var fx = a*Math.pow(e,exp);
	return fx;
}

gaussianKernel = function(width,resolution) {
	var kernel = new Array();
	for(var n=-1*resolution/2; n < resolution/2; n++) {
		kernel.push(gaussian(n, width));
	}
	return kernel;
}

/*
String.prototype.autoconvert = function() {
{
		try {
			return parseDate(this.toString());
		}
		catch (error) {
			d = Date.parse(this.toString());
			if(d != NaN){
				return d;
			}
		}
		try {
			var n =  parseFloat(this.toString());
			if(n != NaN) {
				return n;
			}
			else {
				return this.toString();
			}
		}
		catch (error) {
			return this.toString();
		}
	}

};
*/

gaussianFilter = function(values, width, resolution){
	var result = new Array();
	if(resolution == undefined){
		resolution = 100;
	}
	for(var n=0; n < values.length; n++){
		var start = ( n - (resolution/2)) < 0 ? 0 : n - resolution/2;
		var end = ((n+ (resolution/2))>=values.length) ? values.length-1 : n + resolution/2;
		
		var kernel = gaussianKernel(width, end-start);
		result.push(np.sum(convolve(kernel,values.slice(start,end))));
	}
	return result;

}
var np = np || {};

np.arange = function(start,end,step) {
	if(step == undefined){
		step = 1;
	}
	var range = new Array();
	for(var n=start; n < end; n+=step){
		range.push(n);
	}
	return range;
}

np.round = function(val, step){
	var remainder = val%step;
	if(remainder > step/2){
		val = (Math.round(val/step)+1)*step;
	}
	else {
		val = (Math.round(val/step))*step;
	}
	return val;
}


np.map = function(func, arr) {
	var result = new Array();
	for(var n=0; n < arr.length; n++){
		result.push(func(arr[n]));
	}
	return result;
}
np.max = function(arr){
	var max = -Infinity;
	for(var n=0; n < arr.length; n++){
		if(arr[n] > max){
			max = arr[n];
		}
	}
	return max;
}

np.min = function(arr){
	var min = Infinity;
	for(var n=0; n < arr.length; n++){
		if(arr[n] < min){
			min = arr[n];
		}
	}
	return min;
}



convolve = function(mat1,mat2) {
	var result = new Array();
	if(mat1.length != mat2.length){
		return false;
	}
	else {
		for(var n=0; n < mat1.length; n++){
			result.push(mat1[n]*mat2[n]);
		}
		return result;
	}
}


np.sum = function(values) {
	var result = 0;
	for(var n=0;n<values.length;n++) {
		if(!values[n].isNaN){
			result += values[n];
		}
	}
	return result;
}

np.mean = function(arr) {
	return np.sum(arr)/(1.0*arr.length);

};

np.average = np.mean;
np.avg = np.mean;

np.median = function(arr) {
	var copy = arr.clone();
	copy.sort();
	var middle = int(Math.ceil(arr.length/2.0)) - 1;
	if((arr.length % 2) == 0) {
		return np.mean(copy.slice(middle, -middle));
	}
	else {
		return copy[middle];
	}

};




var signals = signals || {};

signals.sanitize = function(data, replace, toreplace) {
	var replace = replace || [0.0];
	var toreplace = toreplace || [NaN];
	for(var n=0; n < data.length; n++) {
		for(var i=0; i < toreplace.length; i++){
			if(toreplace[i] == "-"){
				if(data[n] < 0.0){
					data[n] = replace[i];
				}
			}
			else if(data[n] == toreplace[i]){
				data[n] = replace[i];
			}
		
		}
	}
	return data;

};

signals.gaussianFilter = function(data,width) {
	return gaussianFilter(data,width, 10);
};

signals.medianFilter = function(data, width) {
	var width = width || 3;

	var output = new Array();
	for(var n=0; n < data.length; n++){
		var start = (n-(width/2)) < 0? 0 : n - width/2;
		var end = (n+(width/2))>=data.length? data.length-1 : n + width/2;
		output.push(np.median(data.slice(start, end)));
	}
	return output;
}


signals.maxFilter = function(data, width) {
	var width = width || 3;
	var output = new Array();
	for(var n=0; n < data.length; n++){
		var start = (n-width/2) < 0? 0 : n - width/2;
		var end = (n+width/2)>=data.length? data.length-1 : n + width/2;
		output.push(np.max(data.slice(start, end)));
	}
	return output;
}


signals.minFilter = function(data, width) {
	var width = width || 3;
	var output = new Array();
	for(var n=0; n < data.length; n++){
		var start = (n-width/2) < 0? 0 : n - width/2;
		var end = (n+width/2)>=data.length? data.length-1 : n + width/2;
		output.push(np.min(data.slice(start, end)));
	}
	return output;
}

signals.diff = function(data) {
	var output = new Array();
	for(var n=0; n < data.length-1; n++){
		output.push(data[n+1] - data[n]);
	}
	return output;
}

signals.where = function(data, condition) {
	var output = new Array();
	for (var i = 0; i < data.length; i++) {
		if (condition(data[i])) {
			output.push(i);
		}
	}
	return output;
};

signals.zeroCrossings = function(data) {
	var output = new Array();
	for (var i = 1; i < data.length; i++) {
		if((data[i-1] < 0.0) && (data[i] > 0.0)) {
			output[i] = 1;
		}
		else if((data[i-1] > 0.0) && (data[i] < 0.0)) {
			output[i] = -1;
		}
		else {
			output[i] = 0;
		}
	}
	return output;
};


signals.peaks = function(data, width) {
	//var data = gaussianFilter(data,width/2,10);
	var output = new Array();
	var diff = signals.diff(data); 
	var crossings = signals.zeroCrossings(data);
	
	var localMaxes = signals.where(output,function(d) {return (d > 0);});
	var localMins = signals.where(output,function(d) {return (d < 0);});
	
	return [localMaxes, localMins];
	
	
};





var separator = "---------------------------------------------------------\r\n";
var LF = "\r\n";
var console = {};
console.log = function(msg) {
	self.postMessage({cmd:"console","msg":msg});

};
self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'load':
    	if(data.filename != undefined)
				self.filename = data.filename;
		  self.get(data.url, self.parse);
      break;

    case 'loadText':
      if(data.filename != undefined)
					self.filename = data.filename;
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
	text = text.toString();
	if(!text.contains(LF)){
		LF = "\n";
	}
	var type = self.detectFormat(text);
	switch (type) {
		case "edafile":
			var headerPlusBody = text.split(separator);
			var headers = headerPlusBody[0].split(LF);
			var parsedHeaders = self.parseHeaders(headers);
			text = null;
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
			var headerPlusBody = text.split(LF);
			var headers = headerPlusBody.slice(0, 4);
			console.log("Headers: " + headers.join("|"));
			var parsedHeaders = self.parseDSVHeaders(headers,",");
			console.log("Parsed Headers: " + parsedHeaders["Column Names"].join(","));
			var body = text.replace(parsedHeaders["headerLines"], "");
			text = null;
			self.parseTextData(body, parsedHeaders["Column Names"]);
			break;
		case "tsv":
			var headerPlusBody = text.split(LF);
			var headers = headerPlusBody.slice(0, 4);
			console.log("Headers: " + headers.join("|"));
			var body = text.toString().replace(headers[0]+LF, "");
			var parsedHeaders = self.parseDSVHeaders(headers,"\t");
			console.log("Parsed Headers: " + parsedHeaders["Column Names"].join("\t"));
			text = null;
			self.parseTextData(body, parsedHeaders["Column Names"]);
			break;

		default:
			var headerPlusBody = text.toString().split(LF);
			var headers = headerPlusBody.slice(0, 4);
			var body = text.toString().replace(headers[0]+LF, "");
			text = null;
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
	headers["headerLines"] = metadata[0] + LF;
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
			headers["Start Time"]  = new Date( t1 );
			//Now assert that the values are okay
			if(isNaN(headers["Sampling Rate"])){
				t1 = new Date(parseInt(rows[0][0]));
				t2 = new Date(parseInt(rows[1][0]));
				fs = 1000.0/(t2-t1);
				headers["Sampling Rate"] = fs;
		        headers["Start Time"]  = t1;
				if(isNaN(headers["Sampling Rate"])){
					throw "Sample rate invalid: " + fs;
				}
			}
			if(isNaN(headers["Start Time"])){
				throw "Invalid Start Time: " + t1;
			}
			console.log("Successfully identified sample rate: " + fs  + " and start time: " + headers["Start Time"].toString());
		}
		catch (error) {
			//Maybe it's a weird empatica file
			console.log("Treating file as empatica format (first row is starttime, second row is sample rate)")
			headers["Start Time"]  = new Date( parseFloat(metadata[0].split(del)[0])*1000.0 ); //Convert to ms since 1970
			headers["Sampling Rate"] = parseFloat(metadata[1].split(del)[0]);
			var prefix = "Channel";
			if(self.filename != undefined){
				 prefix = self.filename.split(".")[0];
			}
			for(var i=0; i < colNames.length; i++){
				if(colNames.length > 1){
					headers["Column Names"][i] = prefix + "_" + (i+1);
				}
				else {
					headers["Column Names"][i] = prefix;
				}
			}
			headers["headerLines"] += metadata[1] + LF;
			console.log("Empatica file: Successfully identified sample rate: " + headers["Sampling Rate"] + " and start time: " + headers["Start Time"].toString());

		}

	}
	self.metadata = metadata;

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
	console.log("Got a request for data export");
	console.log(data);
	var csv = "";
	var channels = ["Z","Y","X","Battery","Temperature","EDA"];
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
			var line = "";
			for(var j=0; j < channels.length; j++){
				try{
					var channel = channels[j];
					line += data[channel][i].toFixed(3);
					line += (j == (channels.length-1)) ? "\r\n" : ",";

				}
				catch(error){

				}
			}
			csv += line;

		}
		catch (error) {
			//console.log("Problem during export: " + error);
		}
	}

	// if (opts.useBlob == true) {
	// 	var bb = new BlobBuilder;
	// 	bb.push(csv);
	// 	self.postMessage({cmd:"export", data:bb.getBlob("text/plain;charset=utf-8")});

	// }
	// else {
		self.postMessage({cmd:"export", data:csv});

	// }
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
	body = null;
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
						//console.log("Value: " + value + " | value.length=" + value.length + " | value.charCode=" + value.charCodeAt(0));
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
	body = null;
	data.markers = [];
	var length = data_packets.length;
	for(var n=0; n < length; n++){
	   if((n % 1000) == 0) {
	   	self.postMessage({cmd:"progress", progress:(float(n)/length)});
	   }

	    try {

	    	var line = data_packets[n];
	    	if (line.length != 12) {
	    		//console.log(line);
	    		//console.log("Line length: "+ line.length + " at index: " + n  + " of " + length);

	    	}
	    	//console.log("Line: " + line + " | Length: " + line.length);
	        // check for blank lines that could occur at EOF and log them
	        if(line.length == 0) {
	            //console.log("> Encountered a blank line at #" + index + " of (headless) binData - this is most likely EOF");
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
	self.parse( binaryString.join('') );
};
