;(function ( $, window, document, undefined ) {
    var pluginName = "menubar",
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
            $(this.element).css("height", $(this.element).parent().height()+"px");
            $(this.element).css("position", "absolute");
            $(this.element).css("right","0px").css("top","0px");
            var menu = $("<ul class='nav navbar-nav navbar-right'></ul");
            if (config.menu){
                $(config.menu.items).each(function(i, item){
                    //var list = $("<li>"+item.title+"</li>");
                    var list = $("<li class='dropdown'><a href='#' class='dropdown-toggle' data-toggle='dropdown' role='button' aria-expanded='false'>"+item.title+"<span class='caret'></span></a></li>");
                    var ul =$("<ul class='dropdown-menu menubar-list' role='menu'></ul>").appendTo(list);
                    if (item.items.length > 0){
                        $(item.items).each(function(j, subitem){
                            var sublist = $("<li><a href='#'>"+subitem.title+"</a></li>");
                            if (subitem.url){
                                sublist.click(function(){
                                    window.open(subitem.url);
                                })
                            }
                            ul.append(sublist);
                        });
                        list.append(ul);
                    }
                    menu.append(list);
                });
            }
            $(this.element).append(menu);
            //menu.kendoMenu();
        },
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