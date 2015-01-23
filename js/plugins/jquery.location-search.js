;(function ( $, window, document, undefined ) {
    var pluginName = "locationSearch",
        defaults = {
            title: 'Location Search',
            id: 'locationdiv',
            progressid:"progressDialog",
            messageid:"progressMessage",
            searches:[
                "Address", "Intersection", "Place of Interest", "Subdivision", "Coordinates"
            ],
            geocoder:"http://maps.raleighnc.gov/ArcGIS/rest/services/Locators/WakeLocator/GeocodeServer",
            intersection:{url:"http://maps.raleighnc.gov/ArcGIS/rest/services/StreetsDissolved/MapServer/0",
                field:"CARTONAME"},
            places:{url:"http://maps.raleighnc.gov/ArcGIS/rest/services/POI1/MapServer/0",
                categoryField:"ICON",
                nameField:"NAME",
                addressField:"ADDRESS",
                cityField:"CITY",
                zipField:"ZIP",
                phoneField:"TELEPHONE",
                urlField:"URL",
                photoField:"PHOTO",
                imageDirectory:"http://maps.raleighnc.gov/photos/poi/"
            },
            subdivisions:{
                url:"http://maps.raleighnc.gov/ArcGIS/rest/services/Planning/Subdivisions/MapServer/0",
                field:"NAME",
                color:[255,255,0]
            },
            coordinates:[
                {
                    name:"Decimal Degrees",
                    wkid:4326
                },
                {
                    name:"Stateplane Feet",
                    wkid:2264
                }
            ]
        };
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        Plugin.prototype.options = this.options;
        Plugin.prototype.element = this.element;
        require(["esri/layers/GraphicsLayer"], function (GraphicsLayer) {
            Plugin.prototype.graphicslayer = new GraphicsLayer();
            console.log(map);
            map.addLayer(this.graphicslayer);
            Plugin.prototype.init();
        });
    }
    Plugin.prototype = {
        init: function() {
            var header = $("<h3>"+Plugin.prototype.options.title+"</h3>");
            var container = $("<div id='"+Plugin.prototype.options.id+"' class='paneldiv'></div>");
            $(Plugin.prototype.element).append(header);
            $(Plugin.prototype.element).append(container);
            this.createContent(container, Plugin.prototype.options)
        },
        createContent:function(container, options){
            var select = $("<select></select>");
            $(options.searches).each(function(i, search){
                select.append("<option>"+search+"</option>");
            });
            container.append(select);
            $(select).kendoDropDownList();
            $(".k-header", container).css("background-color", "#444");
            this.addContainers(container);
            select.change(function(){
                var idx = this.selectedIndex;
                $(".locationcontainer").each(function(i, container){
                    if (i == idx){
                        $(container).removeClass("invisible").addClass("visible");
                    }else{
                        $(container).removeClass("visible").addClass("invisible");
                    }
                });
            });
        },
        addContainers:function(container){
            var plugin = this;
            $(Plugin.prototype.options.searches).each(function(i, search){
                var div = null;
                if (i==0){
                    div = $("<div class='locationcontainer visible'></div>");
                }else{
                    div = $("<div class='locationcontainer invisible'></div>");
                }
                container.append(div);
                switch (search){
                    case "Address":
                        plugin.createAddressSearch(div);
                        break;
                    case "Intersection":
                        plugin.createIntersectionSearch(div);
                        break;
                    case "Place of Interest":
                        plugin.createPlaceOfInterestSearch(div);
                        break;
                    case "Subdivision":
                        plugin.createSubdivisionSearch(div);
                        break;
                    case "Coordinates":
                        plugin.createCoordinatesSearch(div);
                        break;
                }
            });
        },
        createAddressSearch:function(div){
            require(["esri/dijit/Geocoder"], function (Geocoder) {
                div.append("<div id='geocoder'></div>");
                var geocoders = [{url:Plugin.prototype.options.geocoder,name:"Wake Locator"}];
                var geocoder = new Geocoder({map:map, geocoders:geocoders, arcgisGeocoder:false, showResults:true}, "geocoder");
                geocoder.startup();
            });
        },
        createIntersectionSearch:function(div){
            var plugin = this;
            var input = $("<input></input>");
            var url = plugin.options.intersection.url+"/query";
            var field = plugin.options.intersection.field;
            div.append(input);
            var ddl = $("<input></input>").appendTo(div);
            ddl.kendoDropDownList({
                optionLabel:"Select Intersecting Street...",
                enable:false
            });
            var ds = new kendo.data.DataSource({
                serverFiltering:true,
                transport:{
                    read:function(options){
                        $.ajax({
                            url:url,
                            dataType:"jsonp",
                            data:{
                                where:field +" LIKE '"+input.val().toUpperCase()+"%'",
                                outFields:field,
                                returnGeometry:false,
                                f:"json"
                            },success:function(data){
                                var streets = [];
                                $(data.features).each(function(i, feature){
                                    streets.push(feature.attributes[field]);
                                });
                                options.success(streets);
                            }
                        });
                    }
                }
            });
            input.kendoAutoComplete({
                minLength:4,
                dataSource:ds,
                select:function(e){
                    var street = e.item.text();
                    $.ajax({
                      url: url,
                      type: 'POST',
                      dataType: 'json',
                      data:{
                        where:field +" = '"+input.val().toUpperCase()+"'",
                        returnGeometry:true,
                        f:"json"
                      },
                      complete: function(xhr, textStatus) {
                        //called when complete
                      },
                      success: function(data, textStatus, xhr) {
                        require(["esri/tasks/query", "esri/tasks/QueryTask"], function (Query, QueryTask) {
                            var qt = new QueryTask(url);
                            var q = new Query();
                            q.returnGeometry = true;
                            q.where = field+" = '"+street+"'";
                            qt.execute(q, function(featureset){
                                if (featureset.features.length > 0){
                                    var line = featureset.features[0].geometry;
                                    var ds2 = new kendo.data.DataSource({
                                        serverFiltering:true,
                                        transport:{
                                            read:function(options){
                                                require(["dojo/_base/json"], function(dojo){
                                                    $.ajax({
                                                      url: url,
                                                      type: 'POST',
                                                      dataType: 'jsonp',
                                                      data: {
                                                        geometry: "{paths:"+dojo.toJson(line.paths)+"}",
                                                        geometryType:"esriGeometryPolyline",
                                                        f:'json'
                                                      },
                                                      complete: function(xhr, textStatus) {
                                                        //called when complete
                                                      },
                                                      success: function(data, textStatus, xhr) {
                                                        var streets = [];
                                                        $(data.features).each(function(i,feature){
                                                            if(feature.attributes[field] != street){
                                                                streets.push(feature.attributes[field]);
                                                            }
                                                        });
                                                        options.success(streets);
                                                      },
                                                      error: function(xhr, textStatus, errorThrown) {
                                                        //called when there is an error
                                                      }
                                                    });
                                                });
                                            }
                                        }
                                    });
                                }
                                ddl.kendoDropDownList({
                                    optionLabel:"Select Intersecting Street...",
                                    dataSource:ds2,
                                    change:function(e){
                                        var intstreet = this.dataItem();
                                        require(["esri/graphic", "esri/tasks/locator", "esri/symbols/PictureMarkerSymbol", "esri/graphicsUtils"], function (Graphic, Locator, PictureMarkerSymbol, graphicsUtils){
                                            var address = {"Single Line Input":street+" & "+intstreet};
                                            var locator = new Locator(Plugin.prototype.options.geocoder);
                                            locator.addressToLocations({address:address}, function(candidates){
                                                var graphics = [];
                                                plugin.graphicslayer.clear();
                                                $(candidates).each(function(i, candidate){
                                                    var sym = new PictureMarkerSymbol("img/pin.png", 30,30);
                                                    var g = new Graphic(candidate.location, sym);
                                                    graphics.push(g);
                                                    plugin.graphicslayer.add(g);
                                                });
                                                if(graphics.length == 1){
                                                    map.centerAndZoom(graphics[0].geometry, 10);
                                                }else{
                                                    map.setExtent(graphicsUtils.graphicsExtent(graphics), true);
                                                }
                                            });
                                        });
                                    }
                                });
                                ddl.data("kendoDropDownList").enable(true);
                            });
                        });
                      },
                      error: function(xhr, textStatus, errorThrown) {
                        //called when there is an error
                      }
                    });

                },
                highlightFirst:true,
                suggest:true
            });
            input.closest(".k-autocomplete").css("width","100%");
            input.closest(".k-autocomplete").css("margin","5px 0 5px 0");
        },
        createPlaceOfInterestSearch:function(div){
            var plugin = this;
            var options = Plugin.prototype.options;
            var url = options.places.url+"/query";
            var catField = options.places.categoryField;
            var nameField = options.places.nameField;
            var addressField = options.places.addressField;
            var phoneField = options.places.phoneField;
            var urlField = options.places.urlField;
            var cityField = options.places.cityField;
            var zipField =options.places.zipField;
            var photoField =options.places.photoField;
            var outFields = [nameField, addressField, phoneField, urlField, cityField, zipField, photoField];
            var imageDirectory = options.places.imageDirectory;
            if ($(div).children().length == 0){
                var ddl = $("<input></input>");
                div.append(ddl);
                var ddl2 = $("<input></input>");
                div.append(ddl2);
                var info = $("<div style='text-align:center;'></div>");
                div.append(info);
                var ds = new kendo.data.DataSource({
                    serverFiltering:true,
                    transport:{
                        read:function(options){
                            $.ajax({
                                url:url,
                                dataType:"jsonp",
                                data:{
                                    where:"1=1",
                                    outFields:catField,
                                    orderByFields:catField,
                                    returnGeometry:false,
                                    returnDistinctValues:true,
                                    f:"json"
                                },success:function(data){
                                    var categories = [];
                                    $(data.features).each(function(i, feature){
                                        categories.push(feature.attributes[catField]);
                                    });
                                    options.success(categories);
                                }
                            });
                        }
                    }
                });
                ddl.kendoDropDownList({
                    optionLabel:"Select Place Type...",
                    dataSource:ds,
                    change:function(e){
                        var category = this.dataItem();
                        var ds2 = new kendo.data.DataSource({
                            serverFiltering:true,
                            transport:{
                                read:function(options){
                                    $.ajax({
                                        url:url,
                                        dataType:"jsonp",
                                        data:{
                                            returnGeometry:true,
                                            outFields:outFields.toString(),
                                            orderByFields:nameField,
                                            where:catField+" = '"+category+"'",
                                            f:"json"
                                        },success:function(data){
                                            var places = [];
                                            $(data.features).each(function(i, feature){
                                                places.push({label:feature.attributes[nameField], data:dojo.toJson(feature)});
                                            });
                                            options.success(places);
                                        }
                                    });
                                }
                            }
                        });
                        ddl2.kendoDropDownList({
                            dataTextField:"label",
                            dataValueField:"data",
                            optionLabel:"Select Place...",
                            dataSource:ds2,
                            change:function(){
                                var feature = $.parseJSON(this.value());
                                require(["esri/geometry/Point", "esri/graphic", "esri/symbols/PictureMarkerSymbol"], function (Point, Graphic, PictureMarkerSymbol) {
                                    var point = new Point(feature.geometry.x, feature.geometry.y, map.spatialReference);
                                    plugin.graphicslayer.clear();
                                    var sym = new PictureMarkerSymbol("img/pin.png", 30,30);
                                    var g = new Graphic(point, sym);
                                    plugin.graphicslayer.add(g);
                                    map.centerAndZoom(point, 8);
                                    info.empty();
                                    info.append("<h3>"+feature.attributes[nameField]+"</h3>");
                                    info.append("<img src='"+imageDirectory+feature.attributes[photoField]+"'</img>");
                                    info.append("<div>"+feature.attributes[addressField]+"</div>");
                                    var city = feature.attributes[cityField]+", NC ";
                                    if (feature.attributes[zipField]){
                                        city +=feature.attributes[zipField];
                                    }
                                    info.append("<div>"+city+"</div>");
                                    if (feature.attributes[phoneField]){
                                        info.append("<div>"+feature.attributes[phoneField]+"</div>");
                                    }
                                    if (feature.attributes[urlField]){
                                        info.append("<div><a href='"+feature.attributes[urlField]+"' target='_blank'>Website</a></div>");
                                    }
                                });
                            }
                        });
                        ddl2.data("kendoDropDownList").enable();
                    }
                });
                ddl2.kendoDropDownList({enable:false});
                $(".k-dropdown", $('#'+plugin.options.id)).css("width","100%");
                $(".k-dropdown", $('#'+plugin.options.id)).css("margin","5px 0 5px 0");

            }
        },
        createSubdivisionSearch:function(div){
            var plugin = this;
            var input = $("<input></input>");
            var url = plugin.options.subdivisions.url+"/query";
            var field = plugin.options.subdivisions.field;
            var color = plugin.options.subdivisions.color;
            div.append(input);
            var ds = new kendo.data.DataSource({
                serverFiltering:true,
                transport:{
                    read:function(options){
                        $.ajax({
                            url:url,
                            dataType:"jsonp",
                            data:{
                                where:field +" LIKE '"+input.val().toUpperCase()+"%'",
                                outFields:field,
                                returnGeometry:false,
                                returnDistinctValues:true,
                                f:"json"
                            },success:function(data){
                                var subdivisions = [];
                                $(data.features).each(function(i, feature){
                                    subdivisions.push(feature.attributes[field]);
                                });
                                options.success(subdivisions);
                            }
                        });
                    }
                }
            });
            input.kendoAutoComplete({
                minLength:4,
                dataSource:ds,
                highlightFirst:true,
                suggest:true,
                select:function(e){
                    require(["esri/tasks/query", "esri/tasks/QueryTask", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/graphicsUtils", "esri/Color"], function (Query, QueryTask, SimpleFillSymbol, SimpleLineSymbol, graphicsUtils, Color) {
                        var q = new Query();
                        var qt = new QueryTask(url);
                        q.where = field+" = '"+e.item.text()+"'";
                        q.returnGeometry = true;
                        qt.execute(q, function(featureset){
                            var sym =  new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                              new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                              new Color(color),5),null);
                            plugin.graphicslayer.clear();
                            $(featureset.features).each(function(i, feature){
                                feature.setSymbol(sym);
                                plugin.graphicslayer.add(feature);
                            });
                            map.setExtent(graphicsUtils.graphicsExtent(featureset.features), true);
                        }, function(error){
                        });
                    });
                }
            });
            input.closest(".k-autocomplete").css("width","100%");
            input.closest(".k-autocomplete").css("margin","5px 0 5px 0");
        },
        createCoordinatesSearch:function(div){
            var select = $("<select></select>").appendTo(div);
            $(Plugin.prototype.options.coordinates).each(function(i, item){
                select.append("<option value='"+item.wkid+"'>"+item.name+"</option>");
            });
            select.kendoDropDownList();
            div.append("<p/>X   ");
            var xinput = $("<input class='k-textbox'></input>").appendTo(div);
            div.append("<p/>Y   ");
            var yinput = $("<input class='k-textbox'></input>").appendTo(div);
            div.append("<p/>");
            var submit = $("<button>Search</button>").appendTo(div);
            submit.button().click(function(){
                require(["esri/SpatialReference", "esri/geometry/Point"], function (SpatialReference, Point) {
                    var x = xinput.val();
                    var y = yinput.val();
                    var wkid = $("option:selected",select).val();
                    var sr = new SpatialReference({latestWkid:wkid});
                    var point = new Point(x,y,sr);
                    if (sr.latestWkid == map.spatialReference.latestWkid.toString()){
                        map.centerAndZoom(point, 10);
                    }else{
                    }
                });
            });
        },
        showProgress: function(options, message){
            var dialog = $("#"+options.progressid);
            var messagediv = $("#"+options.messageid);
            if(dialog.length > 0 && messagediv.length > 0){
                messagediv.html(message);
                dialog.dialog("open");
            }
        },
        hideProgress: function(options){
            var dialog = $("#"+options.progressid);
            if(dialog.length > 0){
                dialog.dialog("close");
            }
        }
    };
   $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
            else if ($.isFunction(Plugin.prototype[options])) {
                $.data(this, 'plugin_' + pluginName)[options]();
            }
        });
    }
})( jQuery, window, document );