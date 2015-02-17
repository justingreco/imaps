;(function ( $, window, document, undefined ) {
    var pluginName = "propertySelect",
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
            var plugin = this;
            $(this.element).append("<img src='"+this.options.tool.icon+"' style='max-height:30px'/><span>"+this.options.tool.label+"</span>");
            if (this.options.tool.toggle){
                $(this.element).addClass('toggle');
            }
            $(this.element).click(function(){
                DisconnectHandlers(toolhandlers);
                if($(".selectpanel").length == 0){
                    plugin.addSelectPanel($(this).offset().top, $(this).offset().left, $(this).width()+10);
                }else{
                    $(".selectpanel").toggle();
                    MoveZoomSlider($("#tools").width() + $(".selectpanel").width()+60);
                }
                plugin.activateSelectDrawToolbar();
            });
        },
        addSelectPanel:function (top, left, width){
            var plugin = this;
            //var selectpanel = $("<ul class='selectpanel' style='background:#666;position:absolute;top:"+top+"px;left:"+(left+width)+"px;max-width:80px;font-size:12px'><li class='selectli' value='point'><img src='./img/select_point_default.png'>Point</img></li><li class='selectli' value='multipoint'><img src='./img/select_multi_default.png'>Multi-Point</img></li><li class='selectli' value='polygon'><img src='./img/select_polygon_default.png'>Polygon</img></li><li><input id='buffercheck' type='checkbox'><label for='buffercheck' class='checklabel' style='font-size:10px;margin-bottom:5px'>Buffer?</label></input></input> <input id='bufferdist' type='number' value='0'></input><p/></li><li><input id='selectFreehand' type='checkbox' checked='checked'></input><label for='selectFreehand' class='checklabel' style='font-size:10px'>Freehand?</label></li></ul>");
            var selectpanel = $("<ul class='selectpanel' style='background:#666;position:absolute;top:"+top+"px;left:"+(left+width)+"px;max-width:80px;font-size:12px'><li class='selectli' value='point'><img src='./img/select_point_default.png'>Point</img></li><li class='selectli' value='multipoint'><img src='./img/select_multi_default.png'>Multi-Point</img></li><li class='selectli' value='polygon'><img src='./img/select_polygon_default.png'>Polygon</img></li><li><button id='buffercheck' type='button' class='btn btn-danger btn-xs'>Buffer?</button><input id='bufferdist' type='number' value='0'></input><p/></li><li><button id='selectFreehand' type='button' class='btn btn-success btn-xs'>Freehand?</button></li></ul>");
            $("body").append(selectpanel);
            $("#bufferdist").kendoNumericTextBox({
                format:"# ft",
                min:0,
                max:5000,
                step:50
            });
            $("#bufferdist").closest(".k-widget").css("width","80px");
            $("#bufferdist").closest(".k-widget").css("display","none");
            $("#bufferdist").closest(".k-numerictextbox").css("background-color","#ffffff");
/*            $("#buffercheck").button().click(function(){
                $("#bufferdist").closest(".k-widget").toggle();
            });*/
            $("#buffercheck").on('click', function () {
                if ($(this).hasClass('btn-success')) {
                    $(this).removeClass('btn-success').addClass('btn-danger');
                } else {
                    $(this).removeClass('btn-danger').addClass('btn-success');
                }
                $("#bufferdist").closest(".k-widget").toggle();
            });
            //$("#selectFreehand").button().click(function(){
            //    plugin.activateSelectDrawToolbar(this)});
            $("#selectFreehand").on('click', function() {
                if ($(this).hasClass('btn-success')) {
                    $(this).removeClass('btn-success').addClass('btn-danger');
                } else {
                    $(this).removeClass('btn-danger').addClass('btn-success');
                }
                plugin.activateSelectDrawToolbar(this);
            });
            $(".selectli").click(function(){
                plugin.activateSelectDrawToolbar(this);
            });
            $("#tools h3").click(function(){

                if ($("#tools").hasClass('collapsed')) {
                    $(".selectpanel").hide();
                } else {
                    if($(".tool.toggle.active span").html() === "Select") {
                        $(".selectpanel").show();
                    }
                }
                if($(".selectpanel").css("display") == "none"){
                    MoveZoomSlider($("#tools").width()+30);
                }else{
                    MoveZoomSlider($("#tools").width() + $(".selectpanel").width()+60);
                }
            });
            MoveZoomSlider($("#tools").width() + $(".selectpanel").width()+60);
        },
        selectDrawEnd:function(geometry){
            var plugin = this;
            var distance = $("#bufferdist").val();
/*            if (!$("#buffercheck").prop("checked")){
                distance = 0;
            }*/
            if (!$("#buffercheck").hasClass('btn-success')) {
                distance = 0;
            }
            if (parseInt(distance) > 0){
                require(["esri/tasks/BufferParameters"], function (BufferParameters) {
                    var params = new BufferParameters();
                    params.distances = [parseInt(distance)];
                    params.bufferSpatialReference = map.spatialReference;
                    params.outSpatialReference = map.spatialReference;
                    params.unit = 9002;
                    if (geometry.type === "polygon"){
                        geomService.simplify([geometry], function(geometries){
                            params.geometries = geometries;
                        });
                    }else{
                        params.geometries = [geometry];
                    }
                    geomService.buffer(params, function(geometries){
                        plugin.selectBufferComplete(geometries);
                    });
                });
            }else{
                this.addSelectGraphicToMap([geometry]);
                this.selectPropertyByGeometry([geometry]);
            }
        },
        activateSelectDrawToolbar:function(element){
            var plugin = this;
            if($(element).hasClass("selectli")){
                this.changeSelectPanelItem(element);
            }
            drawtoolbar.deactivate();
            DisconnectHandlers(drawhandlers);
            drawhandlers = [];
            if ($(".selectli.selected").length > 0){
                var drawmode = $(".selectli.selected").attr("value");
                //if($("#selectFreehand").is(":checked") && (drawmode == "polygon" || drawmode == "polyline")){
                if($("#selectFreehand").hasClass("btn-success") && (drawmode == "polygon" || drawmode == "polyline")){
                    drawmode = "freehand"+drawmode;
                }else{
                    drawmode = drawmode.replace("freehand");
                }
                drawtoolbar.activate(drawmode);
                drawhandlers.push(dojo.connect(drawtoolbar, "onDrawEnd", function(geometry){
                    plugin.selectDrawEnd(geometry);
                }));
            }
        },
        changeSelectPanelItem:function(item){
            $(".selectpanel li").each(function(i, tool){
                if ($("img", tool).length > 0){
                    $("img", tool).attr("src",$("img", tool).attr("src").replace("_selected", "_default"));
                }
                $(tool).removeClass("selected");
            });
            $("img", item).attr("src",$("img", item).attr("src").replace("_default", "_selected"));
            $(item).addClass("selected");
        },
        selectPropertyByGeometry:function(geometries){
            require(["esri/tasks/query", "esri/tasks/QueryTask"], function (Query, QueryTask) {
                var query = new Query();
                query.geometry = geometries[0];
                query.returnGeometry = false;
                query.outFields = ['PIN_NUM'];
                var qt = new QueryTask("http://maps.raleighnc.gov/arcgis/rest/services/Parcels/MapServer/0");
                qt.execute(query, function(featureset){
                    var pins = [];
                    $(featureset.features).each(function(i, feature){
                        pins.push(feature.attributes.PIN_NUM);
                    });
                    var search = $("#accordion").propertySearch().data("plugin_propertySearch");
                    search.searchRealEstateAccounts(dojo.toJson(pins), "pin", false);
                }, function(error){
                });
            });
        },
        selectBufferComplete:function(geometries){
            //this.addSelectGraphicToMap(geometries);
            this.selectPropertyByGeometry(geometries);
            map.setExtent(geometries[0].getExtent(), true);
        },
        addSelectGraphicToMap:function(geometries){
            require(["esri/graphic", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"], function (Graphic, SimpleFillSymbol, SimpleLineSymbol, Color){
                var symbol = new SimpleFillSymbol(
                    SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(
                      SimpleLineSymbol.STYLE_SOLID,
                      new Color([255,0,0,0.65]), 2
                    ),
                    new Color([255,0,0,0.35])
                );
                map.getLayer("selectgl").clear();
                $(geometries).each(function(i, geometry){
                    map.getLayer("selectgl").add(new Graphic(geometry, symbol));
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
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            //if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
            //}
        });
    };
})( jQuery, window, document );