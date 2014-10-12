;(function ( $, window, document, undefined ) {

    var pluginName = "historic",
		defaults = {
			title: 'Historic Imagery',
			id: 'historicDialog'
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
        	$(this.element).append("<img src='"+this.options.tool.icon+"' style='max-height:30px'>"+this.options.tool.label+"</img>");
        	if (this.options.tool.toggle){
        		$(this.element).addClass('toggle');
        	}
        	$(this.element).click(function(){
        		var dialog = $("#"+plugin.options.id);
				if (dialog.length == 0){
					dialog = $("<div id='"+plugin.options.id+"'></div>");
					plugin.createDialog(plugin.element, plugin.options, dialog);
				}

				$(dialog).dialog("open");	
        	});	         
		         

        },

        createDialog: function(el, options, dialog) {
			$(el).append(dialog);
			dialog.dialog({autoOpen:false});
			dialog.dialog("option","title", options.title);	
			this.createContent(el, options, dialog);
        },

        createContent: function(el, options, dialog){
        	var plugin = this;
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