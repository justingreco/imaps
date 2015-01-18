;(function ( $, window, document, undefined ) {

    var pluginName = "pictometry",
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