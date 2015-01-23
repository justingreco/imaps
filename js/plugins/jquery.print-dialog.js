;(function ( $, window, document, undefined ) {
    var pluginName = "print",
		defaults = {
			title: 'Print',
			id: 'printdialog',
			template:{"layouts":["A3 Landscape",
                "A3 Portrait",
                "A4 Landscape",
                "A4 Portrait",
                "Letter ANSI A Landscape",
                "Letter ANSI A Portrait",
                "Tabloid ANSI B Landscape",
                "Tabloid ANSI B Portrait",
                "MAP_ONLY"],
			    "formats":[
			                "PDF",
			                "PNG32",
			                "PNG8",
			                "JPG",
			                "GIF",
			                "EPS",
			                "SVG",
			                "SVGZ"
			            ]
			  },
			  url:"http://mapstest.raleighnc.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
			  progressid:"progressDialog",
			  messageid:"progressMessage",
			  layouts: [
			  	{name: 'Letter Landscape',
			  		orientation: 'landscape',
			  		size: '8.5x11'
			  	},
			  	{name: 'Letter Portrait',
			  		orientation: 'portrait',
			  		size: '8.5x11'
			  	},
			  	{name: 'Tabloid Landscape',
			  		orientation: 'landscape',
			  		size: '11x17'
			  	},
			  	{name: 'Tabloid Portrait',
			  		orientation: 'portrait',
			  		size: '11x17'
			  	},
			  	{name: '24x36 Landscape',
			  		orientation: 'landscape',
			  		size: '24x36'
			  	},
			  	{name: '24x36 Portrait',
			  		orientation: 'portrait',
			  		size: '24x36'
			  	},
			  	{name: '36x48 Landscape',
			  		orientation: 'landscape',
			  		size: '36x48'
			  	},
			  	{name: '36x48 Portrait',
			  		orientation: 'portrait',
			  		size: '36x48'
			  	}
			  ]
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
        	$(this.element).append("<img src='"+this.options.tool.icon+"' style='max-height:30px'>"+this.options.tool.label+"</img>");
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
                title:Plugin.prototype.options.title,
                actions:['Close'],
                visible:false,
                resizable: false,
                width: '300px',
                pinned: true
            }).data("kendoWindow").center();
			Plugin.prototype.createContent(el, Plugin.prototype.options, dialog);
	   		win = dialog.data("kendoWindow");

            win.open();
        },
        createDialog: function(el, options, dialog) {
			$(el).append(dialog);
			dialog.dialog({autoOpen:false});
			dialog.dialog("option","title", options.title);
			this.createContent(el, options, dialog);
        },
        createContent: function(el, options, dialog){
        	var plugin = this;
			//dialog.append("Title  ");
			var form = $('<form></form>').appendTo(dialog);
			form.append('<div class="form-group form-group"><label for="printTitle">Title</label><input type="text" class="form-control input-sm" id="printTitle" placeholder="Title to appear on map" style="width:90%">');
			form.append('<div class="form-group form-group"><label for="printLayout">Layout</label><select class="form-control input-sm" id="printLayout" ></select>');
			form.append('<div class="form-group form-group"><label for="printScale">Scale</label><select class="form-control input-sm" id="printScale"></select>');
			form.append('<div class="form-group form-group"><label class="checkbox-inline"><input type="checkbox" id="printGraphics">Graphics</input></label><label class="checkbox-inline"><input type="checkbox" id="printInfo">Property Info</input></label></div>');
			form.append('<div class="form-group form-group"><button id="printButton" class="btn btn-primary" type="button">Save PDF</button></div>');
			$.each(options.layouts, function(i, layout) {
				$('#printLayout').append('<option data-orient="'+layout.orientation+'" data-size="'+layout.size+'">'+layout.name+'</option>');
			});
			$("#printButton").on('click', function () {
				Plugin.prototype.printMap(Plugin.prototype.buildPrintParams());
			});
        },
        buildPrintParams: function () {
			var layers = map.getLayersVisibleAtScale(map.getScale()),
				layerList = '',
				layerTypes = '',
				extent = map.extent.xmin + ';' + map.extent.ymin + ';' + map.extent.xmax + ';' + map.extent.ymax,
				opacities = '',
				visLayers = '';
			$.each(layers, function(i, layer) {
				if (layer.visible) {
					layerList += layer.id + ';';
					if (layer.tileInfo) {
						layerTypes += 'tiled;';
						visLayers += '0;'
					} else {
						if (layer.visibleLayers) {
							layerTypes += 'dynamic;';
							visLayers += layer.visibleLayers.toString() + ';';
						} else {
							layerTypes += ';';
						}
					}
					opacities += layer.opacity + ';';
				}
			});
			var params = {
				Services: layerList,
				Visible_Layers: visLayers,
				f: 'json',
				Size: $('#printLayout option:selected').data('size'),
				Scale: map.getScale(),
				Transparency_Values: opacities,
				Graphics_Count: '0;0;0;0',
				Title: $("#printTitle").val(),
				Orientation: $('#printLayout option:selected').data('orient'),
				Types: layerTypes,
				Extent: extent
			};
			if (pin) {
				params.PIN = pin + ';';
			}
			if (pins) {
				params.PIN += pins.toString().replace(/'/g, '');
			}
			if ($("#printInfo").is(':checked')) {
				var attributes = '';
				$.each($('#propInfoGrid tr'), function(i, tr) {
					if (i > 0) {
						attributes += $('td', tr).first().text() + ': ' + $('td', tr).eq(1).text() + ';';
						params.Attributes = attributes;
					}
				});
			}
			console.log(params);
			return params;
        },
        printMap: function(params){
			require(['esri/tasks/Geoprocessor'], function (Geoprocessor) {
				var gp = new Geoprocessor("http://maps.raleighnc.gov/arcgis/rest/services/Geoprocessing/SaveToPDF/GPServer/SaveToPDF");
				gp.submitJob(params, function (info) {
					gp.getResultData(info.jobId, 'Output_URL', function (data) {
						console.log(data.value);
						window.open(data.value);
					});
				},
				function (status) {
					console.log(status);
				},
				function (error) {
					console.log(error);
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