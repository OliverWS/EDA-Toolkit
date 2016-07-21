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




