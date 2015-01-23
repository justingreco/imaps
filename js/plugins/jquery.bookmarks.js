;(function ( $, window, document, undefined ) {

    var pluginName = "bookmarks",
		defaults = {
			title: 'Bookmarks',
			id: 'bookmarksdialog'
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
    //     	$(this.element).click(function(){
    //     		var dialog = $("#"+plugin.options.id);
				// if (dialog.length == 0){
				// 	dialog = $("<div id='"+plugin.options.id+"'></div>");
				// 	plugin.createDialog(plugin.element, plugin.options, dialog);
				// }
				// $(".ui-dialog-content").dialog("close");
				// $(dialog).dialog("open");	
    //     	});	    


		$(this.element).click(function(){
			Plugin.prototype.OpenWindow(this);

            //} 
           });

        },

        OpenWindow: function (el) {
            var dialog = $("#bookmarksdialog");
			$(".k-window .k-window-content").each(function(index, element){
			  $(element).data("kendoWindow").close();
			});
            var win;
            $(".ui-dialog-content").dialog("close");
            //if (dialog.length == 0){

                //dialog = CreateDialogBox("streetviewdialog", "Google Streetview");    
                dialog = $("<div id='bookmarksdialog'><div>");
                $("body").append(dialog);
                //pano = $("<div id='panorama'></div>");
                //dialog.append(pano);  
                //dialog.css("height", "100%");
                //dialog.css("width", "100%");
                win = dialog.kendoWindow({
                    title:"Bookmarks",
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
			$("body").append(dialog);
			dialog.dialog({autoOpen:false});
			dialog.dialog("option","title", options.title);	
			this.createContent(el, options, dialog);
        },

        createContent: function(el, options, dialog){
        	var plugin = this;
        	this.loadBookmarks(options);
			var list = $("<div id='bookmarkslist'></div>");
			dialog.append(list);
			$(options.config.bookmarks).each(function(i, bookmark){
				plugin.createNewBookmark(list,JSON.stringify(bookmark.extent), bookmark.name);
			});	

			var addinput = $("<input style='margin-right:10px;width:178px' class='input-sm'></input>");	
			dialog.append(addinput);
			var addbtn = $("<button class='btn btn-success pull-right'><span class='glyphicon glyphicon-plus-sign'></span> Add</button>").click(function(){

				plugin.createNewBookmark(list,JSON.stringify(map.extent), addinput.val());
				config.bookmarks.push({"name":addinput.val(),"extent":map.extent})
				plugin.storeBookmarks();	
				addinput.val("");	
			});    
			dialog.append(addbtn);
/*			addbtn.button().click(function(){

				plugin.createNewBookmark(list,JSON.stringify(options.config.map.extent), addinput.val());
				config.bookmarks.push({"name":addinput.val(),"extent":options.config.map.extent})
				plugin.storeBookmarks();	
				addinput.val("");	
			});    */    	
        },

        createNewBookmark: function(list, extent, name){
        	var plugin = this;
        	var bmdiv = $("<div class='bookmark' data-extent='"+extent+"'>"+name+"</div>");
			list.append(bmdiv);
			var delbtn = $("<button class='btn btn-danger btn-sm pull-right'><span class='glyphicon glyphicon-minus'></span></button>").click(function(){
				plugin.deleteBookmark($(this).parent());
			});;
			bmdiv.append(delbtn);
			// delbtn.button().click(function(){
			// 	plugin.deleteBookmark($(this).parent());
			// });
			$(bmdiv).click(plugin.bookmarkClick);
        },

        loadBookmarks: function(options){
			if(Modernizr.localstorage){
				if(localStorage[configName+"_bookmarks"]){
					options.config.bookmarks = $.parseJSON(localStorage.getItem(configName+"_bookmarks"));
				}
			}	
        },

        deleteBookmark: function(parent){
        	parent.remove();
			var index = $("#bookmarkslist").children().index(parent);
			config.bookmarks.splice(index, 1);
			this.storeBookmarks();	
        },

        storeBookmarks: function(){
	 		if(Modernizr.localstorage){
				localStorage.setItem(configName+"_bookmarks", dojo.toJson(config.bookmarks));			
			}       	
        },

        bookmarkClick: function(){
            var bookmark = $(this).data("extent");
        	require(['esri/geometry/Extent'], function (Extent) {
	 			var extent = new Extent(bookmark);
				map.setExtent(extent, true);  
        	});

        }
	};

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
           // if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
           // }
        });
    };

})( jQuery, window, document );
