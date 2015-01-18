;(function ( $, window, document, undefined ) {

    var pluginName = "identify",
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
                toolhandlers.push(dojo.connect(map,"onClick", plugin.identify));
        	});	         
        },

        identify:function(e){
            require(['esri/tasks/IdentifyTask', 'esri/tasks/IdentifyParameters', 'esri/dijit/PopupTemplate'], function (IdentifyTask, IdentifyParameters, PopupTemplate) {
                var visibleLayers = $(config.map.oplayers).filter(function(){
                    return this.visible;
                });
                var params = new esri.tasks.IdentifyParameters();
                params.height = map.height;
                params.width = map.width;
                params.geometry = e.mapPoint;
                //params.returnGeometry = true;
                idpnt = e.mapPoint;
                params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                params.mapExtent = map.extent;
                params.tolerance = 3;
                var idTask;
                idcnt = 0;
                idfeatures = [];
                idtotal = visibleLayers.length;
                $(visibleLayers).each(function(i, layer){
                    params.layerIds = layer.visiblelayers;
                    idTask = new IdentifyTask(layer.url);
                    idTask.execute(params, function(results){
                        //var infoTemplate = new esri.InfoTemplate("Attributes", "${*}");
                        var template;
                        $(results).each(function(i,result){
                            var fieldInfos = [];
                            for (var key in result.feature.attributes){
                                if (key.toUpperCase() != "OBJECTID" && key.toUpperCase() !="SHAPE"){
                                    fieldInfos.push({fieldName:key, visible:true})  
                                }

                            }
                            template = new PopupTemplate({title:result.layerName,fieldInfos:fieldInfos});
                            result.feature.setInfoTemplate(template);

                            idfeatures.push(result.feature);
                        });
                        idcnt +=1;
                        if (idcnt == idtotal){
                            map.infoWindow.setFeatures(idfeatures);
                            map.infoWindow.show(idpnt);     
                        }           
                    });
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