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
			  messageid:"progressMessage"
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
                width: '300px'
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
			dialog.append("Title  ");
			titleinput = $("<input style='margin-bottom:5px'></input>");
			dialog.append(titleinput);
			dialog.append("<br/>Layout  ");
			layoutselect = $("<select style='margin-bottom:5px'></select>");
			dialog.append(layoutselect);

			$(options.template.layouts).each(function(i,layout){
				layoutselect.append("<option>"+layout+"</option>");			
			});

			dialog.append("<br/>Format  ");
			formatselect = $("<select style='margin-bottom:5px'></select>");
			dialog.append(formatselect);
			$(options.template.formats).each(function(i, formats){
				formatselect.append("<option>"+formats+"</option>");
			});
			dialog.append("<br/>");
			var print = $("<div id='print_button'>Print</div>");	
			dialog.append(print);
			print.button().click(function(){
				plugin.printMap(plugin.options, $("option:selected", layoutselect).val(), $("option:selected", formatselect).val());
			});
        },

        printMap: function(options, layout, format){
        	var plugin = this;
	 		var template = new esri.tasks.PrintTemplate();
			template.exportOptions = {
			  width: 500,
			  height: 400,
			  dpi: 300
			};
			template.layoutOptions = {
				titleText:titleinput.val(),
				scalebarUnit:"Miles",
				copyrightText:""
			};
			template.format = format;
			template.layout = layout;
			template.preserveScale = true;

			var params = new esri.tasks.PrintParameters();
			params.map = options.map;
			params.template = template;
			var printer = new esri.tasks.PrintTask(options.url);

			this.showProgress(options,"Printing map, please wait...");
			printer.execute(params,function(result){
				window.open(result.url,"_blank");
				plugin.hideProgress(options);
			},function(){
				plugin.hideProgress(options);
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