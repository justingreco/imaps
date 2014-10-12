dojo.require("esri.map");
dojo.require("esri.layers.agstiled");
dojo.require("esri.layers.graphics");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.geometry");
dojo.require("esri.dijit.Popup");
dojo.require("esri.dijit.Geocoder");
dojo.require("esri.tasks.locator");
dojo.require("esri.layers.graphics");
dojo.require("esri.toolbars.edit");
dojo.require("esri.geometry.Circle")
//DO NOT REMOVE//
var map, ovmap, geomService;
var basemaps = [];
var imagelayers = [];
var opLayers = [];
var raleigh;
var inRaleigh = true;


var handlers = [];
var toolhandlers = [];
var drawhandlers = [];


var graphiclayerids = ['propertygl', 'selectgl'];

var drawtoolbar;
//
function mapinit(){
	esri.config.defaults.io.proxyUrl = "proxy.ashx";
	raleigh = GetRaleighBound();
	CreateMap();
	CreateBaseMapToggle();
	CreateToolbar();
}

function GetRaleighBound(){
	$.ajax({
		url:"raleigh_bound.txt",
		dataType:"json"
		,success:function(data){
			raleigh = new esri.geometry.Polygon(data);
		}
	});	

}

function CreateMap(){
require([
      "esri/map", 
      "esri/dijit/LocateButton",
      "esri/config",
      "esri/tasks/GeometryService",
      "esri/geometry/Extent",
      "dojo/domReady!"
    ], function(
      Map, LocateButton, esriConfig, GeometryService, Extent
    )  {
		//var popup = new esri.dijit.Popup({fillSymbol:new esri.symbol.SimpleFillSymbol(config.property.symbolMultiple)}, dojo.create("div"));
		esriConfig.defaults.io.proxyUrl = "proxy.ashx";
		raleigh = GetRaleighBound();

		geomService = GeometryService(config.map.geometry);
		map = new Map("mapdiv",{
			extent:new Extent(config.map.extent),
			logo:false,
			showAttribution:false
		});

		

	  //CreateLocationSearch();

		if(Modernizr.localstorage){
			if(localStorage[configName+"_extent"]){
				map.setExtent(new Extent($.parseJSON(localStorage.getItem(configName+"_extent"))));
			}
		}	

		if(Modernizr.localstorage){
			if(localStorage[configName+"_layers"]){
				config.map.oplayers = $.parseJSON(localStorage.getItem(configName+"_layers"));
			}
		}	
		AddBaseMap(config.map.baselayers[0]);
		handlers.push(dojo.connect(map, "onLoad", MapLoaded));
		handlers.push(dojo.connect(map,"onUnload",function(){
			$.each(toolhandlers, function(i, handler){
				dojo.disconnect(handler);
			});	

			DisconnectHandlers(toolhandlers);
			DisconnectHandlers(handlers);

			handlers = [];
			toolhandlers = [];
		}));
		handlers.push(dojo.connect(map, "onUpdateStart", function(){
			$("#maploading").css("display", "block");
		}));
		handlers.push(dojo.connect(map, "onUpdateEnd", function(){
			$("#maploading").css("display", "none");
		}))

		$(".expandable h3").click(function(e){
			if ($(this).parent().hasClass("collapsed")){
				$(this).parent().removeClass("collapsed");
				$(this).parent().addClass("expanded");
				/*if ($(this).parent().attr("id") == "tools"){
					MoveZoomSlider($(this).parent.width()+30);
				}*/	
			}else{
				$(this).parent().removeClass("expanded");
				$(this).parent().addClass("collapsed");		
				/*if ($(this).parent().attr("id") == "tools"){
					$(".esriSimpleSliderTL").css("cssText", "left: 100px !important");
				}	*/		
			}	

			if ($(this).parent().attr("id") == "tools"){
				MoveZoomSlider($(this).parent().width()+30);
			}	

		});

    });

}


function MapLoaded(){
	SetPanel();
	map.resize();
	var scalebar = new esri.dijit.Scalebar({map:map,attachTo:"bottom-left"});
	CreateOverviewMap();
	CreateDrawToolbar();
	AddBaseMaps();
	AddImageLayers();
	//AddOperationalLayers();
	AddLabelsLayer();
	AddGraphicsLayers();
	CreateCoordinateIndicator();

	CheckUrlObjects();
	handlers.push(dojo.connect(map, "onExtentChange", MapExtentChange));

	/*dojo.connect(map,"onLayerSuspend", LayerSuspended);
	dojo.connect(map,"onLayerResume", LayerResume);*/

}

