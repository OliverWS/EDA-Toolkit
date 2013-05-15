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
	try:
		var tag = document.create(lib.type);
		tag.setAttribute("src", lib.src);
		if(type == "link"){
			tag.setAttribute("rel", "stylesheet");
		}
		else if (type == "script") {
			tag.setAttribute("type", "text/javascript");
		}
		document.head.appendChild(tag);
	catch (error) {
		if(window.console){
			console.log("Problem loading " + lib.src);
			console.log(error);
		}
	}
};

(function(){
	require(jquery);
	require(bootstrap_js);
	require(bootstrap_css);
	require(numjs);
	require(jquery_color);
	require(d3js);
	require(google_client);
	require(spin);
	require(eda_toolkit);
	require(dropzone);
	require(edadroplet);
	require(videodroplet);
	require(serial);



})();