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
	var value = float(data & 1023)/10000.0;
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

Date.prototype.shortString = function() {
	return this.toLocaleTimeString();
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
