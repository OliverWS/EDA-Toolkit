/* inject.js
 * author: dansajin@web.de
 * desc: asynchronous resource loader with callback
 * scope: loads js and css files async
 * usage: inject.js('filepath',callback()); or inject.css('filepath',callback());
 * licence: none
 */

(function (window,document) {
  
  // stateless variables 
  var appent_to = document.head || document.getElementsByTagName("head")[0];
  
  // tests 
  function is_func(func) { return Object.prototype.toString.call(func) == "[object Function]"; }
  
  // load ressource by injecting it 
  function load(file,callback){
    // inject script or link element 
    appent_to.appendChild(file);
    // run our callback 
    execute_callback(file,callback);
  }
  
  // run our callback 
  function execute_callback(file,callback){
    // bind listeners only if we need them 
    if (is_func(callback)) { 
      // listen for onload or state changes in IE 
      file.onload = file.onreadystatechange = function () {
        var state = this.readyState;
        if ( !callback.done && (!state || /loaded|complete/.test(state)) ) {
          callback.done = true;
          /*
          // remove listeners because of memory leak in IE 
          file.onload = file.onreadystatechange = null;
          */
          callback();
        }
      }
    }
  }
  
  // public objects 
  function scriptTag(url,callback){
    // create the script element and set properties 
    var script = document.createElement("script");
    script.async = false;
    script.src = url;
    // request script 
    load(script,callback);
  }
  
  function linkTag(url,callback){
    // create the link element and set properties 
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    // request link 
    load(link,callback);
  }
  
  // object api 
  function create_sandbox(){
    return {
      js : scriptTag,
      css : linkTag
    }
  }
  
  // create main api 
  window.inject = create_sandbox()
})(window,document);




/*

<script src="http://d3js.org/d3.v3.min.js"></script>	
<script src="http://code.jquery.com/jquery-1.8.0.min.js" type="text/javascript"></script>
<script src="http://codeorigin.jquery.com/ui/1.10.3/jquery-ui.min.js" type="text/javascript"></script>
<script src="http://fgnass.github.com/spin.js/dist/spin.min.js" type="text/javascript"></script>
<script src="https://rawgithub.com/timrwood/moment/2.1.0/min/moment.min.js" type="text/javascript"></script>
<!-- Video JS -->
<link href="http://vjs.zencdn.net/c/video-js.css" rel="stylesheet">
<script src="http://vjs.zencdn.net/c/video.js"></script>

<!--Bootstrap -->
<link href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap-theme.min.css">
<script src="//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js"></script>
<link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.min.css" rel="stylesheet">		
<link rel="stylesheet" href="css/graph.css" type="text/css" />

*/

//inject.js('//d3js.org/d3.v3.min.js');
//inject.js('//codeorigin.jquery.com/ui/1.10.3/jquery-ui.min.js');
//inject.js('//jquery.eiremedia.netdna-cdn.com/plugins/misc/spin.js/spin.min.js');
//inject.js('//rawgithub.com/timrwood/moment/2.1.0/min/moment.min.js');
//inject.js('//vjs.zencdn.net/c/video.js');
//inject.css('//vjs.zencdn.net/c/video-js.css');
//inject.css('//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css');
//inject.css('//netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap-theme.min.css');
//inject.js('//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js');
//inject.css('//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.min.css');
//inject.css('css/graph.css');
//