function MoveZoomSlider(left){
	$(".esriSimpleSliderTL").css("cssText", "left: "+left+"px !important");
}




function MapExtentChange(extent){
	if (raleigh){
		inRaleigh = raleigh.contains(extent.getCenter());
		CheckAerialInRaleigh(inRaleigh);
	}

	if(Modernizr.localstorage){
		if(map.extent){
			localStorage.setItem(configName+"_extent", dojo.toJson(map.extent.toJson()));			
		}
	}

	$("#scalevalue").html(map.getScale());
}
var lastyear = "2012";
var lastInRaleigh = false;
function CheckAerialInRaleigh(inRaleigh){

	var aerialselect = $('.baseselect[name="aerials"]');
	if (aerialselect.parent().is(":visible")){
		var text = parseInt($('option:selected', aerialselect).text());
		var id = "image"+text.toString();
		if(!inRaleigh){
			$(".raleighImage").css("display","none");
			if (text > 2010){
				id = "image2010";
				$(aerialselect).val("2010").data("kendoDropDownList").text("2010");
			}else if (text > 2005 && text < 2010){
				id = "image2005";
				$(aerialselect).val("2005").data("kendoDropDownList").text("2005");
			}else if (text > 1999 && text < 2005){
				id = "image1999";
				$(aerialselect).val("1999").data("kendoDropDownList").text("1999");
			}
			ChangeBaseMap(id);	
			ChangeSelectedAerial(aerialselect, id);
			if(lastInRaleigh){
				lastyear = text;
			}
		}else{
			$(".raleighImage").css("display","block");
			if (!lastInRaleigh){
				$(aerialselect).val(lastyear.toString()).data("kendoDropDownList").text(lastyear.toString());
				id = "image"+lastyear;
				ChangeBaseMap(id);
				ChangeSelectedAerial(aerialselect,id);				
			}

		}
	
	}


	lastInRaleigh = inRaleigh;
}

function ChangeSelectedAerial(select,id){
	$("option", select).filter(function(){
		return $(this).val() == id.toString();
	}).prop('selected', true);
}

function CreateLayer(layer){
	var mapLayer = null;
	var opacity = 1.00;
	if(layer.opacity){
		opacity = layer.opacity;
	}
	switch (layer.type){
		case "tiled":
			mapLayer = new esri.layers.ArcGISTiledMapServiceLayer(layer.url,{visible:layer.visible, id:layer.id, name:layer.label, opacity:opacity});
			break;
		case "dynamic":
			mapLayer = new esri.layers.ArcGISDynamicMapServiceLayer(layer.url,{visible:layer.visible, id:layer.id, name:layer.label, opacity:opacity});
			if (layer.visiblelayers){
				mapLayer.setVisibleLayers(layer.visiblelayers);
			}
			break;
		case "image":
			mapLayer = new esri.layers.ArcGISImageServiceLayer(layer.url,{visible:layer.visible, id:layer.id, name:layer.label, opacity:opacity});
			break;
		case "feature":
			mapLayer = new esri.layers.FeatureLayer(layer.url,{visible:layer.visible, id:layer.id, name:layer.label, opacity:opacity});
			break;
	}	
	if(layer.minscale){
		mapLayer.setMinScale(layer.minscale);
	}
	return mapLayer;
}

function AddBaseMap(layer){
	var basemap = CreateLayer(layer);
	if (basemap){
		map.addLayer(basemap);
		basemaps.push(basemap);		
	}
}

function AddOperationalLayers(){
	$(config.map.oplayers).each(function(i, oplayer){
		if (oplayer.visible){
			var layer = CreateLayer(oplayer);
			map.addLayer(layer);
			opLayers.push(layer);
			handlers.push(dojo.connect(layer,"onOpacityChange", LayerUpdated));
			handlers.push(dojo.connect(layer,"onUpdateEnd", LayerUpdated));
			handlers.push(dojo.connect(layer,"onSuspend", LayerUpdated));
			handlers.push(dojo.connect(layer,"onResume", LayerUpdated));			
		}

	});
}

function AddLabelsLayer(){
	if (config.map.labels){
		var layer = CreateLayer(config.map.labels);
		map.addLayer(layer);
	}
}



function CreateDrawToolbar(){
	drawtoolbar = new esri.toolbars.Draw(map);
}

function AddGraphicsLayers(){
	$(graphiclayerids).each(function(i, id){
		var gl = new esri.layers.GraphicsLayer({id:id});
		map.addLayer(gl);
	});
}



