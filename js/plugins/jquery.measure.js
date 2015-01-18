;(function ( $, window, document, undefined ) {

    var pluginName = "measure",
		defaults = {
			title: 'Measure',
			id: 'measureDialog',
		};

    function Plugin( element, options ) {
        this.element = element;

        this.options = $.extend( {}, defaults, options );
        Plugin.prototype.options = this.options;
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
				Plugin.prototype.OpenWindow(this);
           	});

        },

        OpenWindow: function (el) {
            var dialog = $("#bookmarksdialog");
			$(".k-window .k-window-content").each(function(index, element){
			  $(element).data("kendoWindow").close();
			});
            var win;
            $(".ui-dialog-content").dialog("close");
   
            dialog = $("<div id='bookmarksdialog'><div>");
            $("body").append(dialog);

            win = dialog.kendoWindow({
                title:"Measure",
                actions:['Close'],
                visible:false,
                resizable: false,
                width: '300px',
                close: onClose
            }).data("kendoWindow").center();
			Plugin.prototype.createContent(el, Plugin.prototype.options, dialog);
	   		win = dialog.data("kendoWindow");
            
            win.open();

            function onClose() {
                if (Plugin.prototype.measurement.getTool()) {
                    console.log(Plugin.prototype.measurement.getTool().toolName);
                    Plugin.prototype.measurement.setTool(Plugin.prototype.measurement.getTool().toolName, false);                    
                }
                Plugin.prototype.measurement.destroy();
            }
        },

        createDialog: function(el, options, dialog) {
			$(el).append(dialog);
			dialog.dialog({autoOpen:false});
			dialog.dialog("option","title", options.title);	
			this.createContent(el, options, dialog);
        },

        createContent: function(el, options, dialog){
            dialog.append('<div id="measurementDiv"></div>');
            require(["esri/dijit/Measurement", "esri/tasks/GeometryService", "esri/units", "esri/config", "dojo/dom"], function(Measurement, GeometryService, Units, esriConfig, dom) { 
                esriConfig.defaults.geometryService = new esri.tasks.GeometryService("http://maps.raleighnc.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");
                Plugin.prototype.measurement = new Measurement({
                          map: map
                        }, dom.byId("measurementDiv"));
                        Plugin.prototype.measurement.startup();
            });
			// var plugin = this;
			// var radio = $("<div id='measureradio'></div>");
			// dialog.append(radio);
			// var labels = [{label:'Coordinates', value:'point'}, 
			// 	{label:'Distance', value:'polyline'},{label:'Area', value:'polygon'}];
			// $(labels).each(function(i, item){
			// 	var input = $("<input type='radio' id='"+item.label.toLowerCase()+"Radio' name='radio' value='"+item.value+"'/>");
			// 	var label = $("<label for='"+item.label.toLowerCase()+"Radio'>"+item.label+"</label>");
			// 	radio.append(input);
			// 	radio.append(label);
			// });

			// radio.buttonset();
			// $('input', radio).bind('change', function(){
			// 	if (drawhandlers){
			// 		plugin.cleardrawtool(drawhandlers);					
			// 	}

			// 	draw.deactivate();
			// 	draw.activate($(this).val());
			// });	
        },
        cleardrawtool:function(handlers){
			$(handlers).each(function(i, handler){
				dojo.disconnect(handler);
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