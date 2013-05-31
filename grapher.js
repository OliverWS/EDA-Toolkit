var Grapher = function(div, opts) {
	var that = this;
	this.container = div;
	this.unrendered = true;
	this.opts = opts || {};
	this.channel = this.opts.channel || "EDA";
	this.autoscale = this.opts.autoscale || true;
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
	this.plot = function(data) {
		if(that.spinner) {
		}
		else {
			that.spinner = new Spinner(that.spinOpts).spin(document.getElementById(that.graph[0].id));
			
		}
		if(data != undefined){
			//console.log(data);
			if(that.renderer == "svg"){
				if(that.unrendered) {
					if(data.isEDAFile){
						that.isEDA = true;
						that.renderEDA(data);
					}
					else {
						that.renderSVG(data);						
					}
					that.unrendered = false;
				}
				else {
					if(data.isEDAFile){
						that.updateEDA(data);
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
		that.spinner.stop();
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
	
	this.renderEDA = function(eda) {
		that.eda = eda;
		var el = this.container;
		var p = ($(el).width()/10) < 25 ? ($(el).width()/10) : 25;
		that.w = $(el).width() - 3*p;
		that.h = $(el).height() - 2*p;
		//console.log("Length of eda is: " + that.eda.data.EDA.length);
		that.eda.x = d3.scale.linear().domain([0, that.w]).range([0, that.eda.data.EDA.length]);
		that.eda.y = d3.scale.linear().domain([0, that.h]).range([that.eda.data.EDA.max(), 0]);
		that.eda.getDataForOffsetRange(that.channel, 0, that.eda.data.EDA.length-1, that.w, function(data) {
			that.renderSVG(data);
			
		});
		if (that.showACC) {
			that.eda.getDataForOffsetRange("acc", 0, that.eda.data.EDA.length-1, that.w, function(d) {
				that.renderACC(d);
			});
			
		}
		
		
	};
	
	this.zoom_rect = {};
	
	this.renderSVG = function(data, acc) {
		that.data = data;
		//console.log(data);
		//console.log("Rendering svg for " + data.length + " points");
		var p,w,h,el, edaContainer, line;
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
		var x = d3.scale.linear().domain([0, data.length]).range([0, w]);
		if(that.eda.y && !that.autoscale){
			//console.log("EDA Range: " + that.eda.y.range() + " | Data: " + data.min() + " to " + data.max());
			var yrange = [ that.eda.y.range()[1], that.eda.y.range()[0] ];
			var y = d3.scale.linear().domain(yrange).range([that.h, 0]);
		}
		else {
			var y = d3.scale.linear().domain([data.min(),data.max()]).range([that.h, 0]);
		}
		data.unshift(0.0);
		data.push(0.0);
		
		that.x = x;
		that.y = y;
		/*
		time = function(i) {
			var t = new Date(data.startTime);
			t.setTime(t.getTime() + i*data.fps*1000);
			return t.toLocaleTimeString();
		};
		*/
		
		line = d3.svg.line()
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return  y(d); });
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
		that.edaContainer = edaContainer;
		
		
		that.renderGrid(edaContainer);
		
		edaContainer.append("path")
			.attr("d", line(data))
		    .attr("class", that.channel.toLowerCase())
		    .attr("clip-path", "url(#edaclip)")
		    .attr("id",that.channel);
		
		if(that.eda.data.markers && (that.eda.data.markers.length > 0)){
			
			for (var i = 0; i < that.eda.data.markers.length; i++) {
				var d = that.eda.data.markers[i];
				console.log("Marker at " + d + "(" + that.eda.x.invert(d) + "px in current coordinate space) or " + that.eda.timeForOffset(d).toTimeString());
				edaContainer.append("circle")
					.datum(d)
					.attr("class","marker")
					.attr("title","Marker " + (i+1) + " | " + that.eda.timeForOffset(d).toTimeString())
					.attr("cx", function(d) {return that.eda.x.invert(d);})
					.attr("cy", function(d) {return that.y(that.data[Math.round(that.eda.x.invert(d))]);})
					.attr("r", 5)
					.style("stroke","red")
					.style("fill","none")
					.style("stroke-width",2);
				
				$("circle.marker").tooltip({
					    "container": "body",
					    "placement": "top"});
			
			}
		}
		
	
	};
	
	this.renderACC = function(acc) {
		var p = that.p;
		var x = that.x;		
		if(that.eda.accY && !that.autoscale){
			//console.log("EDA Range: " + that.eda.y.range() + " | Data: " + data.min() + " to " + data.max());
			var accyrange = [ that.eda.accY.range()[1], that.eda.accY.range()[0] ];
			var accY = d3.scale.linear().domain(accyrange).range([that.h/2, 0]);
		}
		else {
			var accY = d3.scale.linear().domain([acc.map(function(d) {return d.min();}).min(),acc.map(function(d) {return d.max();}).max()]).range([that.h/2, 0]);
			that.eda.accY = accY;
		}
		accLine = d3.svg.line()
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return  accY(d); });
		
		
		that.accLine = accLine;
		accContainer = that.svg.append("g").attr("class","accContainer").attr("transform", "translate(" + 2*p + "," + (that.h + p) + ")");
		accContainer.append("defs").append("svg:clipPath")
		.attr("id", "accclip")
		.append("svg:rect")
		.attr("id", "clip-rect")
		.attr("x", "0")
		.attr("y", "0")
		.attr("width", that.w)
		.attr("height", that.h/2);
		
		that.accContainer = accContainer;
		that.renderGrid(accContainer,x,accY,that.h/2);
		
		accContainer.append("path")
			.attr("d", accLine(acc[0]))
		    .attr("class", "accX")
		    .attr("clip-path", "url(#accclip)")
		    .attr("id","accX");
		accContainer.append("path")
			.attr("d", accLine(acc[1]))
		    .attr("class", "accY")
		    .attr("clip-path", "url(#accclip)")
		    .attr("id","accY");
		accContainer.append("path")
			.attr("d", accLine(acc[2]))
		    .attr("class", "accZ")
		    .attr("clip-path", "url(#accclip)")
		    .attr("id","accZ");
		
		
	
	
	};
	
	this.renderFeatures = function(featurePoints) {
		that.edaContainer.append("svg:g")
			.attr("class", "features")
			.data(featurePoints)
			.enter().append("svg:circle")
			.attr("cx", function(d,i) {return that.eda.x.invert(d);})
			.attr("cy", function(d,i) {return that.y(that.data[mouse[0]-that.p*2]);})
			.style("stroke-width",3)
			.attr("r", 5);
			
	
	
	};
	
	this.tooltip = function() {
		var mouse = d3.mouse(this);
		that.edaContainer.select("g.gtooltip circle")
		.attr("cx", mouse[0])
		.attr("cy", that.y(that.data[mouse[0]-that.p*2]))
		.attr("r", 8);
	
		that.edaContainer.select("text.gtooltip")
		.attr("x",d3.mouse(this)[0])
		.attr("y",d3.mouse(this)[1])
		.text(that.eda.timeForOffset(that.eda.x(mouse[0]- 2*that.p)).toTimeString() + " | " + that.eda.y(mouse[1]- that.p).toFixed(2).toString());
	
	};
	
	this.mouseover = function() {
		var mouse = d3.mouse(this);
		that.edaContainer.append("svg:g")
			.attr("class", "gtooltip").enter()
			.append("svg:circle")
			.attr("class", that.channel.toLowerCase())
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
			.text(that.eda.timeForOffset(that.eda.x(mouse[0]- 2*that.p)).toTimeString() + " | " + that.eda.y(mouse[1]- that.p).toFixed(2).toString());
		/*
		that.edaContainer.select(this).on("mousemove", that.tooltip);
		that.edaContainer.select(this).on("mouseout", function() {
			that.edaContainer.select("g.tooltip").remove();
			that.edaContainer.select(this).on("mousemove", null);
		});
		*/
	}
	
	this.mousedown = function() {
		//console.log( "Mouse click at: " + d3.mouse(this));
		that.zoom_rect.p1 = d3.mouse(this);
		that.zoom_rect.p2 = d3.mouse(this);
		that.edaContainer.select("rect.zoomrect").remove(); //In case it already exists for some reason
		that.edaContainer
			.append("svg:rect")
			.attr("class", "zoomrect")
			.attr("x",function() {return that.zoom_rect.p1[0];})
			.attr("y",function() {return that.zoom_rect.p1[1];})
			.style("stroke","red")
			.style("stroke-width", 2)
			.style("fill", "rgba(255,0,0,0)")
			.attr("width", Math.abs(that.zoom_rect.p1[0] - that.zoom_rect.p2[0]))
			.attr("height", Math.abs(that.zoom_rect.p1[1] - that.zoom_rect.p2[1]));
		that.edaContainer.on("mousemove", function() {
			var mouse = d3.mouse(this);
			that.zoom_rect.p2 = mouse;
			var x = (that.zoom_rect.p1[0] < that.zoom_rect.p2[0]) ? that.zoom_rect.p1[0] : that.zoom_rect.p2[0];	
			var y = (that.zoom_rect.p1[1] < that.zoom_rect.p2[1]) ? that.zoom_rect.p1[1] : that.zoom_rect.p2[1];		
			var zoom_w = Math.abs(that.zoom_rect.p1[0] - that.zoom_rect.p2[0]);
			var zoom_h = Math.abs(that.zoom_rect.p1[1] - that.zoom_rect.p2[1]);
			if (that.autoscale) {
				that.edaContainer.select("rect.zoomrect")
					.attr("x", x)
					.attr("y", 0)
					.attr("width", zoom_w)
					.attr("height", that.h);
				
			}
			else {
				that.edaContainer.select("rect.zoomrect")
					.attr("x", x)
					.attr("y", y)
					.attr("width", zoom_w)
					.attr("height", zoom_h);
				
			}
			
		});
	
	}
	
	this.zoom = function(start, end, type) {
		var bounds = that.edaContainer[0][0].getBoundingClientRect();
		//console.log("Bounds: ");
		//console.log(bounds);
		if(!((start == that.eda.startTime) && (end == that.eda.endTime)) && $("button.clearButton").length == 0){
			$(that.container).append(
				$("<button>")
					.addClass("btn")
					.addClass("clearButton")
					.css("display","block")
					.css("position","absolute")
					.css("left", bounds.left + bounds.width - 2*that.p - 10)
					.css("top",bounds.top + scrollY + that.p + 10)
					.html("<i class='icon-zoom-out'></i> Zoom Out")
					.on("click", function(e) {
						$("button.clearButton").remove();
						that.updateEDA("full");
						if(that.onzoom != undefined){
							that.onzoom(that.eda.startTime, that.eda.endTime, "zoomout");
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
				range.xmin = int(that.eda.offsetForTime(start));
			}
			else {
				range.xmin = int(that.eda.x(xmin));
			}
			if(isNaN(range.xmin) || (range.xmin < 0)) range.xmin = 0;
			
			if(end) {
				range.xmax = int(that.eda.offsetForTime(end));
			}
			else {
				range.xmax = int(that.eda.x(xmax));
			}
			if(isNaN(range.xmax) || (range.xmax > that.eda.offsetForTime(that.eda.endTime))) range.xmax = that.eda.data["EDA"].length-1;
			
			range.ymin = that.eda.y(ymax) || 0; //Note switched since height is measured from top left
			range.ymax = that.eda.y(ymin) || 1; //Note switched since height is measured from top left
			console.log("Before onzoom with Start=" +that.eda.timeForOffset(range.xmin) + " End=" + that.eda.timeForOffset(range.xmax));
			that.updateEDA(range);
		}
		else {
			that.updateSVG(that.data.slice(xmin, xmax));
		}
		//console.log(that.onzoom);
		if((that.onzoom != undefined) && ((start == undefined) && (end == undefined))){
			that.onzoom(that.eda.timeForOffset(range.xmin), that.eda.timeForOffset(range.xmax));
		}
	};
	
	this.mouseup = function() {
		that.edaContainer.on("mousemove", null);
		that.edaContainer.select("rect.zoomrect").remove();
		var zoom_w = Math.abs(that.zoom_rect.p1[0] - that.zoom_rect.p2[0]);
		var zoom_h = Math.abs(that.zoom_rect.p1[1] - that.zoom_rect.p2[1]);
		
		if (zoom_w > 3 && zoom_h > 3) {
			that.zoom();
		}
	};
	
	this.updateCursor = function(time) {
		//console.log(time);
		var offset = that.eda.offsetForTime(time);
		//console.log("EDA offset for cursor: " + offset +" transformed: " + that.eda.x.invert(offset) );
		that.edaContainer.selectAll("line.cursor").remove();
		that.edaContainer.append("svg:line")
				.attr("class", "cursor")
				.style("stroke", "red")
				.style("stroke-width", "3")
				.attr("y1", 0)
				.attr("y2", that.h)
				.attr("x1", that.eda.x.invert(offset))
				.attr("x2", that.eda.x.invert(offset));
	
	};
	
	this.updateEDA = function(range) {
		if(range == "full" || range == undefined || range == null){
			var range = {};
			range.xmin = 0;
			range.xmax = that.eda.data.EDA.length - 1;
			range.ymin = that.eda.data.EDA.min();
			range.ymax = that.eda.data.EDA.max();
		}
		localStorage.range = range;
		var channel = range.channel || that.channel;

		that.eda.x = d3.scale.linear().domain([0, that.w]).range([range.xmin, range.xmax]);
		that.eda.y = d3.scale.linear().domain([0, that.h]).range([range.ymax, range.ymin]);
		var target_points = ((range.xmax - range.xmin) > that.w) ? that.w : (range.xmax - range.xmin);
		
		that.eda.getDataForOffsetRange(channel, range.xmin, range.xmax, target_points, that.updateSVG);
		
	
	};
	
	this.updateSVG = function(data) {
		var x = d3.scale.linear().domain([0, data.length]).range([0, that.w]);
		if(that.eda.y && !that.autoscale){
			//console.log("EDA Range: " + that.eda.y.range() + " | Data: " + data.min() + " to " + data.max());
			var yrange = [ that.eda.y.range()[1], that.eda.y.range()[0] ];
			var y = d3.scale.linear().domain(yrange).range([that.h, 0]);
		}
		else {
			var y = d3.scale.linear().domain([data.min(),data.max()]).range([that.h, 0]);
		}
		data.unshift(0.0);
		data.push(0.0);
		
		that.x = x;
		that.y = y;
		var line = d3.svg.line()
		    .x(function(d,i) { return x(i); })
		    .y(function(d) { return  y(d); });
		that.data = data;
		that.renderGrid(that.edaContainer, x, y);
				
		that.edaContainer.select("#EDA").transition(500)
			.attr("d", line(data));
		that.edaContainer.selectAll(".marker")
			.transition()
			.duration(500)
			.attr("cx", function(d) {return that.eda.x.invert(d);})
			.style("opacity", function(d) {
				var x = Math.round(that.eda.x.invert(d));
				if (x < that.data.length && x >= 0) {
					return 1.0;
				}
				else {
					return 0.0;
				}
			})
			.attr("cy", function(d) {
				var x = Math.round(that.eda.x.invert(d));
				if (x < that.data.length && x >= 0) {
					return that.y(that.data[x]);
					
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
		 	 .text(function(d,i) {return that.eda.timeForOffset(that.eda.x(d)).shortString();});
		 
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
		 that.edaContainer.selectAll("text.axis-label").remove();
		 edaContainer.append("svg:text")
		 	.attr("class", "axis-label")
		 	.attr("x", 0)
		 	.attr("y", h/2)
		 	.attr("dy", "0em")
		 	.attr("dx", "-"+p+"px")
		 	.attr("text-anchor", "middle")
		 	.attr("transform", "rotate(-90, " + -that.p + ", " + h/2 + ")")
		 	.text("EDA (" + "\u03BC"  + "S)");
		 that.edaContainer.selectAll("text.title").remove();
		 edaContainer.append("svg:text")
		 	.attr("class", "title")
		 	.attr("x", w/2)
		 	.attr("y", 0)
		 	.attr("dy", "-"+p/4+"px")
		 	.attr("dx", 0)
		 	.attr("text-anchor", "middle")
		 	.text(that.eda.filename);	
		 
	}
	
};




