var SerialPort = function(port, opts) {
	var that = this;
	var opts = opts || {};
	that.baudrate = opts.baudrate || 9600;
	that.open_callback = opts.open_callback || function() {};
	that.callback = opts.callback || function(line) {console.log(">>" + line);};
	that.ser_id = "seriality_" + parseInt(Math.random()*1000).toString();
	that.poll_frequency = opts.polling_frequency || 10;
	that.port = port;
	//First need to add this object tag
	//<object type="application/Seriality" id="seriality" width="0" height="0"></object>
	var obj = document.createElement("object");
	obj.setAttribute("type","application/Seriality");
	obj.setAttribute("id",that.ser_id);
	obj.setAttribute("width",0);
	obj.setAttribute("height",0);
	document.body.appendChild(obj);
	that.serial = (document.getElementById(that.ser_id)).Seriality();
	that.open = false;
	that.buffer = new Array();
	that.retries = 10;


	that.begin = function(port) {
		if(port == undefined){var port = that.port;};
		setTimeout(function() {that.openPort(port);}, 10);
		
	
	}
	
	that.portDidOpen = function() {
		that.poll_lock = setInterval(that.poll, that.poll_frequency);
	}
	
	that.write = function(str) {
		that.serial.write(str);
	
	}
	
	that.end = function() {
		clearInterval(that.poll_lock);
		that.serial.end();
		that.open = false;
	}
	
	that.poll = function() {
		if (that.serial.available()) {
		  message = that.serial.readLine();
		  that.callback(message);
		  that.buffer.push(message);
		  
		}
	
	}
	
	
	that.openPort = function(port) {
		that.open = that.serial.begin(port, that.baudrate);
		that.retries--; 
		if(that.open){that.portDidOpen();}
		else {
			if(that.retries > 0){
				setTimeout(function() {that.openPort(port);}, 100);
			}
			else {
				throw "Could not open port: "+port;
			}
		}
		
	}
	
	


	if(that.port){that.begin(that.port);}
	
	return that;

};



