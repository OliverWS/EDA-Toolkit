//This file goes through and loads a whole bunch of other stuff I use in almost every project

var jquery = {src:"http://code.jquery.com/jquery-1.9.1.min.js", type:"script"};

var bootstrap_js = {src:"//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/js/bootstrap.min.js", type:"script"};
var bootstrap_css = {src:"//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css", type:"link"};

var numjs = {src:"https://raw.github.com/OliverWS/js/master/numjs.js",type:"script"};
var jquery_color = {src:"https://raw.github.com/jquery/jquery-color/master/jquery.color.js", type:"script"};
var d3js = 	{src:"http://d3js.org/d3.v3.min.js", type:"script"};
var google_client = {src:"https://apis.google.com/js/client.js", type:"script"};
var spin = {src:"http://fgnass.github.com/spin.js/dist/spin.min.js",type:"script"};
var eda_toolkit = {src:"https://raw.github.com/OliverWS/js/master/eda_toolkit.js",type:"script"};
var dropzone = {src:"https://raw.github.com/OliverWS/js/master/dropzone.js", type:"script"};
var edadroplet = {src:"https://raw.github.com/OliverWS/js/master/edadroplet.js", type:"script"};
var videodroplet = {src:"https://raw.github.com/OliverWS/js/master/videodroplet.js", type:"script"};
var serial = {src:"https://raw.github.com/OliverWS/js/master/serial.js", type:"script"};

require = function(lib){
	if(window.console){
		console.log("Loading " + lib.src + "...");
	}
	try{
		var tag = document.createElement(lib.type);
		tag.setAttribute("src", lib.src);
		if(lib.type == "link"){
			tag.setAttribute("rel", "stylesheet");
		}
		else if (lib.type == "script") {
			tag.setAttribute("type", "text/javascript");
		}
		document.head.appendChild(tag);
		return tag;
	}
	catch (error) {
		if(window.console){
			console.log("Problem loading " + lib.src);
			console.log(error);
		}
	}
};

load = function(liblist, onComplete) {
	if(liblist.length == 0){
		onComplete();
	}
	else{
		var lib = liblist.slice(1);
		var node = require(lib);
		node.onload = function() {load(liblist,onComplete);};
	}

};
primaryIncludes = [jquery, spin, bootstrap_js, d3js, numjs];

var loadAdditionalLibs = function() {

	require(bootstrap_css);
	require(jquery_color);
	require(google_client);
	require(eda_toolkit);
	require(dropzone);
	require(edadroplet);
	require(videodroplet);
	require(serial);
	setTimeout(window.init, 100);
};

(function() {
	load(primaryIncludes, loadAdditionalLibs);

})();
