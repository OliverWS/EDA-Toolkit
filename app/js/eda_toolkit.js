/**
* EDA Toolkit
* Copyright 2013 Oliver Wilder-Smith 
* http://www.apache.org/licenses/LICENSE-2.0
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
	var padding_needed = (s.length - padding);
	for (var i = 0; i < padding_needed; i++) {
		s = '0' + s;
	}	
	return s;
};


Date.prototype.toQFormat = function() {
	var output = "";
	output += this.getFullYear() + "-" + (this.getMonth()+1) + "-" + this.getDate();
	output += " ";
	output += this.getHours().pad(2) + ":" + this.getMinutes().pad(2) + ":" + this.getSeconds().pad(2);
	output += " ";
	output += "Offset:" + ( (this.getTimezoneOffset() > 0) ? "+" + this.getTimezoneOffset() : this.getTimezoneOffset() );
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

String.prototype.autoconvert = function() {
{
		try {
			return parseDate(this.toString());
		}
		catch (error) {
			
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
	if (Dropbox) {
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
	dropzone.ondragover = function () { if(this.className.indexOf("hover") < 0){this.className += ' hover';} return false; };
	dropzone.ondragend = function () { this.className.replace("hover", ""); return false; };
	dropzone.ondrop = function(e) {	
		e.preventDefault();
		if(that.allowFolders){
			var entry = e.dataTransfer.items[0].webkitGetAsEntry();
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
var VideoDroplet = function(id, callback, opts) {
	var that = this;
	var opts = opts || {};
	that.id = id;
	that.extension = opts.extension || false;
	that.callback = callback;
	that.vsize = opts.vsize || {};
	that.vsize.width = that.vsize.width || 640;
	that.vsize.height = that.vsize.height || 320;
	
	
	
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
			player.size(that.vsize.width,that.vsize.height);
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

var qLogFile =  function () {
	var that = this;
	this.worker = new Worker("js/eda_toolkit.worker.js");
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
//		    console.log(msg.msg);
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
	this.hash = function() {
		if (!that.didAlreadyLoad) {
			return null;
		}
		else {
			var hash = that.startTime.toString() + "_" + that.endTime.toString() + "_" + that.filename + "_"+ that.data.length*that.data[that.channels[0]][0];
			return hash;
		}
	
	};
	this.load = function(url, callback, filename) {
		this.url = url;
		if (filename) {
			this.filename = filename;
		}
		else {
			this.filename = url.split("/").slice(-1);
		}
		
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
		if (localStorage[that.hash()] != undefined) {
			var cache = JSON.parse(localStorage[that.hash()]);
			that.rangeMarkers = cache.rangeMarkers;
		}
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
		this.channels = this.metadata["Column Names"].filter(function(d){return !((d.toLowerCase().indexOf("time") > -1) || (d.toLowerCase().indexOf("date") > -1)  );});
	
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
			console.log( "Illegal Offset: " + offset +". Offset must be between " + 0 + " and " + this.data.length-1 );
			return this.startTime.add(TimeDelta(offsetMilliseconds));
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
		$("video").attr("width", "auto");
		for (var i = 0; i < that.videoFiles.length; i++) {
			var player = that.videoFiles[i];
			$("#" + player.id).css("margin-left", ($("#" + that.id).width() - $("#" + player.id).width())/2);
			
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
			  if (type=="link") {
			  	var extension = file.split(".")[file.split(".").length-1].toLowerCase();
			  }
			  else {
			  	var extension = file.name.split(".")[file.name.split(".").length-1].toLowerCase();
			  }
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
		loadFiles(urlParams("file"), false, "link");
		loadFiles({},true,"");
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

if(d3){
	d3.selection.prototype.moveToFront = function() {
	  return this.each(function(){
	    this.parentNode.appendChild(this);
	  });
	};
}


var Grapher = function(div, opts) {
	var that = this;
	this.container = div;
	this.unrendered = true;
	this.opts = opts || {};
	this.channels = this.opts.channel || ["EDA"];
	this.autoscale = this.opts.autoscale || true;
	that.showAcc = false;
	this.units = {
		"EDA": "\u03BC" + "S",
		"X" : "gs",
		"Y" : "gs",
		"Z" : "gs",
		"Tonic" : "\u03BC" + "S",
		"Phasic" : "\u03BC" + "S"
	};
	this.spinOpts = {
	  lines: 13, // The number of lines to draw
	  length: 21, // The length of each line
	  width: 12, // The line thickness
	  radius: 30, // The radius of the inner circle
	  corners: 1, // Corner roundness (0..1)
	  rotate: 0, // The rotation offset
	  color: '#000', // #rgb or #rrggbb
	  speed: 1, // Rounds per second
	  trail: 60, // Afterglow percentage
	  shadow: true, // Whether to render a shadow
	  hwaccel: true, // Whether to use hardware acceleration
	  className: 'spinner', // The CSS class to assign to the spinner
	  zIndex: 2e9, // The z-index (defaults to 2000000000)
	  top: 'auto', // Top position relative to parent in px
	  left: 'auto' // Left position relative to parent in px
	};
	if (d3) {
		this.renderer = "svg";
		this.graph = $(div);
		
	}
	else {
		this.renderer = "canvas";
		this.graph = $("<canvas>");
		$(this.container).append(this.graph);
	}
	this.width = $(div).width();
	this.height = $(div).height();
	this.plot = function(data, callback) {
		if(callback) that.readyCallback = callback;
		
		try {
			if(that.spinner) {
			}
			else {
				that.spinner = new Spinner(that.spinOpts).spin(document.getElementById(that.graph[0].id));
				
			}
		}
		catch (error) {
			console.log("Spinner error: " + error.toString());
		}
		if(data != undefined){
			//console.log(data);
			if(that.renderer == "svg"){
				if(that.unrendered) {
					if(data.isEDAFile){
						that.isEDA = true;
						that.renderData(data);
						that.addPicker();
					}
					else {
						that.renderSVG(data);						
					}
					that.unrendered = false;
				}
				else {
					if(data.isEDAFile){
						that.renderUpdate(data);
					}
					else {
						that.updateSVG(data);
					}
				}
			}
			else {
				that.renderCanvas(data);
			}
		}
		else {
			//console.log(">>Grapher: Data appears to be undefined!");
		}
		if (that.spinner) {
			that.spinner.stop();
		}
	};
	this.channelSelectHandler = function(evt) {
		var root = $(that.container);
		$(this).toggleClass("selected-channel");
		var selectedChannels = [];
		$(root).find("#channel-select li a.selected-channel").each(function(i, el) {
			selectedChannels.push($(el).text());
		});
		console.log("New Selected Channels: " + selectedChannels);
		that.setChannels(selectedChannels);
		$(root).find("#channel-select li.ignore").remove();
		var ch = $(root).find("#channel-select li").remove().sort(function(a, b) {
			if ($(a).find("a").hasClass("selected-channel") && !$(b).find("a").hasClass("selected-channel")) {
				return -1;
			}
			else if ($(b).find("a").hasClass("selected-channel") && !$(a).find("a").hasClass("selected-channel")) {
				return 1;
			}
			else {
				return 0;
			}
		
		});
		
		ch.prependTo($(root).find("#channel-select"));
		$(root).find("#channel-select li a.selected-channel").last().parent().after('<li class="divider ignore"></li><li role="presentation" class="dropdown-header ignore">Other Channels</li>');
		$(root).find("#channel-select li a.selected-channel").first().parent().before('<li role="presentation" class="dropdown-header ignore">Visible Channels</li>');
		
		$(root).find("#channel-select li a").on("click", that.channelSelectHandler);
		$(".channel-select-dropdown").sortable({items: "li:has(.selected-channel)",cancel:".ignore"});
		evt.stopPropagation();
	};
	
	this.addPicker = function() {

//<div class="btn-group">
//  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
//    Action <span class="caret"></span>
//  </button>
//  <ul class="dropdown-menu" role="menu">
//    <li><a href="#">Action</a></li>
//    <li><a href="#">Another action</a></li>
//    <li><a href="#">Something else here</a></li>
//    <li class="divider"></li>
//    <li><a href="#">Separated link</a></li>
//  </ul>
//</div>

		var root = $(that.container);
		
		$(that.container).prepend($("<div>").addClass("btn-toolbar").addClass("pull-right").css("margin-bottom",-50).append(
			$("<div>").addClass("btn-group").append(
				$("<button>").attr("class","btn btn-info dropdown-toggle").attr("data-toggle","dropdown").attr("href","#").html("Channels\n<span class='caret'></span>")
			).append(
				$("<ul>").addClass("dropdown-menu channel-select-dropdown").attr("id","channel-select").attr("role","menu")
			)
		));
		
		$(root).find("#channel-select").empty();
		$(root).find("#channel-select")
		var edaFile = that.datasource;
		edaFile.channels.forEach(function(arg,idx) {
			if(arg != "length"){
				$(root).find("#channel-select").append($("<li>").html("<a href='#'>" + arg + "</a>"));
				console.log("Adding channel: " + arg);
			}
		
		});
		$(root).find("#channel-select li a").each(function(i,el) {
			console.log(el);
			console.log(that.channels.find($(el).text()));
			if(that.channels.find($(el).text()).length > 0){
				$(el).attr("class","selected-channel");
			}
			else {
				$(el).attr("class", "");
			}
		});
		
		$(root).find("#channel-select li a").on("click", that.channelSelectHandler);
		//$(root).find("#channel-select li a").first().click();
		$(root).find("#channel-select").on("sortupdate", function(evt) {
			var selectedChannels = [];
			$(root).find("#channel-select li a").each(function(i, el) {
				that.datasourceContainer.select("#"+$(el).text()).datum(i);
			});
			that.datasourceContainer.selectAll("path").sort(d3.ascending);
			var selectedChannels = [];
			$(root).find("#channel-select li a.selected-channel").each(function(i, el) {
				selectedChannels.push($(el).text());
			});
			that.setChannels(selectedChannels);
		});
	
	};
	
	
	
	
	this.renderCanvas = function(points) {
		var context = that.graph.getContext("2d");
		var width = $(canvas).width();
		var height = $(canvas).height(); 
		var wscale = (width*1.0)/points.length; 
		var hscale = (height*1.0)/(points.max() - points.min()); 
		//console.log(hscale);
		for (var i = 1; i < points.length; i ++){
			var p0 = points[i-1];
			var p1 = points[i]; 
				context.moveTo((i - 1)*wscale, height - p0*hscale);
				context.lineTo(i*wscale, height - p1*hscale);
				context.stroke(); 
				context.fill(); 
		}
	}
	
	this.renderData = function(eda) {
		that.datasource = eda;
		if ((that.datasource.channels.find("Tonic").length > 0) && (that.datasource.channels.find("Phasic").length > 0)  && (that.datasource.channels.find("EDA").length > 0)) {
			console.log("Turning on tonic and phasic since they are present");
			that.channels = ["EDA","Tonic","Phasic"];
		}
		else if ((that.datasource.channels.find("EDA").length > 0)) {
			that.channels = ["EDA"];
		}
		else {
			that.channels = that.datasource.channels;
		}
		
		var el = this.container;
		var p = ($(el).width()/5) < 25 ? ($(el).width()/5) : 25;
		that.w = $(el).width() - 3*p;
		that.h = $(el).height() - 2*p;
		//console.log("Length of eda is: " + that.datasource.data[that.channels[0]].length);
		that.datasource.x = d3.scale.linear().domain([0, that.w]).range([0, that.datasource.data.length]);
		that.datasource.y = d3.scale.linear().domain([0, that.h]).range([that.channels.map(function(d) {return that.datasource.data[d].max();}).max(), that.channels.map(function(d) {return that.datasource.data[d].min();}).min()]);
		
		
		that.datasource.getMultiChannelDataForOffsetRange(that.channels, 0, that.datasource.data.length-1, that.w, function(data) {
			that.renderSVG(data);
			//that.setChannels(that.channels);
		});		
		
	};
	
	this.zoom_rect = {};
	
	this.resize = function(height,width) {
		var el = this.container;
		if (width != undefined) {
			$(el).css("width", width);
			$(el).find("svg").attr("width",width);
			that.p = ($(el).width()/5) < 25 ? ($(el).width()/5) : 25;
			that.w = $(el).width() - 3*p;
			that.datasourceContainer.attr("width",that.w);
		}
		
		if (height != undefined) {
			$(el).css("height", height);
			$(el).find("svg").attr("height",height);
			that.h = $(el).height() - 2*that.p;
			that.datasourceContainer.attr("height", that.h);
		}
		
		
		if (that.currentRange) {
			that.renderUpdate(that.currentRange);
		}
		else {
			that.renderUpdate();
		}
	
	};
	
	this.setChannels = function(channels) {
		var validChannels = [];
		
		for (var i = 0; i < channels.length; i++) {
			var c = channels[i];
			if (that.datasource.data.hasOwnProperty(c) && that.datasource.data[c].isValid()) {
				validChannels.push(c);
				if (that.channels.find(c).length == 0) {
					//This is a new channel
					if (c == "X" || c == "Y" || c == "Z") {
						that.datasourceContainer.append("path")
							.attr("d", "")
						    .attr("class", c)
						    .attr("id",c);
						
					}
					else {
						that.datasourceContainer.append("path")
							.attr("d", "")
						    .attr("class", c)
						    .attr("clip-path", "url(#edaclip)")
						    .attr("id",c);
					}
					
				}
			}
		}
		for (var i = 0; i < that.channels.length; i++) {
			var c = that.channels[i];
		
			if (validChannels.find(c).length == 0) {
				that.datasourceContainer.select("#"+c).remove();
			}
		}
		
		that.channels = validChannels;
		var previousShowAccState = (that.showAcc == true);
		if (that.channels.find("X").length > 0 || that.channels.find("Y").length > 0 || that.channels.find("Z").length > 0) {
			that.showAcc = true;
		}
		else {
			that.showAcc = false;
			that.datasourceContainer.selectAll(".Acc").remove();
			that.datasourceContainer.selectAll(".axis-label-Acc").remove();
			if (!that.showAcc && previousShowAccState) {
				that.datasourceContainer.attr("height", that.h);
				
			}
		}
		$(that.container).find("#channel-select li a").each(function(i,el) {
			console.log(el);
			console.log(that.channels.find($(el).text()));
			if(that.channels.find($(el).text()).length > 0){
				$(el).attr("class","selected-channel");
			}
			else {
				$(el).attr("class", "");
			}
		});
		
		if (that.currentRange) {
			that.renderUpdate(that.currentRange);
		}
		else {
			that.renderUpdate();
		}
		that.datasourceContainer.selectAll(".marker").moveToFront();
		
		
	};
	this.unpackComment = function(comment) {
		comment = comment.replace(/^\s+|\s+$/g,'');
		if (comment[0] == "|") {
			comment = comment.slice(1,comment.length-1);
		}
		var output = comment.replace(/\|/g,"<br />");
		return output;
	};
	
	this.renderSVG = function(data, acc) {
		that.data = data;
		//console.log(data);
		//console.log("Rendering svg for " + data.length + " points");
		var p,w,h,el, edaContainer, line,lineAcc,y2;
		el = that.container;
		p = ($(el).width()/10) < 50 ? ($(el).width()/10) : 50;
		that.p = p;
		w = $(el).width() - 2*p;
		if (that.showACC) {
			h = 2*($(el).height() - 3*p)/3.0;
		}
		else {
			h = ($(el).height() - 2*p);
			
		}
		that.w = w;
		that.h = h;
		//TODO
		that.datasource.x.domain([0, that.w]);
		//Set x according to the shortest waveform to ensure valid data for whole container
		var x = d3.scale.linear().domain([0, data.map(function(d){return d.length}).max()]).range([0, w]);
		if(that.datasource.y && !that.autoscale){
			//console.log("EDA Range: " + that.datasource.y.range() + " | Data: " + data.min() + " to " + data.max());
			var yrange = [ that.datasource.y.range()[1], that.datasource.y.range()[0] ];
			var y = d3.scale.linear().domain(yrange).range([that.h, 0]);
		}
		else {
			var y = d3.scale.linear().domain([data.map(function(d) {return d.min();}).min(),data.map(function(d) {return d.max();}).max()]).range([that.h, 0]);
		}
		
		if (that.showAcc) {
			y = y.range([that.h*(2.0/3.0), 0]);
			var accData = [];
			for (var i = 0; i < that.channels.length; i++) {
				if (that.channels[i] == "X" || that.channels[i] == "Y" || that.channels[i] == "Z") {
					accData.push(that.data[i]);
				}
			}
			
			var y2 = d3.scale.linear().domain([accData.map(function(d) {return d.min();}).min(),accData.map(function(d) {return d.max();}).max()]).range([that.h*(2.0/3.0), that.height]);
			lineAcc = d3.svg.line()
			    .x(function(d,i) { return x(i); })
			    .y(function(d) { return  y2(d); });
			
		}
		line = d3.svg.line()
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return  y(d); });
		
		that.x = x;
		that.y = y;
		that.y2 = y2;
		that.lineAcc = lineAcc;
		that.svg = d3.select(el)
		  .append("svg")
		  	.attr("class","graph")
		    .attr("width", w + 2*p)
		    .attr("height", h + 3*p);
		
		edaContainer = that.svg.append("g").attr("transform", "translate(" + 2*p + "," + p + ")");
		edaContainer.append("defs").append("svg:clipPath")
		.attr("id", "edaclip")
		.append("svg:rect")
		.attr("id", "clip-rect")
		.attr("x", "0")
		.attr("y", "0")
		.attr("width", w)
		.attr("height", h);
		that.datasourceContainer = edaContainer;
		that.datasourceContainer
			.on('mousedown',that.mousedown)
			.on('mouseup',that.mouseup);
		
		
		that.renderGrid(that.datasourceContainer, that.channels[0]);
		
		for (var i = 0; i < that.channels.length; i++) {
			data[i].unshift(0.0);
			data[i].push(0.0);
			if ((that.channels[i] == "X" || that.channels[i] == "Y" || that.channels[i] == "Z") && that.showAcc) {
				edaContainer.append("path")
					.attr("d", that.lineAcc(data[i]))
				    .attr("class", that.channels[i])
				    .attr("id",that.channels[i]);
			}
			else {
				edaContainer.append("path")
					.attr("d", line(data[i]))
				    .attr("class", that.channels[i])
				    .attr("clip-path", "url(#edaclip)")
				    .attr("id",that.channels[i]);
			}
		}
		
		if(that.datasource.events && (that.datasource.events.length > 0)){
			//Cache event indexes for later use
			that.eventIdx = [];
			for (var i = 0; i < that.datasource.events.length; i++) {
				var d = that.datasource.events[i];
				that.eventIdx.push(d.index);
				console.log("Marker at " + d + "(" + that.datasource.x.invert(d.index) + "px in current coordinate space) or " + that.datasource.timeForOffset(d.index).toTimeString());
				edaContainer.append("circle")
					.datum(d)
					.attr("class","marker")
					.attr("title", function(d) {return that.unpackComment(d.comment + " | Time: " + that.datasource.timeForOffset(d.index).toTimeString());})
					.attr("cx", function(d) {return that.x(that.datasource.x.invert(d.index));})
					.attr("cy", function(d) {
						var x = Math.round(that.x(that.datasource.x.invert(d.index)));
						if (x < that.data[that.data.length - 1].length && x >= 0) {
							return that.y(that.data[that.data.length - 1][x]);
							
						}
						else {
							return 0;
						}
					})
					.attr("r", 3)
					.style("stroke","rgba(200,0,0,1.0)")
					.style("fill","rgba(200,0,0,0.5)")
					.style("stroke-width",2);
				
				$("circle.marker").tooltip({
					    "container": "body",
					    html: true,
					    "placement": "top"});
			
			}
		}
		if(that.datasource.rangeMarkers && (that.datasource.rangeMarkers.length > 0)){
			that.renderRangeMarkers(that.datasourceContainer,that.x,that.y);
		}
		if(that.readyCallback && !that.didLoad){
		   that.didLoad = true;
		   that.readyCallback(that);
		}
		
	
	};
	
	
	this.tooltip = function() {
		var mouse = d3.mouse(this);
		that.datasourceContainer.select("g.gtooltip circle")
		.attr("cx", mouse[0])
		.attr("cy", that.y(that.data[mouse[0]-that.p*2]))
		.attr("r", 8);
	
		that.datasourceContainer.select("text.gtooltip")
		.attr("x",d3.mouse(this)[0])
		.attr("y",d3.mouse(this)[1])
		.text(that.datasource.timeForOffset(that.datasource.x(mouse[0]- 2*that.p)).toTimeString() + " | " + that.datasource.y(mouse[1]- that.p).toFixed(2).toString());
	
	};
	
	this.mouseover = function() {
		var mouse = d3.mouse(this);
		that.datasourceContainer.append("svg:g")
			.attr("class", "gtooltip").enter()
			.append("svg:circle")
			.attr("class", that.channels[0].toLowerCase())
			.style("stroke-width",3)
			.attr("cx", mouse[0])
			.attr("cy", that.y(that.data[mouse[0]-that.p*2]))
			.attr("r", 8)
			.append("svg:text")
			.attr("class", "gtooltip")
			.attr("x",d3.mouse(this)[0])
			.attr("y",d3.mouse(this)[1])
			.attr("dy", -5)
			.attr("text-anchor", "middle")
			.text(that.datasource.timeForOffset(that.datasource.x(mouse[0]- 2*that.p)).toTimeString() + " | " + that.datasource.y(mouse[1]- that.p).toFixed(2).toString());
		/*
		that.datasourceContainer.select(this).on("mousemove", that.tooltip);
		that.datasourceContainer.select(this).on("mouseout", function() {
			that.datasourceContainer.select("g.tooltip").remove();
			that.datasourceContainer.select(this).on("mousemove", null);
		});
		*/
	}
	
	this.mousedown = function() {
		console.log( "Mouse click at: " + d3.mouse(this));
		that.zoom_rect.p1 = d3.mouse(this);
		that.zoom_rect.p2 = d3.mouse(this);
		//console.log(d3.mouse(this));
		$(that.graph).find("rect.zoomrect").tooltip("destroy");
		that.datasourceContainer.select("rect.zoomrect").remove(); //In case it already exists for some reason
		that.datasourceContainer
			.append("svg:rect")
			.attr("class", "zoomrect")
			.attr("x",that.zoom_rect.p1[0])
			.attr("y",that.zoom_rect.p1[1])
			.attr("title", "")
			.style("stroke","red")
			.style("stroke-width", 2)
			.style("fill", "rgba(255,0,0,0.2)")
			.attr("width", Math.abs(that.zoom_rect.p1[0] - that.zoom_rect.p2[0]))
			.attr("height", Math.abs(that.zoom_rect.p1[1] - that.zoom_rect.p2[1]));
			
		that.datasourceContainer.on("mousemove", function() {
			that.zoom_rect.p2 = d3.mouse(this);
			that.datasourceContainer.on("mouseup",that.mouseup);
			//console.log("Mouse move to: " + that.zoom_rect.p2);
			var x = [that.zoom_rect.p1[0],that.zoom_rect.p2[0]].min();	
			var y = [that.zoom_rect.p1[1],that.zoom_rect.p2[1]].min();		
			var zoom_w = Math.abs(that.zoom_rect.p1[0] - that.zoom_rect.p2[0]);
			var zoom_h = Math.abs(that.zoom_rect.p1[1] - that.zoom_rect.p2[1]);
			//console.log("Zoom Width: "+ zoom_w);
			
			var t1 = that.datasource.timeForOffset(that.datasource.x([that.zoom_rect.p1[0],that.zoom_rect.p2[0]].min()));
			var t2 = that.datasource.timeForOffset(that.datasource.x([that.zoom_rect.p1[0],that.zoom_rect.p2[0]].max()));
			if (that.autoscale) {
				that.datasourceContainer.select("rect.zoomrect")
					.attr("x", x)
					.attr("y", 0)
					.attr("title","<i class='icon-time'></i> " + t1.shortString() + " to " + t2.shortString())
					.attr("width", zoom_w)
					.attr("height", that.h);
					
				if ($(".tooltip-inner").length == 0) {
					$(that.graph).find("rect.zoomrect").tooltip({
						    "container": "body",
						    "placement": "top",
						    html: true,
						    trigger: "manual",
						    delay: { show: 0, hide: 1000 }}).tooltip("show");
				}	
				else {
					$(".tooltip-inner").first().html(that.datasourceContainer.select("rect.zoomrect").attr("title"));
					
				}
				
				
			}
			else {
				that.datasourceContainer.select("rect.zoomrect")
					.attr("x", x)
					.attr("y", y)
					.attr("width", zoom_w)
					.attr("height", zoom_h);
				
			}
			
		});
	
	}
	
	this.zoom = function(start, end, type) {
		try {
			
		
			var bounds = that.datasourceContainer[0][0].getBoundingClientRect();
			//console.log("Bounds: ");
			//console.log(bounds);
			if(!((start <= that.datasource.startTime) && (end >= that.datasource.endTime))){
				$(that.container).append(
					$("<button>")
						.addClass("btn")
						.addClass("clearButton")
						.css("display","block")
						.css("position","absolute")
						.css("left", $(that.container).width() - 44 - 108/2)
						.css("top",bounds.top + scrollY + that.p + 10)
						.html("<i class='icon-zoom-out'></i> Zoom Out")
						.on("click", function(e) {
							$(that.container).find("button.clearButton").remove();
							that.renderUpdate("full");
							if(that.onzoom != undefined){
								that.onzoom(that.datasource.startTime, that.datasource.endTime, "zoomout");
							}
							return false;
						})
				);
			
			}
			else {
				
			}
			if ((start == that.datasource.startTime) && (end == that.datasource.endTime)){
				$(that.container).find("button.clearButton").remove();
				
			}
			if((start == undefined) && (end == undefined)) {
				try {
					var xmin = ([that.zoom_rect.p1[0],that.zoom_rect.p2[0]].min() /*- that.p*2*/); //Account for padding
					var xmax = ([that.zoom_rect.p1[0],that.zoom_rect.p2[0]].max() /*- that.p*2*/); //Account for padding
					var ymin = ([that.zoom_rect.p1[1],that.zoom_rect.p2[1]].min() - that.p);//Account for padding
					var ymax = ([that.zoom_rect.p1[1],that.zoom_rect.p2[1]].max() - that.p); //Account for padding
				}
				catch (error) {
					
				}
			}
			//console.log("Start=" +start + " End=" + end);
			//validate input
			if (start < that.datasource.startTime) {
				start = that.datasource.startTime;
				console.log("Got start time: " + start + " that was earlier than EDA start time: " + that.datasource.startTime);
			}
			if (end > that.datasource.endTime) {
				end = that.datasource.endTime.sub(TimeDelta(1));
				console.log("Got end time: " + end + " that was later than EDA end time: " + that.datasource.endTime);
			}
			
			
			var range = {};
			if(start) {
				range.xmin = int(that.datasource.offsetForTime(start));
			}
			else {
				range.xmin = int(that.datasource.x(xmin));
			}
			if(isNaN(range.xmin) || (range.xmin < 0)) range.xmin = 0;
			
			if(end) {
				range.xmax = int(that.datasource.offsetForTime(end));
			}
			else {
				range.xmax = int(that.datasource.x(xmax));
			}
			if(isNaN(range.xmax) || (range.xmax > that.datasource.offsetForTime(that.datasource.endTime))){
				range.xmax = that.channels.map(function(c){return that.datasource.data[c].length;}).min();
			}
			
			range.ymin = that.datasource.y(ymax) || 0; //Note switched since height is measured from top left
			range.ymax = that.datasource.y(ymin) || 1; //Note switched since height is measured from top left
			console.log("Before onzoom with Start=" +that.datasource.timeForOffset(range.xmin) + " End=" + that.datasource.timeForOffset(range.xmax));
			that.currentRange = range;
			that.renderUpdate(range);
			//console.log(that.onzoom);
			if((that.onzoom != undefined) && ((start == undefined) && (end == undefined))){
				that.onzoom(that.datasource.timeForOffset(range.xmin), that.datasource.timeForOffset(range.xmax));
			}
		}
		catch (error) {
			console.log(error);
			that.onzoom(that.datasource.startTime, that.datasource.endTime, "zoomout");
			
		}
	};
	
	this.mouseup = function() {
		$(that.graph).find("rect.zoomrect").tooltip("destroy");
		that.datasourceContainer.on("mousemove", null);
	
		
		
		var zoom_w = Math.abs(that.zoom_rect.p1[0] - that.zoom_rect.p2[0]);
		var zoom_h = Math.abs(that.zoom_rect.p1[1] - that.zoom_rect.p2[1]);
		var start = that.datasource.timeForOffset( int( that.datasource.x( ([that.zoom_rect.p1[0],that.zoom_rect.p2[0]]).min() ) ) );
		var end = that.datasource.timeForOffset( int( that.datasource.x( ([that.zoom_rect.p1[0],that.zoom_rect.p2[0]]).max() ) ) );
		if (zoom_w > 3) {
			var ZOOM_ID = "ZOOM_ID_" + parseInt(Math.random()*1000,10).toString();
			var ADD_RANGE_ID = "ADD_RANGE_ID_" + parseInt(Math.random()*1000,10).toString();
			var COMMENT_ID = "COMMENT_ID_" + parseInt(Math.random()*1000,10).toString();
			var popoverContent = "<input type=\"text\" class=\"form-control\" placeholder=\"Comment\" id=\"COMMENT_ID\"><br /><div class=\"btn-group\"><button class='btn btn-default' id='ZOOM_ID'><i class='icon-zoom-in'></i> Zoom</button><button class='btn btn-primary' id='ADD_RANGE_ID'><i class='icon-map-marker'></i> Add Range Marker</button></div>".replace("ZOOM_ID",ZOOM_ID).replace("ADD_RANGE_ID",ADD_RANGE_ID).replace("COMMENT_ID",COMMENT_ID);
			
			$(that.graph).find("rect.zoomrect").popover({
				html: true,
				container: 'body',
				placement: 'top',
				trigger: 'manual',
				content: popoverContent
			});
			
			$(that.graph).find("rect.zoomrect").popover('show');
			
			$("button#"+ZOOM_ID).on("click", function() {
				$(that.graph).find("rect.zoomrect").popover('destroy');
				that.datasourceContainer.select("rect.zoomrect").remove();
				that.zoom();
			});
			
			$("button#"+ADD_RANGE_ID).on("click", function() {
				$(that.graph).find("rect.zoomrect").popover('destroy');
				that.datasourceContainer.select("rect.zoomrect").remove();
				var comment = $("input#" + COMMENT_ID).attr("value");
				that.addRangeMarker(start,end, comment);
				
			});
			
			
			
			
		}
		else {
			that.datasourceContainer.select("rect.zoomrect").remove();
		}
	};
	
	this.addRangeMarker = function(start,end, comment) {
		if (!that.datasource.hasOwnProperty("rangeMarkers")) {
			that.datasource.rangeMarkers = new Array();
		}
		console.log("Start: " + start + " End: " + end + " Comment: " + comment);
		that.datasource.rangeMarkers.push({"startTime":start,"endTime":end, "comment": comment});
		that.renderRangeMarkers(that.datasourceContainer,that.x,that.y);
		that.updateCache();
	
	};
	
	this.updateCache = function() {
		localStorage[that.datasource.hash()] = JSON.stringify({"rangeMarkers":that.datasource.rangeMarkers});
	
	};
	
	this.editRangeMarker = function(event) {
		var rect = this;
		console.log("Opening edit range marker dialogue");
		console.log(rect);
		that.datasourceContainer.on("mousedown",null);
		var DONE_ID = "DONE_ID_" + parseInt(Math.random()*1000,10).toString();
		var COMMENT_ID = "COMMENT_ID_" + parseInt(Math.random()*1000,10).toString();
		var REMOVE_ID = "REMOVE_ID_" + parseInt(Math.random()*1000,10).toString();
		var popoverContent = "<button class='btn btn-danger pull-left' id='REMOVE_ID'>Delete</button><button class='btn btn-default pull-right' id='DONE_ID'>Save</button>".replace("DONE_ID",DONE_ID).replace("REMOVE_ID",REMOVE_ID);
		d3.select(rect).on("mousedown", null);
		d3.select(rect).on("click", null);
		$(rect).attr("title",null);
		$(rect).attr("data-original-title",null);
		$(rect).popover({
			html: true,
			title: '<input type="text" class="form-control" placeholder="Comment" id="COMMENT_ID">'.replace("COMMENT_ID",COMMENT_ID),
			container: 'body',
			placement: 'top',
			trigger: 'manual',
			content: popoverContent
		});
		var x1 = $(rect).attr("x")*1.0;
		var x2 = x1 + $(rect).attr("width")*1.0;
		var leftHandle = that.datasourceContainer.append("svg:g")
			.attr("class", "rangemarker edit");
		leftHandle.append("svg:line")
				.style("stroke", "black")
				.style("stroke-width", "4")
				.style("cursor","pointer")
				.attr("y1", 0)
				.attr("y2", that.h)
				.attr("x1", x1)
				.attr("x2", x1);
		leftHandle.append("svg:circle")
			.attr("cx", x1)
			.attr("cy", 0)
			.attr("r", 5)
			.style("stroke", "black")
			.style("stroke-width", "2")
			.style("cursor","pointer");
		leftHandle.on("mousedown", function() {
			var handle = d3.select(this);
			that.datasourceContainer.on("mousemove", function() {
				var mousex = d3.mouse(this)[0];
				console.log("Left Handle: " + mousex);
				leftHandle.select("line").attr("x1",mousex);
				leftHandle.select("line").attr("x2", mousex);
				leftHandle.select("circle").attr("cx", mousex);
				d3.select(rect)
					.attr("x", leftHandle.select("line").attr("x1"))
					.attr("width", rightHandle.select("line").attr("x1")*1.0 - leftHandle.select("line").attr("x1")*1.0);
				
			});
			that.datasourceContainer.on("mouseup", function() {
				that.datasourceContainer.on("mousemove",null);
			});
		});
				
		var rightHandle = that.datasourceContainer.append("svg:g")
			.attr("class", "rangemarker edit");
		rightHandle.append("svg:line")
				.style("stroke", "black")
				.style("stroke-width", "4")
				.style("cursor","pointer")
				.attr("y1", 0)
				.attr("y2", that.h)
				.attr("x1", x2)
				.attr("x2", x2);
		rightHandle.append("svg:circle")
			.attr("cx", x2)
			.attr("cy", that.h)
			.attr("r", 5)
			.style("stroke", "black")
			.style("stroke-width", "2")
			.style("cursor","pointer");
		
		rightHandle.on("mousedown", function() {
					var handle = d3.select(this);
					that.datasourceContainer.on("mousemove", function() {
						var mousex = d3.mouse(this)[0];
						rightHandle.select("line").attr("x1",mousex);
						rightHandle.select("line").attr("x2", mousex);
						rightHandle.select("circle").attr("cx", mousex);
						d3.select(rect)
							.attr("x", leftHandle.select("line").attr("x1"))
							.attr("width", rightHandle.select("line").attr("x1")*1.0 - leftHandle.select("line").attr("x1")*1.0);
					});
					that.datasourceContainer.on("mouseup", function() {
						that.datasourceContainer.on("mousemove",null);
					});
				});
		$(rect).popover('show');
		var idx = d3.select(rect).attr("data-index")*1;
		$("input#" + COMMENT_ID).attr("value",that.datasource.rangeMarkers[idx].comment);
		$("button#"+DONE_ID).on("click", function() {
			$(rect).popover('destroy');
			leftHandle.remove();
			rightHandle.remove();
			that.datasourceContainer.on("mousedown",that.mousedown);
			var xmin = d3.select(rect).attr("x")*1.0;
			var xmax = d3.select(rect).attr("width")*1.0+xmin;
			var start = that.datasource.timeForOffset( int( that.datasource.x( xmin ) ) );
			var end = that.datasource.timeForOffset( int( that.datasource.x( xmax ) ) );
			var idx = d3.select(rect).attr("data-index")*1;
			
			that.datasource.rangeMarkers[idx] = {"startTime":start,"endTime":end, "comment":$("input#" + COMMENT_ID).attr("value") };
			that.renderRangeMarkers(that.datasourceContainer,that.x,that.y);
			that.updateCache();
		});	
		$("button#"+REMOVE_ID).on("click", function() {
			$(rect).popover('destroy');
			leftHandle.remove();
			rightHandle.remove();
			that.datasourceContainer.on("mousedown",that.mousedown);
			var idx = d3.select(rect).attr("data-index")*1;
			
			that.datasource.rangeMarkers.splice(idx,1);
			that.renderRangeMarkers(that.datasourceContainer,that.x,that.y);
			that.updateCache();
		});	
		
		
	
	};
	
	this.renderRangeMarkers = function(container,x,y) {
		if(that.datasource.hasOwnProperty("rangeMarkers")){
			console.log("Rendering range markers");
			container.selectAll("rect.rangemarker").remove();
			for (var i = 0; i < that.datasource.rangeMarkers.length; i++) {
				var marker = that.datasource.rangeMarkers[i];
				marker.startTime = new Date(marker.startTime);
				marker.endTime = new Date(marker.endTime);
				var markerRect = container.append("svg:rect")
					.attr("class","rangemarker")
					.attr("data-index",i)
					.attr("x", that.datasource.x.invert(that.datasource.offsetForTime(marker.startTime) ))
					.style("fill","#333")
					.style("opacity",0.8)
					.attr("y", 0)
					.attr("width", that.datasource.x.invert(that.datasource.offsetForTime(marker.endTime)) - that.datasource.x.invert(that.datasource.offsetForTime(marker.startTime) ))
					.attr("height", that.h)
					.on("click", that.editRangeMarker);
				console.log(markerRect);
			}
		}
	
	};
	
	this.updateCursor = function(time) {
		//console.log(time);
		var offset = that.datasource.offsetForTime(time);
		that.datasourceContainer.selectAll("line.cursor").remove();
		
		if (that.followCursor) {
			that.datasourceContainer.append("svg:line")
					.attr("class", "cursor")
					.style("stroke", "red")
					.style("stroke-width", "3")
					.attr("y1", 0)
					.attr("y2", that.h)
					.attr("x1", that.w/2.0)
					.attr("x2", that.w/2.0);
			
		}
		else {
			that.datasourceContainer.append("svg:line")
					.attr("class", "cursor")
					.style("stroke", "red")
					.style("stroke-width", "3")
					.attr("y1", 0)
					.attr("y2", that.h)
					.attr("x1", that.datasource.x.invert(offset))
					.attr("x2", that.datasource.x.invert(offset));
		}
	};
	
	this.renderUpdate = function(range) {
		if(range == "full" || range == undefined || range == null){
			var range = {};
			range.xmin = 0;
			range.xmax = that.channels.map(function(c){return that.datasource.data[c].length;}).min()-1;
			range.ymin = that.channels.map(function(c){return that.datasource.data[c].min();}).min();
			range.ymax = that.channels.map(function(c){return that.datasource.data[c].max();}).max();
		}
		that.currentRange = range;
		that.datasource.x = d3.scale.linear().domain([0, that.w]).range([range.xmin, range.xmax]);
		that.datasource.y = d3.scale.linear().domain([0, that.h]).range([range.ymax, range.ymin]);
		var target_points = ((range.xmax - range.xmin) > that.w) ? that.w : (range.xmax - range.xmin);
		
		that.datasource.getMultiChannelDataForOffsetRange(that.channels, range.xmin, range.xmax, target_points, that.updateSVG);
		
	
	};
	
	this.updateSVG = function(data) {
		console.log("Updating SVG");
		//Fix for weird array bug
		if(data.length > that.channels.length){
			console.log("It's happening again..");
			data = data.slice(1,data.length-1);
		}
		console.log(data);
		//that.datasource.x.domain([0, data.map(function(d){return d.length}).max()]);
		that.datasource.x.domain([0, that.w]);
		var x = d3.scale.linear().domain([0, data.map(function(d){return d.length}).max()]).range([0, that.w]);
		if(that.datasource.y && !that.autoscale){
			var yrange = [ that.datasource.y.range()[1], that.datasource.y.range()[0] ];
			var y = d3.scale.linear().domain(yrange).range([that.h, 0]);
		}
		else {
			if(that.showAcc) {
				var nonAccData = [];
				for (var i = 0; i < data.length; i++) {
					if (!(that.channels[i] == "X" || that.channels[i] == "Y" || that.channels[i] == "Z")) {
						nonAccData.push(data[i]);
					}
				}
				var y = d3.scale.linear().domain([nonAccData.map(function(d){return d.min();}).min(),nonAccData.map(function(d){return d.max();}).max()]).range([that.h*(2.0/3.0), 0]);
				
			}
			else {
				var y = d3.scale.linear().domain([data.map(function(d){return d.min();}).min(),data.map(function(d){return d.max();}).max()]).range([that.h, 0]);
			}
		}
		
		if (that.showAcc) {
			var accData = [];
			for (var i = 0; i < that.channels.length; i++) {
				if (that.channels[i] == "X" || that.channels[i] == "Y" || that.channels[i] == "Z") {
					accData.push(data[i]);
				}
			}
			
			that.y2 = d3.scale.linear().domain([accData.map(function(d) {return d.min();}).min(),accData.map(function(d) {return d.max();}).max()]).range([that.h,that.h*(2.0/3.0)+that.p/3]);
			var lineAcc = d3.svg.line()
			    .x(function(d,i) { return x(i); })
			    .y(function(d) { return  that.y2(d); });
			
		}
		that.x = x;
		that.y = y;
		that.datasourceContainer.select("#edaclip rect").attr("height",y.range().max()-y.range().min()).attr("y",y.range().min());
		var line = d3.svg.line()
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return  y(d); });
		that.data = data;
		
		that.renderGrid(that.datasourceContainer,that.channels[0],x,y);
		if ( that.showAcc) {
			that.renderGrid(that.datasourceContainer, "Acc", that.x,that.y2);
		}
		for (var i = 0; i < that.channels.length; i++) {
			data[i].unshift(0.0);
			data[i].push(0.0);
			
			console.log("Updating Data for " + that.channels[i]);
			if ( (that.channels[i] == "X" || that.channels[i] == "Y" || that.channels[i] == "Z") && that.showAcc) {
				that.datasourceContainer.select("#" + that.channels[i]).transition(500)
					.attr("d", lineAcc(data[i]));
				
			}
			else {
				that.datasourceContainer.select("#" + that.channels[i]).transition(500)
				.attr("d", line(data[i]));
			}
		}
		
		that.datasourceContainer.selectAll(".marker")
			.transition()
			.duration(500)
			.attr("cx", function(d) {return that.x(that.datasource.x.invert(d.index));})
			.style("opacity", function(d) {
				var x = Math.round(that.x(that.datasource.x.invert(d.index)));
				if (x < that.data[0].length && x >= 0) {
					return 1.0;
				}
				else {
					return 0.0;
				}
			})
			.attr("cy", function(d) {
				var x = Math.round(that.datasource.x.invert(d.index));
				if (that.showAcc) {
					if (x < nonAccData[nonAccData.length - 1].length && x >= 0) {
						return that.y(nonAccData[nonAccData.length-1][x]);
						
					}
					else {
						return 0;
					}
					
					
				}
				else if (x < that.data[that.data.length - 1].length && x >= 0) {
					
					return that.y(that.data[that.data.length-1][x]);
					
				}
				else {
					return 0;
				}
			});
		that.renderRangeMarkers(that.datasourceContainer,that.x,that.y);
			
		
	};
	
	this.renderGrid = function(edaContainer, channel, x, y,h,w) {
		var channel = channel || that.channels[0];
		var x = x || that.x;
		var y = y || that.y;
		var w = w || that.w;
		var h = h || (y.range().max()- y.range().min());
		var p = this.p;
		console.log("Rendering grid...");
		console.log(x.domain());
		console.log(x.range());
		that.datasourceContainer.selectAll("#background-rect-"+channel).remove();
//		if (that.datasourceContainer.select("rect#background-rect-"+channel)[0].length == 0) {
			var background = edaContainer.append("svg:rect")
								.attr("class", "background " +channel)
								.attr("id","background-rect-"+channel)
								.attr("x",0)
								.attr("y",y.range().min())
								.attr("width",w)
								.attr("height",h);
//		}
//		else {
//			var background = that.datasourceContainer.select("#background-rect-"+channel).attr("y",y.range().min()).attr("height",h);
//			
//			
//		}
		 //dynamicTimeTicks(edaContainer,data,data,10);
		 //console.log("Y Ticks:");
		 //console.log(y.ticks(10));
		 //console.log("X Ticks:");
		 //console.log(x.ticks(5));
		 
		 //Clear all
		 edaContainer.selectAll("g."+channel).remove();
		 
		 //Now, lets do the horizontal ticks
		 var xrule = edaContainer.selectAll("g.x."+channel)
		     .data(x.ticks(5))
		     .enter().append("svg:g")
		     .attr("class", "x "+channel);
		 xrule.append("svg:line")
		     .attr("class", "grid")
		     .style("shape-rendering", "crispEdges")
		     .attr("x1", x)
		     .attr("x2", x)
		     .attr("y1", y.range().min())
		     .attr("y2", y.range().max());
		var firstTick = x.ticks(5)[0];
		var lastTick = x.ticks(5)[4];
		var showDay = (that.datasource.timeForOffset(that.datasource.x(firstTick)).getDate() != that.datasource.timeForOffset(that.datasource.x(lastTick)).getDate());
		
		if (channel != "Acc") {
		     
		 xrule.append("svg:text")
		     .attr("class", "xText "+channel)
		     .attr("x", x)
		     .attr("y", that.h+10)
		     .attr("dy", ".35em")
		     .attr("text-anchor", "middle")
		 	 .text(function(d,i) {return that.datasource.timeForOffset(that.datasource.x(d)).shortString(showDay);});
		 }
		 
		 //Now do the vertical lines and labels
		 var nTicks = (h > 100) ? 10 : 3
		 var yrule = edaContainer.selectAll("g.y."+channel)
		     .data(y.ticks(nTicks))
		     .enter().append("svg:g")
		     .attr("class", "y " + channel);
		 
		 yrule.append("svg:line")
		     .attr("class", "grid " + channel)
		     .style("shape-rendering", "crispEdges")
		     .attr("x1", 0)
		     .attr("x2", w)
		     .attr("y1", y)
		     .attr("y2", y);
		 
		 yrule.selectAll(".yText").remove();
		 	yrule.append("svg:text")
		 	    .attr("class", "yText " + channel)
		 	    .attr("x", -3)
		 	    .attr("y", y)
		 	    .attr("dy", ".35em")
		 	    .attr("text-anchor", "end")
		 		.text(function(d,i) {return d.toFixed(2).toString()});
		 	
		 
		 //Now go add axis labels
		 that.datasourceContainer.selectAll("text.axis-label-"+channel).remove();
		 var label = "";
		 label = channel;
		 if (that.units.hasOwnProperty(channel)) {
			label += " (" + that.units[channel] + ")";
		 }
		 var labelCenter = y.range().min() + (y.range().max()- y.range().min())/2.0;
		 edaContainer.append("svg:text")
		 	.attr("class", "axis-label axis-label-"+channel)
		 	.attr("x", 0)
		 	.attr("y", labelCenter)
		 	.attr("dy", "0em")
		 	.attr("dx", "-"+p+"px")
		 	.attr("text-anchor", "middle")
		 	.attr("transform", "rotate(-90, " + -that.p + ", " + labelCenter+ ")")
		 	.text(label);
		 
		 that.datasourceContainer.selectAll("text.title").remove();
		 edaContainer.append("svg:text")
		 	.attr("class", "title")
		 	.attr("x", w/2)
		 	.attr("y", 0)
		 	.attr("dy", "-"+p/4+"px")
		 	.attr("dx", 0)
		 	.attr("text-anchor", "middle")
		 	.text(that.datasource.filename);	
		 
	}
	
};





var version = {build:120}
