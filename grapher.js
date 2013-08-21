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
	
	this.addPicker = function() {
//		<div class="btn-toolbar">
//			<div class="btn-group">
//			  <a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
//			    Action
//			    <span class="caret"></span>
//			  </a>
//			  <ul class="dropdown-menu" id="channel-select">
//			    
//			  </ul>
//			</div>
//		</div>
		var root = $(that.container);
		$(that.container).prepend($("<div>").addClass("btn-toolbar").addClass("pull-right").css("margin-bottom",-50).append(
			$("<div>").addClass("btn-group").append(
				$("<a>").attr("class","btn dropdown-toggle").attr("data-toggle","dropdown").attr("href","#").html("Channels\n<span class='caret'></span>")
			).append(
				$("<ul>").addClass("dropdown-menu").attr("id","channel-select")
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
		
		$(root).find("#channel-select li a").on("click", function(evt) {
			$(this).toggleClass("selected-channel");
			var selectedChannels = [];
			$(root).find("#channel-select li a.selected-channel").each(function(i, el) {
				selectedChannels.push($(el).text());
			});
			console.log("New Selected Channels: " + selectedChannels);
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
		if ((that.datasource.channels.find("Tonic").length > 0) && (that.datasource.channels.find("Phasic").length > 0) ) {
			console.log("Turning on tonic and phasic since they are present");
			that.channels = ["EDA","Tonic","Phasic"];
		}
		
		var el = this.container;
		var p = ($(el).width()/5) < 25 ? ($(el).width()/5) : 25;
		that.w = $(el).width() - 3*p;
		that.h = $(el).height() - 2*p;
		//console.log("Length of eda is: " + that.datasource.data[that.channels[0]].length);
		that.datasource.x = d3.scale.linear().domain([0, that.w]).range([0, that.datasource.data.length]);
		that.datasource.y = d3.scale.linear().domain([0, that.h]).range([that.channels.map(function(d) {return that.datasource.data[d].max();}).max(), that.channels.map(function(d) {return that.datasource.data[d].min();}).min()]);
		
		localStorage.range = {xmin:0,xmax:that.datasource.data.length-1,ymin:0,ymax:10};
		
		that.datasource.getMultiChannelDataForOffsetRange(that.channels, 0, that.datasource.data.length-1, that.w, function(data) {
			that.renderSVG(data);
			
		});		
		
	};
	
	this.zoom_rect = {};
	
	this.setChannels = function(channels) {
		var validChannels = [];
		
		for (var i = 0; i < channels.length; i++) {
			var c = channels[i];
			if (that.datasource.data.hasOwnProperty(c)) {
				validChannels.push(c);
				if (that.channels.find(c).length == 0) {
					//This is a new channel
					that.datasourceContainer.append("path")
						.attr("d", "")
					    .attr("class", c.toLowerCase())
					    .attr("clip-path", "url(#edaclip)")
					    .attr("id",c);
					
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
		if (that.channels.find("X") > -1 || that.channels.find("Y") > -1 || that.channels.find("Z") > -1) {
			//that.showAcc = true;
		}
		else {
			that.showAcc = false;
		}
		that.renderUpdate();
		
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
		that.datasource.x.domain([0, data.map(function(d){return d.length}).max()]);
		//Set x according to the shortest waveform to ensure valid data for whole container
		var x = d3.scale.linear().domain([0, that.w]).range([0, w]);
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
			
			y2 = d3.scale.linear().domain([accData.map(function(d) {return d.min();}).min(),accData.map(function(d) {return d.max();}).max()]).range([that.h*(2.0/3.0), that.height]);
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
		    .attr("height", h + 3*p)
		    .on('mousedown',that.mousedown)
		    .on('mouseup',that.mouseup);
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
		
		
		that.renderGrid(edaContainer);
		
		for (var i = 0; i < that.channels.length; i++) {
			data[i].unshift(0.0);
			data[i].push(0.0);
			if ((that.channels[i] == "X" || that.channels[i] == "Y" || that.channels[i] == "Z") && that.showAcc) {
				edaContainer.append("path")
					.attr("d", that.lineAcc(data[i]))
				    .attr("class", that.channels[i].toLowerCase())
				    .attr("clip-path", "url(#edaclip)")
				    .attr("id",that.channels[i]);
			}
			else {
				edaContainer.append("path")
					.attr("d", line(data[i]))
				    .attr("class", that.channels[i].toLowerCase())
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
					.attr("title", function(d) {return d.comment + " | Time: " + that.datasource.timeForOffset(d.index).toTimeString()})
					.attr("cx", function(d) {return that.x(that.datasource.x.invert(d.index));})
					.attr("cy", function(d) {
						var x = Math.round(that.x(that.datasource.x.invert(d.index)));
						if (x < that.data[that.data.length-1].length && x >= 0) {
							return that.y(that.data[that.data.length-1][x]);
							
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
					    "placement": "top"});
			
			}
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
		//console.log( "Mouse click at: " + d3.mouse(this));
		that.zoom_rect.p1 = d3.mouse(this);
		that.zoom_rect.p2 = d3.mouse(this);
		that.datasourceContainer.select("rect.zoomrect").remove(); //In case it already exists for some reason
		that.datasourceContainer
			.append("svg:rect")
			.attr("class", "zoomrect")
			.attr("x",function() {return that.zoom_rect.p1[0];})
			.attr("y",function() {return that.zoom_rect.p1[1];})
			.style("stroke","red")
			.style("stroke-width", 2)
			.style("fill", "rgba(255,0,0,0)")
			.attr("width", Math.abs(that.zoom_rect.p1[0] - that.zoom_rect.p2[0]))
			.attr("height", Math.abs(that.zoom_rect.p1[1] - that.zoom_rect.p2[1]));
		that.datasourceContainer.on("mousemove", function() {
			var mouse = d3.mouse(this);
			that.zoom_rect.p2 = mouse;
			var x = (that.zoom_rect.p1[0] < that.zoom_rect.p2[0]) ? that.zoom_rect.p1[0] : that.zoom_rect.p2[0];	
			var y = (that.zoom_rect.p1[1] < that.zoom_rect.p2[1]) ? that.zoom_rect.p1[1] : that.zoom_rect.p2[1];		
			var zoom_w = Math.abs(that.zoom_rect.p1[0] - that.zoom_rect.p2[0]);
			var zoom_h = Math.abs(that.zoom_rect.p1[1] - that.zoom_rect.p2[1]);
			if (that.autoscale) {
				that.datasourceContainer.select("rect.zoomrect")
					.attr("x", x)
					.attr("y", 0)
					.attr("width", zoom_w)
					.attr("height", that.h);
				
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
		var bounds = that.datasourceContainer[0][0].getBoundingClientRect();
		//console.log("Bounds: ");
		//console.log(bounds);
		if(!((start == that.datasource.startTime) && (end == that.datasource.endTime))){
			$(that.container).append(
				$("<button>")
					.addClass("btn")
					.addClass("clearButton")
					.css("display","block")
					.css("position","absolute")
					.css("left", $(that.container).width() - 20 - 108/2)
					.css("top",bounds.top + scrollY + that.p + 10)
					.html("<i class='icon-zoom-out'></i> Zoom Out")
					.on("click", function(e) {
						$("button.clearButton").remove();
						that.renderUpdate("full");
						if(that.onzoom != undefined){
							that.onzoom(that.datasource.startTime, that.datasource.endTime, "zoomout");
						}
						return false;
					})
			);
		
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
		if(that.isEDA) {
			//console.log("Start=" +start + " End=" + end);
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
			if(isNaN(range.xmax) || (range.xmax > that.datasource.offsetForTime(that.datasource.endTime))) range.xmax = that.channels.map(function(c){return that.datasource.data[c].length;}).min();
			;
			
			range.ymin = that.datasource.y(ymax) || 0; //Note switched since height is measured from top left
			range.ymax = that.datasource.y(ymin) || 1; //Note switched since height is measured from top left
			console.log("Before onzoom with Start=" +that.datasource.timeForOffset(range.xmin) + " End=" + that.datasource.timeForOffset(range.xmax));
			that.renderUpdate(range);
		}
		else {
			that.updateSVG(that.data.slice(xmin, xmax));
		}
		//console.log(that.onzoom);
		if((that.onzoom != undefined) && ((start == undefined) && (end == undefined))){
			that.onzoom(that.datasource.timeForOffset(range.xmin), that.datasource.timeForOffset(range.xmax));
		}
	};
	
	this.mouseup = function() {
		that.datasourceContainer.on("mousemove", null);
		that.datasourceContainer.select("rect.zoomrect").remove();
		var zoom_w = Math.abs(that.zoom_rect.p1[0] - that.zoom_rect.p2[0]);
		var zoom_h = Math.abs(that.zoom_rect.p1[1] - that.zoom_rect.p2[1]);
		
		if (zoom_w > 3 && zoom_h > 3) {
			that.zoom();
		}
	};
	
	
	this.updateCursor = function(time) {
		//console.log(time);
		var offset = that.datasource.offsetForTime(time);
		
//		if (that.datasource.events && that.eventIdx && that.eventIdx.find(offset).length > 0) {
//		}
		//console.log("EDA offset for cursor: " + offset +" transformed: " + that.datasource.x.invert(offset) );
		that.datasourceContainer.selectAll("line.cursor").remove();
		that.datasourceContainer.append("svg:line")
				.attr("class", "cursor")
				.style("stroke", "red")
				.style("stroke-width", "3")
				.attr("y1", 0)
				.attr("y2", that.h)
				.attr("x1", that.datasource.x.invert(offset))
				.attr("x2", that.datasource.x.invert(offset));
	
	};
	
	this.renderUpdate = function(range) {
		if(range == "full" || range == undefined || range == null){
			var range = {};
			range.xmin = 0;
			range.xmax = that.channels.map(function(c){return that.datasource.data[c].length;}).min()-1;
			range.ymin = that.channels.map(function(c){return that.datasource.data[c].min();}).min();
			range.ymax = that.channels.map(function(c){return that.datasource.data[c].max();}).max();
		}
		localStorage.range = range;
		that.range = range;
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
		that.datasource.x.domain([0, data.map(function(d){return d.length}).max()]);
		
		var x = d3.scale.linear().domain([0, data.map(function(d){return d.length}).max()]).range([0, that.w]);
		if(that.datasource.y && !that.autoscale){
			var yrange = [ that.datasource.y.range()[1], that.datasource.y.range()[0] ];
			var y = d3.scale.linear().domain(yrange).range([that.h, 0]);
		}
		else {
			var y = d3.scale.linear().domain([data.map(function(d){return d.min();}).min(),data.map(function(d){return d.max();}).max()]).range([that.h, 0]);
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
			var 	lineAcc = d3.svg.line()
			    .x(function(d,i) { return x(i); })
			    .y(function(d) { return  y2(d); });
			
		}
		that.x = x;
		that.y = y;
		
		var line = d3.svg.line()
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return  y(d); });
		that.data = data;
		
		that.renderGrid(that.datasourceContainer, x, y);
		for (var i = 0; i < that.channels.length; i++) {
			data[i].unshift(0.0);
			data[i].push(0.0);
			
			console.log("Updating Data for " + that.channels[i]);
			that.datasourceContainer.select("#" + that.channels[i]).transition(500)
				.attr("d", line(data[i]));
		}
		
		that.datasourceContainer.selectAll(".marker")
			.transition()
			.duration(500)
			.attr("cx", function(d) {return that.x(that.datasource.x.invert(d.index));})
			.style("opacity", function(d) {
				var x = Math.round(that.x(that.datasource.x.invert(d.index)));
				if (x < that.data[that.data.length-1].length && x >= 0) {
					return 1.0;
				}
				else {
					return 0.0;
				}
			})
			.attr("cy", function(d) {
				var x = Math.round(that.datasource.x.invert(d.index));
				if (x < that.data[that.data.length-1].length && x >= 0) {
					return y(that.data[that.data.length-1][x]);
					
				}
				else {
					return 0;
				}
			});
			
		
	};
	
	this.renderGrid = function(edaContainer,x, y,h,w) {
		var w = w || this.w;
		var h = h || this.h;
		var x = x || this.x;
		var y = y || this.y;
		var p = this.p;
		var background = edaContainer.append("svg:rect")
							.attr("class", "background")
							.attr("id","background-rect")
							.attr("x",0)
							.attr("y",0)
							.attr("width",w)
							.attr("height",h);
		
		 //dynamicTimeTicks(edaContainer,data,data,10);
		 //console.log("Y Ticks:");
		 //console.log(y.ticks(10));
		 //console.log("X Ticks:");
		 //console.log(x.ticks(5));
		 
		 //Clear all
		 edaContainer.selectAll("g.x").remove();
		 edaContainer.selectAll("g.y").remove();
		 
		 //Now, lets do the horizontal ticks
		 var xrule = edaContainer.selectAll("g.x")
		     .data(x.ticks(5))
		     .enter().append("svg:g")
		     .attr("class", "x");
		 xrule.append("svg:line")
		     .attr("class", "grid")
		     .style("shape-rendering", "crispEdges")
		     .attr("x1", x)
		     .attr("x2", x)
		     .attr("y1", 0)
		     .attr("y2", h);
		
		     
		 xrule.append("svg:text")
		     .attr("class", "xText")
		     .attr("x", x)
		     .attr("y", h+10)
		     .attr("dy", ".35em")
		     .attr("text-anchor", "middle")
		 	 .text(function(d,i) {return that.datasource.timeForOffset(that.datasource.x(d)).shortString();});
		 
		 //Now do the vertical lines and labels
		 
		 var yrule = edaContainer.selectAll("g.y")
		     .data(y.ticks(10))
		     .enter().append("svg:g")
		     .attr("class", "y");
		 
		 yrule.append("svg:line")
		     .attr("class", "grid")
		     .style("shape-rendering", "crispEdges")
		     .attr("x1", 0)
		     .attr("x2", w)
		     .attr("y1", y)
		     .attr("y2", y);
		 yrule.selectAll(".yText").remove();
		 yrule.append("svg:text")
		     .attr("class", "yText")
		     .attr("x", -3)
		     .attr("y", y)
		     .attr("dy", ".35em")
		     .attr("text-anchor", "end")
		 	.text(function(d,i) {return d.toFixed(2).toString()});
		 //Now go add axis labels
		 that.datasourceContainer.selectAll("text.axis-label").remove();
		 var label = "";
		 for (var i = 0; i < 1; i++) {
		 		if (i > 0) {
		 			label += " | " + that.channels[i];
		 		}
		 		else {
		 			label = that.channels[i];
		 		}
		 		if (that.units.hasOwnProperty(that.channels[i])) {
		 			label += " (" + that.units[that.channels[i]] + ")";
		 		}
		 }
		 edaContainer.append("svg:text")
		 	.attr("class", "axis-label")
		 	.attr("x", 0)
		 	.attr("y", h/2)
		 	.attr("dy", "0em")
		 	.attr("dx", "-"+p+"px")
		 	.attr("text-anchor", "middle")
		 	.attr("transform", "rotate(-90, " + -that.p + ", " + h/2 + ")")
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