function AddBaseMaps(){
	$(config.map.baselayers).each(function(i, layer){
		if (i > 0){
			AddBaseMap(layer);
		}
	});
	if(Modernizr.localstorage){
		localStorage.setItem(configName+"_layers", dojo.toJson(config.map.oplayers));			
	}
}

function AddImageLayers(){
	var imagelayer;
	$(config.map.imagelayers).each(function(i, layer){
		imagelayer = CreateLayer(layer);
		if (imagelayer){
			map.addLayer(imagelayer);	
			basemaps.push(imagelayer);	
		}
	});
}

function CreateCoordinateIndicator(){
	html = "<span id='ytext'>Northing: </span><span id='yvalue'></span><span id='xtext'> Easting: </span><span id='xvalue'></span>		Scale: <span id='scalevalue'></span>";
	$("footer").append(html);
	handlers.push(dojo.connect(map, "onMouseMove", MapMouseMoveHandler));
}

function MapMouseMoveHandler(e){
	var mp = e.mapPoint;
	$('#yvalue').html(Math.round(mp.y,0));
	$('#xvalue').html(Math.round(mp.x,0));
}

function CreateBaseMapToggle(){
	var html = "<div id='streetmapdiv' name='basemaps' class='basediv'><img src='img/selected/basemap.png'/><label for='streetmapdiv'>Street Map</div>";
	if(config.map.baselayers.length > 1){
		html+="<select id='streetSelect' name='basemaps' class='baseselect'>";
		$(config.map.baselayers).each(function(i, layer){
			html += "<option value='"+layer.id+"'>"+layer.label+"</option>";
		});
		html+="</select>";
	}
	html += "<div id='aerialsdiv' name='aerials' class='basediv'><img src='img/aerials.png'/>Aerials</div>";
	if(config.map.imagelayers.length > 1){
		html+="<select id='imageSelect' class='baseselect' name='aerials'>";
		$(config.map.imagelayers).each(function(i, layer){
			var classname = (layer.countywide)?"countyImage":"raleighImage";
			html += "<option value='"+layer.id+"' class='"+classname+"'>"+layer.label+"</option>";
		});
		html+="</select><div><input id='labelCheck' type='checkbox'/><label for='labelCheck' class='checklabel' style='font-size:10px'>Labels Off</label></div>";
	}




	$("#basemaps").append(html);


	$(".basediv").click(function(){
		inRaleigh = raleigh.contains(map.extent.getCenter());
		var name = $(this).attr("name");

		var src = $('.basediv[name!="'+name+'"] img').attr("src");
		$('.basediv[name!="'+name+'"] img').attr("src", src.replace("img/selected/", "img/"));
		src = $('.basediv[name="'+name+'"] img').attr("src");
		if (src.indexOf('selected') == -1){
			$('.basediv[name="'+name+'"] img').attr("src", src.replace("img/", "img/selected/"));	
			$('#basemaps .k-dropdown').toggle();	
			ChangeBaseMap($('.baseselect[name="'+name+'"] option:selected').val());		
			CheckAerialInRaleigh(inRaleigh);	
		}

	});

	$(".baseselect").change(function(){
		ChangeBaseMap($("option:selected", this).val());
		CheckAerialInRaleigh(inRaleigh);
	});

	$("#labelCheck").button().click(function(e){
		var layer = map.getLayer("labels");
		layer.setVisibility($(this).is(":checked"));
		var label = ($(this).is(":checked"))?"Labels On":"Labels Off";
		$(this).button('option','label',label)
	});

	$("label", $("#labelCheck").parent()).css("margin-top","5px");

	$(".baseselect").kendoDropDownList();
    $(".k-header", ".expandable").css("background-color", "#444");

   	$("#imageSelect").closest(".k-widget").hide();
}

function ChangeBaseMap(id){
	$(basemaps).each(function(i, basemap){
		if (basemap.id == id){
			basemap.setVisibility(true);
		}else{
			basemap.setVisibility(false);			
		}
	});
}

function CreateOverviewMap(){
   var overviewMapDijit = new esri.dijit.OverviewMap({
    map: map,
    visible: false,
    height:200,
    width:200,
    maximizeButton:false
  },dojo.byId("ovmapdiv"));
  $("#ovmap").css("height",200);
   $("#ovmap").css("width",200);

  overviewMapDijit.startup();


}



function CheckUrlObjects(){
	var urlObject = esri.urlToObject(window.location.href);
	if (urlObject.query){
		var query = urlObject.query;
		if (query.pins){
			var pins = query.pins.split(",");

           // var search = $("#accordion").propertySearch().data("plugin_propertySearch");
           // search.searchRealEstateAccounts(dojo.toJson(pins), "pin", false);			
		}//
	}
}


