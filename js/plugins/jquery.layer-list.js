;(function ( $, window, document, undefined ) {

    var pluginName = "layerlist",
		defaults = {
			title: 'Layers',
			id: 'layersdiv',
            progressid:"progressDialog",
            messageid:"progressMessage"            
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
			var header = $("<h3>"+this.options.title+"</h3>");
			var container = $("<div id='"+this.options.id+"' class='paneldiv'></div>");
			$(this.element).append(header);	
			$(this.element).append(container);	
            this.createLayerNode();
        },

        createLayerNode:function(){
            var plugin = this;
            $(config.map.oplayers.sort(this.sortFunction)).each(function(i, item){
                var tocdiv = $("<div></div>");
                $("#layersdiv").append(tocdiv);
                var layerdiv = $("<div></div>");
                var label = (item.visible)?"On":"Off";
                var layerdiv = $("<div></div>");
                var label = (item.visible)?"On":"Off";
                var minscale = (item.minscale)?item.minscale:0;
                var layercheck = $("<input type='checkbox' id='layer_check_"+i+"' value='"+item.id+"' data-minscale='"+minscale+"' class='layercheck'/>");
                if(item.visible){
                    layercheck = $("<input type='checkbox' id='layer_check_"+i+"' value='"+item.id+"' data-minscale='"+minscale+"' class='layercheck' checked='checked'/>");
                }

                var checklabel = $("<label for='layer_check_"+i+"' class='checklabel' title=''>"+label+"</label><h4>"+item.label+"</h4>");

                if (minscale < map.getScale() && minscale > 0){
                    checklabel = $("<label for='layer_check_"+i+"' class='checklabel' title='Layer not visible at this scale'>"+label+"</label><h4>"+item.label+"</h4>");
                }


                layerdiv.append(layercheck);

                layerdiv.append(checklabel);
                tocdiv.append(layerdiv);            
                layercheck.button().bind('change', function(){plugin.layerCheckButtonChange(this)}).css("background-color","red");   

                if (minscale < map.getScale() && minscale > 0){
                    layercheck.button("option","disabled", true);
                }
                if(item.visible){
                    //CreateSubLayerNode(layer,layerdiv);
                    var layer = Plugin.prototype.createLayer(item);
                    map.addLayer(layer);
                    dojo.connect(layer, "onLoad", function(loadedlayer){
                        plugin.createSubLayerNode(loadedlayer, layerdiv);
                        handlers.push(dojo.connect(loadedlayer,"onOpacityChange", plugin.layerUpdated));
                        handlers.push(dojo.connect(loadedlayer,"onUpdateEnd", plugin.layerUpdated));
                        handlers.push(dojo.connect(loadedlayer,"onSuspend", plugin.layerUpdated));
                        handlers.push(dojo.connect(loadedlayer,"onResume", plugin.layerUpdated));
                    });
                }
            });
            dojo.connect(map,"onZoomEnd", this.mapZoomEnd);
        },

        mapZoomEnd:function(){
            var disabled = $(".layercheck, .sublayercheck").filter(function(){
                return $(this).data("minscale") < map.getScale() && $(this).data("minscale") > 0
            });
            var enabled = $(".layercheck, .sublayercheck").filter(function(){
                return $(this).data("minscale") > map.getScale()
            });

            disabled.button("option", "disabled", true);
            enabled.button("option", "disabled", false);

            $("label", disabled.parent()).prop("title", "Layer not visible at this scale");;
            $("label", enabled.parent()).prop("title", "");            
        },
        createLayer: function (layer){
            var mapLayer = null;
            var opacity = 1.00;
            require(['esri/layers/ArcGISTiledMapServiceLayer', 'esri/layers/ArcGISDynamicMapServiceLayer', 'esri/layers/ArcGISImageServiceLayer', 'esri/layers/FeatureLayer'], function (ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, FeatureLayer) {

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
                
            });
            return mapLayer;
        },
        layerUpdated:function(){
            var id = this.id;
            var filtered = $(config.map.oplayers).filter(function(){
                return this.id == id;
            });

            if (filtered.length > 0){
                filtered[0].visible = this.visible;

                    filtered[0].visiblelayers = this.visibleLayers;         


                    filtered[0].opacity = this.opacity;
                
            }
            if(Modernizr.localstorage){
                localStorage.setItem(configName+"_layers", dojo.toJson(config.map.oplayers));           
            }
        },

        layerCheckButtonChange:function(button){
                        
            var plugin = this;
            var parent = $(button).parent();
            var sublayers = $('.sublayers', $(button).parent());
            var id = $(button).val();
            var layer = map.getLayer(id);
            if ($(button).is(":checked")){
                _gaq.push(['_trackEvent', 'Layer List', 'Layer', id]);

                $(button).button("option", "label", "On");
                sublayers.css("display","block");

                if(!layer){

                    var item = $(config.map.oplayers).filter(function(){
                        return this.id == id;
                    });
                    layer = Plugin.prototype.createLayer(item[0]);
                    map.addLayer(layer);
                    dojo.connect(layer, "onLoad", function(loadedlayer){
                        layer.setVisibility(true);
                        if($("> div.sublayers",parent).length == 0){
                            plugin.createSubLayerNode(loadedlayer, parent);
                        }
                        handlers.push(dojo.connect(loadedlayer,"onOpacityChange", plugin.layerUpdated));
                        handlers.push(dojo.connect(loadedlayer,"onUpdateEnd", plugin.layerUpdated));
                        handlers.push(dojo.connect(loadedlayer,"onSuspend", plugin.layerUpdated));
                        handlers.push(dojo.connect(loadedlayer,"onResume", plugin.layerUpdated));                  
                    });
                
                }else{
                    layer.setVisibility(true);
                }

            }else{
                $(button).button("option", "label", "Off");
                sublayers.css("display","none");
                layer.setVisibility(false);
            }           
        },
        sliderChanged: function (e) {
            var id =$(this.element).parents(".sublayers").parent().find("input").val();
            var layer = map.getLayer(id);
            layer.setOpacity(e.value/100);
            $(this.element).parents(".sublayers").find(".legendimg").css("opacity", e.value/100);
            $(this.element).parents(".sublayers").find(".legendimg").css("filter", "alpha(opacity="+e.value+")");    
        },
        createSubLayerNode:function(layer, div){
            var plugin = this;
            var sublayersdiv = $("<div class='sublayers'></div>");
            div.append(sublayersdiv);
            var tocslider = $("<div class='tocslider'></div>");
            sublayersdiv.append(tocslider);

            var slider = $(tocslider).kendoSlider({
                min: 0,
                max: 100,
                value: layer.opacity*100,
                showButtons: false,
                slide: this.sliderChanged,
                change: this.sliderChanged
            }).data("kendoSlider");


            // tocslider.slider({min:0, 
            //     max:100, 
            //     value:layer.opacity*100,
            //     slide:function(event, ui){
            //         var id = $("input",$($(this).parent().parent())).val();
            //         var layer = map.getLayer(id);
            //         layer.setOpacity(ui.value/100);
            //         $(".legendimg", $($(this).parent().parent())).css("opacity", ui.value/100);
            //         $(".legendimg", $($(this).parent().parent())).css("filter", "alpha(opacity="+ui.value+")");
            //     }
            // });
            $(layer.layerInfos).each(function(i, layerInfo){
                var sublayerdiv = $("<div class='sublayer' data-value='"+layerInfo.id+"'></div>");
                sublayersdiv.append(sublayerdiv);
                sublayersdiv.css("display","block");


                var visible = ($.inArray(layerInfo.id, layer.visibleLayers) > -1)?true:false;
                var label = (visible)?"On":"Off";

                if (layer.id == "parcels" && layerInfo.id == 4){
                    //layerInfo.name = "Dimension Labels";
                }   

                var sublayercheck = $("<input class='sublayercheck' type='checkbox' id='check_"+layer.id+"_"+layerInfo.id+"' data-layer='"+layer.id+"' data-id='"+layerInfo.id+"' data-minscale='"+layerInfo.minScale+"'/>");
                if(visible){
                    sublayercheck = $("<input class='sublayercheck' type='checkbox' checked='checked' id='check_"+layer.id+"_"+layerInfo.id+"' data-layer='"+layer.id+"' data-id='"+layerInfo.id+"' data-minscale='"+layerInfo.minScale+"'/>"); 
                }

                sublayerdiv.append(sublayercheck);


                sublayerdiv.append("<label for='check_"+layer.id+"_"+layerInfo.id+"' class='checklabel'>"+label+"</label><div class='sublayertitle'><div>"+layerInfo.name+"</div></div>");
                if (layer.id == "parcels" && layerInfo.id == 4){
                    sublayerdiv.css("display", "none");
                }   



                //if (visible){

                //}
                sublayersdiv.append(sublayerdiv);
                //sublayercheck.button().bind('change', SublayerCheckChange);

                if (layer.minScale < map.getScale() && layer.minScale > 0){
                    sublayercheck.button("option","disabled", true);
                }
                var legenddiv = $("<div class='legend'></div>");
                sublayerdiv.append(legenddiv);
                legenddiv.css("display",(layerInfo.id, ($.inArray(layerInfo.id, layer.visibleLayers) > -1)?"block":"none"));

                sublayercheck.button().bind('change', plugin.sublayerCheckChange);
            });
            this.createLegendNode(layer, sublayersdiv);           
        },

        createLegendNode: function(layer, sublayersdiv){
            $.ajax({
                url:layer.url+"/legend",
                dataType:"jsonp",
                data:{
                    f:"json"
                }, success:function(data){
                    $(".sublayer", sublayersdiv).each(function(i, sublayerdiv){
                        var id = $(sublayerdiv).data("value");
                        var renderer = data.layers[id];
                        if (renderer){
                            var legenddiv = $(".legend", sublayerdiv);
                            $(renderer.legend).each(function(j, item){
                                legenddiv.append("<div><img class='legendimg' src='data:image/png;base64,"+item.imageData+"'/>"+item.label+"</div>");
                            });
                        }
                    });
                    $(".legendimg", sublayersdiv).css("opacity", layer.opacity);
                    $(".legendimg", sublayersdiv).css("filter", "alpha(opacity="+layer.opacity*100+")");
                }
            });           
        },

        sublayerCheckChange: function(){
            var name = $(this).data("layer");
            var layer = map.getLayer(name);
            var id = $(this).data("id");
            var vislayers = layer.visibleLayers;
            var pos = $.inArray(id, vislayers);
            if ($(this).is(":checked")){
                $(this).button("option", "label", "On");
                $(".legend", $(this).parent()).css("display", "block");
                if (pos == -1){
                    vislayers.push(id);
                    if (name == "parcels" && id == 3){
                        vislayers.push(id+1);
                    }
                }
                
            }else{
                $(this).button("option", "label", "Off");
                $(".legend", $(this).parent()).css("display", "none");
                vislayers.splice(pos,1);
                if (vislayers.length == 0){
                    vislayers.push(-1);
                }
                
            }   
            layer.setVisibleLayers(vislayers);           
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

        },

        sortFunction: function(dataA, dataB){
            return ((dataA.label < dataB.label) ? -1 : ((dataA.label > dataB.label) ? 1 : 0));           
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