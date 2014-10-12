

//jQuery loaded
var config, configName;
$(document).ready(function(){
	dojo.ready(init);

});


function init(){
	
	LoadConfig();
	$("#maploading").progressbar({value:false, resizeable:false});
}

function LoadConfig(){
	var url = "./config/config.txt";
	configName = "imaps"
	var urlObject = esri.urlToObject(window.location.href);
	if (urlObject.query){
		var query = urlObject.query;
		if (query.config){
			configName += "_"+query.config.toLowerCase();
			url = "./config/"+query.config.toLowerCase()+".txt";
			loadStyleSheet("./css/"+query.config.toLowerCase()+".css");
		}
	}	
	$.ajax({
		url:url,
		dataType:"json",
		success:function(data){
			config = data;
			SetHeader();
			//SetPanel();
			SetDialog();
			CreateMap();
			CreateBaseMapToggle();
			CreateToolbar();
		}, error:function(error){

		}
	});
}

function SetHeader(){
	var html="<h2>"+config.title+"</h2><button id='toggleBtn'>Map</button>";
	$("header").append(html);
	$("#toggleBtn").button().click(function(){
		switch ($(this).text()){
			case "Map":
				$("#panel").css("display", "none");
				$("#toggleBtn").button("option","label","Search");
				break;
			case "Search":
				$("#panel").css("display", "block");
				$("#toggleBtn").button("option","label","Map");
				break;
		}
	});
	var menu = $("<div id='menubar'></div>");
	$("header").append(menu);
	menu.menubar();

	$(window).resize(function () {
		if (window.matchMedia("(min-width: 600px)").matches) {
	  		$("#panel").css("display", "block");
			$("#toggleBtn").button("option","label","Map");
		}
	});
}

function SetPanel(){
	var cnt = 0;
	var total = config.panel.tools.length;
	$(config.panel.tools).each(function(i, tool){
		if (tool.script){
			//load panel tool plugin//
			loadScript(tool.script, tool, function(loaded, tool){
				cnt+=1;
				//remove tool from config if load unsuccessful//
				if (!loaded){
					var idx = $.inArray(tool, config.panel.tools);
					config.panel.tools.splice(idx,1);
				}
				if (cnt == total){
					//initiate panel tool plugins//
					$(config.panel.tools).each(function(i,tool){
						if($("#accordion")[tool.plugin]){
							$("#accordion")[tool.plugin]();							
						}

					});
					//create accordion//
					$("#accordion").accordion({heightStyle:"fill", create:function(){
					     $("#accordion").accordion("refresh");    
					}});	
				}
			});
		}
	});
}

function SetDialog(){
	$("#dialog").dialog({autoOpen:false});

	$("#progressDialog").dialog({modal:true,autoOpen:false});
	$("#progressBar").progressbar({value:false, resizeable:false});
	$("#progressDialog").dialog().siblings('.ui-dialog-titlebar').remove()
	 //$($(".ui-dialog-titlebar"),$("#progressBar").parent()).hide();
	// $($(".ui-dialog-titlebar"),$("#dialog").parent()).show();
}

$(window).resize(function(){
	$("#accordion").accordion("refresh"); 
})

function ShowProgress(message){
	$("#progressMessage").html(message);
	$("#progressDialog").dialog("open");
}

function HideProgress(){
	$("#progressDialog").dialog("close");
}

function CreateDialogBox(id,title){
	var dialog = $("#"+id);
	if(dialog.length == 0) {
		dialog = $("<div id='"+id+"' class='tooldialog'></div>");
		$("body").append(dialog);
		dialog.dialog({autoOpen:false});
		dialog.dialog("option","title", title);
	}
	return dialog;
}

function DisconnectHandlers(handlers){
	$(handlers).each(function(i, handler){
		dojo.disconnect(handler);
	});

}


function loadScript(url, tool, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback(true, tool);
        };
        script.onerror= function(){
        	callback(false, tool);
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}



function loadStyleSheet( path, fn, scope ) {
   var head = document.getElementsByTagName( 'head' )[0], // reference to document.head for appending/ removing link nodes
       link = document.createElement( 'link' );           // create the link node
   link.setAttribute( 'href', path );
   link.setAttribute( 'rel', 'stylesheet' );
   link.setAttribute( 'type', 'text/css' );

   var sheet, cssRules;
// get the correct properties to check for depending on the browser
   if ( 'sheet' in link ) {
      sheet = 'sheet'; cssRules = 'cssRules';
   }
   else {
      sheet = 'styleSheet'; cssRules = 'rules';
   }

   var timeout_id = setInterval( function() {                     // start checking whether the style sheet has successfully loaded
          try {
             if ( link[sheet] && link[sheet][cssRules].length ) { // SUCCESS! our style sheet has loaded
                clearInterval( timeout_id );                      // clear the counters
                clearTimeout( timeout_id );
                fn.call( scope || window, true, link );           // fire the callback with success == true
             }
          } catch( e ) {} finally {}
       }, 10 ),                                                   // how often to check if the stylesheet is loaded
       timeout_id = setTimeout( function() {       // start counting down till fail
          clearInterval( timeout_id );             // clear the counters
          clearTimeout( timeout_id );
          head.removeChild( link );                // since the style sheet didn't load, remove the link node from the DOM
          fn.call( scope || window, false, link ); // fire the callback with success == false
       }, 15000 );                                 // how long to wait before failing

   head.appendChild( link );  // insert the link node into the DOM and start loading the style sheet

   return link; // return the link node;
}

// proper case string prptotype (JScript 5.5+)
String.prototype.toProperCase = function()
{
  return this.toLowerCase().replace(/^(.)|\s(.)/g, 
      function($1) { return $1.toUpperCase(); });
}

