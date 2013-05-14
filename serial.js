var SerialPort = function(port, opts) {
	var that = this;
	that.baudrate = opts.baudrate || 9600;
	that.open_callback = opts.open_callback || function() {};
	that.callback = opts.callback || function(line) {console.log(">>" + line);};
	that.ser_id = "seriality_" + parseInt(Math.random()*1000).toString();
	that.poll_frequency = opts.polling_frequency || 10;
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
	
	that.begin = function(port) {
		that.openPort(port,25);
		if(!that.open){
			throw "Could not open port: "+port;
			return;
		}
		that.poll_lock = setInterval(that.poll, that.poll_frequency);
	
	}
	
	that.end = function() {
		clearInterval(that.poll_lock);
		that.serial.end();
		that.open = false;
	}
	
	that.poll = function() {
		if (serial.available()) {
		  message = serial.readLine();
		  that.callback(message);
		}
	
	}
	
	
	that.openPort = function(port, n_retries) {
		n_retries = n_retries || 10;
		for (var i = 0; i < n_retries; i++) {
			that.open = that.serial.begin(port, that.baudrate);
			if(that.open){
				return;
			}
			
		}
		return;
	}
	
	



	return that;

};



