;(function ( $, window, document, undefined ) {

    var pluginName = "markup",
		defaults = {
			title: 'Markup',
			id: 'markupdialog',

			  progressid:"progressDialog",
			  messageid:"progressMessage",
            drawtools:[
                {label:"Point", value:"point", symbol:"marker"},
                {label:"Line", value:"polyline", symbol:"line"},
                {label:"Polygon", value:"polygon", symbol:"fill"},
                {label:"Rectangle", value:"rectangle", symbol:"fill"},
                {label:"Circle", value:"circle", symbol:"fill"},
                {label:"Arrow", value:"arrow", symbol:"fill"},
                {label:"Triangle", value:"triangle", symbol:"fill"},
                {label:"Ellipse", value:"ellipse", symbol:"fill"}
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

        toggleDrawOptions:function(type){
            switch(type){
                case "marker":
                    $(".markeroptions").css("display","block");
                    $(".lineoptions").css("display","block");
                    $(".filloptions").css("display","block");                                        
                    break;
                case "line":
                    $(".markeroptions").css("display","none");
                    $(".lineoptions").css("display","block");
                    $(".filloptions").css("display","none");                   
                    break;
                case "fill":
                    $(".markeroptions").css("display","none");
                    $(".lineoptions").css("display","block");
                    $(".filloptions").css("display","block");                   
                    break;
            }
        },

        createContent: function(el, options, dialog){
        	var plugin = this;
        	var select = $("<select id='markupSelect'></select>")
            $(this.options.drawtools).each(function(i,tool){
                var opt = $("<option value='"+tool.value+"' data-symbol='"+tool.symbol+"'>"+tool.label+"</option>");
                select.append(opt);
            });
        	dialog.append(select);
		    $(select).kendoDropDownList({
		    	change:function(e){
		    		var mode = $("#markupSelect option:selected").val();
                    var symbol = $("#markupSelect option:selected").data("symbol");
                    plugin.toggleDrawOptions(symbol);
		    		plugin.activateDrawTool(drawtoolbar, mode);
		    	}
		    });

        	select.closest(".k-widget").css("background-color", "#555555");

            var toggle = $("<div id='markupToggle' style='float:right'></div>").appendTo(dialog);
            toggle.append("<input type='radio' id='markupDrawRadio' name='markupToggle'/><label for='markupDrawRadio'>Draw</label>");
            toggle.append("<input type='radio' id='markupEditRadio' name='markupToggle'/><label for='markupEditRadio'>Edit</label>");

            toggle.buttonset().change(function(e){
                switch ($($("input:checked",this)[0].labels[0]).text()){
                    case "Draw":
                        plugin.activateDrawTool(drawtoolbar, $("#markupSelect option:selected").val());
                        dojo.disconnect(plugin.graphicHandler);
                        break;
                    case "Edit":
                        drawtoolbar.deactivate();
                        plugin.graphicHandler = dojo.connect(plugin.graphicsLayer, "onClick", function(e){
                            plugin.editToolbar.activate(esri.toolbars.Edit.EDIT_VERTICES | esri.toolbars.Edit.MOVE | esri.toolbars.Edit.SCALE,
                                e.graphic);
                            $("#map").keypress(function(){
                                plugin.graphicsLayer.remove(e.graphic);
                            });

                        });
                        break;
                }
            });



        	var color = $("<input type='color' id='colorpicker' data-role='colorpicker' data-palette='basic' value='#FF0000'></input>");
 
        	dialog.append(color);
        	kendo.init(dialog);
        	color.closest(".k-widget").css("margin", "0 10px 0 10px");

        	var colorpicker = color.data("kendoColorPicker");
        	colorpicker.bind({
        		change:function(e){
        			var color = new dojo.Color(e.value);
        			plugin.setSymbols(color);
        			drawtoolbar.deactivate();
		    		var mode = $("#markupSelect option:selected").val();        			
		    		plugin.activateDrawTool(drawtoolbar, mode);        			
        		}
        	});

        	var clear = $("<button>Clear</button>");
        	clear.button().click(function(){
        		plugin.graphicsLayer.clear();
        	});
        	dialog.append(clear);




            this.createSymbolOptions(dialog);


        },
        createSymbolOptions:function(dialog){
            var plugin = this;
            var div = $("<ul class='markeroptions' style='display:block'><li><b>Marker</b></li></ul>");
            dialog.append(div);
            var li = $("<li>Size  </li>")
            var sizeselect = $("<input type='number' value='10' style='width:60px'></input>");
            li.append(sizeselect);
            $(sizeselect).kendoNumericTextBox({
                format:"#",
                min:0,
                max:40,
                step:1
            });
            div.append(li);

            li = $("<li>Style  </li>");
            var shapeselect = $("<select></select>");
            shapeselect.append("<option value='circle'>Circle</option>");
            shapeselect.append("<option value='square'>Square</option>");
            shapeselect.append("<option value='cross'>Cross</option>");
            shapeselect.append("<option value='x'>X</option>");
            shapeselect.append("<option value='diamond'>Diamond</option>");                                                
            li.append(shapeselect);

            
            shapeselect.kendoDropDownList({change:function(){
                var type = $("option:selected", shapeselect).val();
                plugin.symbols.marker.setStyle(type);
            }});
            div.append(li);
            
            div = $("<ul class='lineoptions' style='display:block'><li><b>Outline</b></li></ul>");
            dialog.append(div);

            li = $("<li>Width  </li>")
            var widthselect = $("<input type='number' value='10' style='width:60px'></input>");
            li.append(widthselect);
            $(widthselect).kendoNumericTextBox({
                format:"#",
                min:0,
                max:10,
                step:1
            });

            div.append(li);
            li = $("<li>Style  </li>");           
            var lineselect = $("<select></select>");
            lineselect.append("<option value='solid'>Solid</option>");
            lineselect.append("<option value='dash'>Dash</option>");
            lineselect.append("<option value='dot'>Dot</option>");
            lineselect.append("<option value='dashdot'>Dash Dot</option>");

            li.append(lineselect);
            lineselect.kendoDropDownList({change:function(){
                var type = $("option:selected", lineselect).val();
                plugin.symbols.line.setStyle(type);
            }});
            div.append(li);

            div = $("<ul class='filloptions' style='display:block'><li><b>Fill<b/></li></ul>");
            dialog.append(div);
            li = $("<li>Opacity  </li>");
            var opacityselect = $("<input type='number' value='50' style='width:60px'></input>");
            li.append(opacityselect);            
            $(opacityselect).kendoNumericTextBox({
                format:"#",
                min:0,
                max:100,
                step:1
            });

            div.append(li);
            li = $("<li>Style  </li>");     
            var fillselect = $("<select></select>");
            fillselect.append("<option value='null'>None</option>");
            fillselect.append("<option value='solid'>Solid</option>");
            fillselect.append("<option value='horizontal'>Horizontal</option>");
            fillselect.append("<option value='vertical'>Vertical</option>");
            fillselect.append("<option value='forwarddiagonal'>Forward Diagonal</option>");
            fillselect.append("<option value='backwarddiagonal'>Backward Diagonal</option>");
            fillselect.append("<option value='cross'>Cross</option>");
            fillselect.append("<option value='diagonalcross'>Diagonal Cross</option>");


            li.append(fillselect);          
            fillselect.kendoDropDownList({change:function(){
                var type = $("option:selected",fillselect).val();
                plugin.symbols.fill.setStyle(type);
            }}); 
            div.append(li);

            $("li", dialog).css("padding-bottom","5px");

        }

        ,clearDrawTool:function(handlers){
	 		$(handlers).each(function(i, handler){
				dojo.disconnect(handler);
			});       	
        },activateDrawTool:function(draw, type){
        	var plugin = this;
        	draw.deactivate();
        	draw.activate(type);
        	draw.setFillSymbol(this.symbols.fill);
        	draw.setMarkerSymbol(this.symbols.marker);     
        	draw.setLineSymbol(this.symbols.line);     
            this.clearDrawTool(drawhandlers);                   	   	
        	drawhandlers.push(dojo.connect(draw, "onDrawEnd", function(geometry){
        		plugin.markupDrawEnd(geometry);
        	}));
        },markupDrawEnd:function(geometry){

        	var symbol;

        	switch (geometry.type){
        		case "point":
        			symbol = this.symbols.marker;
        			break;
        		case "polyline":
        		    symbol = this.symbols.line;
        			break;
        		case "polygon":
        		    symbol = this.symbols.fill;
        			break;
        		case "extent":
        		    symbol = this.symbols.fill;
        			break;
        	}
            var graphic = new esri.Graphic(geometry, symbol);
			this.graphicsLayer.add(graphic);

        },setSymbols:function(color){
        	this.symbols = {marker:null, fill:null, line:null};
        	this.symbols.marker = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10,
			   new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
			   color, 1),
			   color);
        	this.symbols.fill = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL,
  				new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
  				color, 4),color);
			this.symbols.line = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
			  color, 4);        	
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