;(function ( $, window, document, undefined ) {
    var pluginName = "mapplugin",
		defaults = {
		};
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }
    Plugin.prototype = {
        init: function() {
            require(['esri/map', 'esri/dijit/LocateButton', 'esri/dijit/HomeButton', 'esri/config', 'esri/tasks/GeometryService', 'esri/geometry/Extent', 'esri/layers/ArcGISTiledMapServiceLayer', 'esri/layers/ArcGISDynamicMapServiceLayer', 'esri/layers/ArcGISImageServiceLayer', 'esri/layers/FeatureLayer', 'esri/geometry/Polygon', 'esri/dijit/OverviewMap', 'esri/toolbars/draw', 'esri/layers/GraphicsLayer','dojo/domReady!'], function (Map, LocateButton, HomeButton, esriConfig, GeometryService, Extent, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, FeatureLayer, Polygon, OverviewMap, Draw, GraphicsLayer) {    
                esriConfig.defaults.io.proxyUrl = "proxy.ashx";
                raleigh = GetRaleighBound();
                geomService = GeometryService(config.map.geometry);
                map = new Map("mapdiv",{
                    extent:new Extent(config.map.extent),
                    logo:false,
                    showAttribution:false
                });

                homeButton = new esri.dijit.HomeButton({
                  map: map,
                  extent: new Extent(config.map.extent),
                  visible: true
                }, "HomeButton");
                homeButton.startup(); 
                             
                geoLocate = new LocateButton({
                    map: map,
                    scale: 1200
                  }, "LocateButton");
                  geoLocate.startup();  

                GetStoredConfig();
                AddBaseMap(config.map.baselayers[0]);
                AddMapEvents();
                function CheckAerialInRaleigh(inRaleigh){
                    var aerialselect = $('.baseselect[name="aerials"]');
                    if (aerialselect.parent().is(":visible")){
                        var text = parseInt($('option:selected', aerialselect).text());
                        var id = "image"+text.toString();
                        if(!inRaleigh){
                            $(".raleighImage").css("display","none");
                            if (text > 2013) {
                                 id = "image2010";
                                $(aerialselect).val("2010").data("kendoDropDownList").text("2013");
                            }
                            else if (text > 2010 && text < 2013){
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
                function ChangeBaseMap(id){
                    $(basemaps).each(function(i, basemap){
                        if (basemap.id == id){
                            basemap.setVisibility(true);
                        }else{
                            basemap.setVisibility(false);           
                        }
                    });
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
                function CheckUrlObjects(){
                    var urlObject = esri.urlToObject(window.location.href);
                    if (urlObject.query){
                        var query = urlObject.query;
                        if (query.pins){
                            var pins = query.pins.split(",");       
                        }
                    }
                }
                function MapMouseMoveHandler(e){
                    var mp = e.mapPoint;
                    $('#yvalue').html(Math.round(mp.y,0));
                    $('#xvalue').html(Math.round(mp.x,0));
                }
                function CreateCoordinateIndicator(){
                    html = "<span id='ytext'>Northing: </span><span id='yvalue'></span><span id='xtext'> Easting: </span><span id='xvalue'></span>      Scale: <span id='scalevalue'></span>";
                    $("footer").append(html);
                    handlers.push(dojo.connect(map, "onMouseMove", MapMouseMoveHandler));
                }
                function AddGraphicsLayers(){
                    $(graphiclayerids).each(function(i, id){
                        var gl = new esri.layers.GraphicsLayer({id:id});
                        map.addLayer(gl);
                    });
                }
                function AddLabelsLayer(){
                    if (config.map.labels){
                        var layer = CreateLayer(config.map.labels);
                        map.addLayer(layer);
                    }
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
                function CreateOverviewMap(){
                    var overviewMapDijit = new OverviewMap({
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
                function MapLoaded(){
                    SetPanel();
                    map.resize();
                    CreateOverviewMap();
                    //CreateDrawToolbar();
                    drawtoolbar = new Draw(map);
                    AddBaseMaps();
                    AddImageLayers();
                    //AddOperationalLayers();
                    AddLabelsLayer();
                    AddGraphicsLayers();
                    CreateCoordinateIndicator();

                    CheckUrlObjects();
                    handlers.push(dojo.connect(map, "onExtentChange", MapExtentChange));
                }
                function AddMapEvents() {
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
                    }));                   
                }
                function CreateLayer(layer){
                    var mapLayer = null;
                    var opacity = 1.00;
                    if(layer.opacity){
                        opacity = layer.opacity;
                    }
                    switch (layer.type){
                        case "tiled":
                            mapLayer = new ArcGISTiledMapServiceLayer(layer.url,{visible:layer.visible, id:layer.id, name:layer.label, opacity:opacity});
                            break;
                        case "dynamic":
                            mapLayer = new ArcGISDynamicMapServiceLayer(layer.url,{visible:layer.visible, id:layer.id, name:layer.label, opacity:opacity});
                            if (layer.visiblelayers){
                                mapLayer.setVisibleLayers(layer.visiblelayers);
                            }
                            break;
                        case "image":
                            mapLayer = new ArcGISImageServiceLayer(layer.url,{visible:layer.visible, id:layer.id, name:layer.label, opacity:opacity});
                            break;
                        case "feature":
                            mapLayer = new FeatureLayer(layer.url,{visible:layer.visible, id:layer.id, name:layer.label, opacity:opacity});
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
                function GetStoredConfig() {
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
                }
                function GetRaleighBound(){
                    $.ajax({
                        url:"raleigh_bound.txt",
                        dataType:"json"
                        ,success:function(data){
                            raleigh = new Polygon(data);
                        }
                    }); 
                }
            });        
        }
	};
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            //if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            //}
        });
    };
})( jQuery, window, document );