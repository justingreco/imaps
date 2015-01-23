dojo.require("esri.tasks.identify");
dojo.require("esri.tasks.PrintTask");
dojo.require("esri.toolbars.draw");

var idcnt = 0;
var idtotal = 0;
var idfeatures = [];

var idpnt;

function CreateToolbar(){

	var toollist = $("<ul class='toolbar'></ul>");
	$("#tools").append(toollist);

	var cnt = 0;
	var total = config.tools.length;

	var tools = [];

	$(config.tools).each(function(i,tool){
		//load jquery plugin//
		if (tool.script){
			
			//loadTool(tool.script, tool, function(loaded, tool){
			$.getScript(tool.script, function(data, textStatus) {
				/*optional stuff to do after getScript */ 
			
				cnt+=1;
/*				if (!loaded){
					var idx = $.inArray(tool, config.tools);
					config.tools.splice(idx,1);
				}*/
				if (cnt == total){

					$(config.tools).each(function(i,tool){
						var toolitem = $("<li class='tool'></li>");
						toollist.append(toolitem);
						$(toolitem)[tool.plugin]({config:config, tool:tool, map:map});
					});

					$(".tool.toggle").click(function(){
						if ($(this).text() != "Select"){
							$(".selectpanel").css("display", "none");							
							MoveZoomSlider($("#tools").width()+30);
						}
						drawtoolbar.deactivate();
						ChangeSelectedToggleItem(this);
					});
					$(".tool").click(function(){
						if ($(this).text() != "Select"){
							$(".selectpanel").css("display", "none");	
							if ($(".selectpanel img")) {
								$(".selectpanel img").attr("src",$(".selectpanel img").attr("src").replace("_selected", "_default"));
							}
							MoveZoomSlider($("#tools").width()+30);
						}
						drawtoolbar.deactivate();
						ChangeSelectedToggleItem(this);
					});					
				}

			});
		}
	});
}

function ChangeSelectedToggleItem(item){
	if ($(item).hasClass('toggle')) {
				$(".k-window .k-window-content").each(function(index, element){
			  $(element).data("kendoWindow").close();
			});		
	}

	$(".tool").each(function(i, tool){
		$("img", tool).attr("src",$("img", tool).attr("src").replace("_selected", "_default"));
		$(tool).removeClass("active");
	});
	$("img", item).attr("src",$("img", item).attr("src").replace("_default", "_selected"));
	$(item).addClass("active");
}


function loadTool(url, tool, callback){

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