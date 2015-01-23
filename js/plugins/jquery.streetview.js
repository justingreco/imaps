;(function ( $, window, document, undefined ) {

    var pluginName = "streetview",
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
                toolhandlers.push(dojo.connect(map,"onClick", plugin.getStreetview));
        	});	         
		         

        },

        getStreetview:function(e){
            var dialog = $("#streetviewdialog");
            var pano = $("#panorama");
            var panorama;

            var win;
            $(".ui-dialog-content").dialog("close");
            $(".k-window .k-window-content").each(function(index, element){
              $(element).data("kendoWindow").close();
            });
            //if (dialog.length == 0){

                //dialog = CreateDialogBox("streetviewdialog", "Google Streetview");    
                dialog = $("<div id='streetviewdialog'><div>");
                $("body").append(dialog);
                //pano = $("<div id='panorama'></div>");
                //dialog.append(pano);  
                //dialog.css("height", "100%");
                //dialog.css("width", "100%");
                win = dialog.kendoWindow({
                    title:"Google Streetview",
                    actions:['Maximize', 'Close'],
                    visible:false,
                    width:"400px",
                    height:"200px",
                    pinned: true,
                    resize:function(){
                        google.maps.event.trigger(panorama,'resize');
                    }
                }).data("kendoWindow").center();
            //}



            var params = new esri.tasks.ProjectParameters();
            params.geometries = [e.mapPoint];
            params.outSR = new esri.SpatialReference(4226);
            geomService.project(params, function(geometries){
                var geom = geometries[0];
                var loc = new google.maps.LatLng(geom.y, geom.x);
                var options = {position:loc};
                if (!panorama){
                    panorama = new google.maps.StreetViewPanorama(document.getElementById('streetviewdialog'), options);                
                }else{
                    panorama.setLocation(loc);
                }
                //dialog.dialog("open");
                //dialog.kendoWindow({actions:['Maximize','Close'], visible:true});

                win = $("#streetviewdialog").data("kendoWindow");
                
                win.open();

            });

            /*dialog.on("dialogresize",function(){
                pano.css("height", dialog.css("height"));
                pano.css("width", dialog.css("width"));
                 google.maps.event.trigger(panorama,'resize');

            });*/
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