

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
			//loadStyleSheet("./css/"+query.config.toLowerCase()+".css");
			//$.getScript("./css/"+query.config.toLowerCase()+".css", function(data, textStatus) {
				/*optional stuff to do after getScript */ 
			//});
			var sheet = "./css/"+query.config.toLowerCase()+".css";

			if (document.createStyleSheet){
                document.createStyleSheet(sheet);
            }
            else {
                $("head").append($("<link rel='stylesheet' href='"+sheet+"' type='text/css' media='screen' />"));
            }
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
		if (Modernizr.mq()) {
			if (window.matchMedia("(min-width: 600px)").matches) {
		  		$("#panel").css("display", "block");
				$("#toggleBtn").button("option","label","Map");
			}			
		}

	});
}

function SetPanel(){
	var cnt = 0;
	var total = config.panel.tools.length;
	$(config.panel.tools).each(function(i, tool){
		if (tool.script){
			$.getScript(tool.script, function(data, textStatus) {
				cnt+=1;
				//remove tool from config if load unsuccessful//
/*				if (!loaded){
					var idx = $.inArray(tool, config.panel.tools);
					config.panel.tools.splice(idx,1);
				}*/
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

// proper case string prptotype (JScript 5.5+)
String.prototype.toProperCase = function()
{
  return this.toLowerCase().replace(/^(.)|\s(.)/g, 
      function($1) { return $1.toUpperCase(); });
}

