;(function ( $, window, document, undefined ) {

    var pluginName = "utilitySearch",
		defaults = {
			title: 'Utility Search',
			id: 'utilitydiv',
            progressid:"progressDialog",
            messageid:"progressMessage",
            searches:[
                {label:"Meter #",
                    id:"meternum",
                    url:"http://gis.raleighnc.gov/ArcGIS/rest/services/PublicUtility/Water/MapServer/1",
                    field:"METER_NBR",
                    outFields:["METER_NBR","CCB_PREM_ID","PIN_NUM","IRIRRIGATI", "METER_SIZE", "UTRZCRT_RJ"]
                },
                {label:"Premise #",
                    id:"premisenum",
                    url:"http://gis.raleighnc.gov/ArcGIS/rest/services/PublicUtility/Water/MapServer/1",
                    field:"CCB_PREM_ID",
                    outFields:["METER_NBR","CCB_PREM_ID","PIN_NUM","IRIRRIGATI", "METER_SIZE", "UTRZCRT_RJ"]
                },      
                {label:"Hydrant #",
                    id:"hydrantnum",
                    url:"http://gis.raleighnc.gov/ArcGIS/rest/services/PublicUtility/Water/MapServer/0",
                    field:"ASSET_ID",
                    outFields:["INSTALLDATE", "LIFECYCLESTATUS","SUBTYPE","ELEVATION","NOZZLESIZE1","NOZZLESIZE2","NOZZLESIZE3","NOZZLESIZE4", "MANAFACTURER","UNITID","ASSET_ID","SOURCE","PROJECT_NAME","OWNERSHIP","JURISDICTION"]
                },    
                {label:"Facility ID",
                    id:"facilityid",
                    url:"http://gis.raleighnc.gov/ArcGIS/rest/services/PublicUtility/Water/MapServer/0",
                    field:"FACILITYID",
                    outFields:["INSTALLDATE", "LIFECYCLESTATUS","SUBTYPE","ELEVATION","NOZZLESIZE1","NOZZLESIZE2","NOZZLESIZE3","NOZZLESIZE4", "MANAFACTURER","UNITID","ASSET_ID","SOURCE","PROJECT_NAME","OWNERSHIP","JURISDICTION"]
                }                                       
            ]        
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
            
			var header = $("<h3>"+this.options.title+"</h3>");
			var container = $("<div id='"+this.options.id+"' class='paneldiv'></div>");
			$(this.element).append(header);	
			$(this.element).append(container);	
            this.createContent(container, this.options);

        },

        createContent: function(container, options){
            var plugin = this;
            var select = $("<select id='utilselect' style='margin-right:100px'></select>");
            $(options.searches).each(function(i, search){
                select.append("<option value='"+search.id+"'>"+search.label+"</option>");
            });
            container.append(select);
            select.kendoDropDownList();
            container.append("<p/>");
            var input = $("<input type='text' class='k-textbox' style='margin-right:10px'></input>");
            container.append(input);
            var searchbtn = $("<button>Search</button>");
            container.append(searchbtn.button().click(function(){
                var id = $("option:selected", select).val();
                var value = $(input).val();
                plugin.search(id, value, options, list);
            }));

            var list = $("<div id='utilitylist'></div>");
            container.append(list);
        },

        search:function(id, value, options, list){
            var plugin = this;
            var searches = $(options.searches).filter(function(i){
                return this.id == id;
            });

            if (searches.length > 0){
                var search = searches[0];
                var where = search.field+" = "+value;
                var url = search.url;
                var q = new esri.tasks.Query();
                var qt = new esri.tasks.QueryTask(url);
                q.where = where;
                q.returnGeometry = true;
                q.outFields = search.outFields;
                qt.execute(q, function(featureset){
                    map.centerAndZoom(featureset.features[0].geometry, 10);
                    plugin.listAttributes(featureset.features[0].attributes, list);
                });
            }

        },


        listAttributes:function(attributes, list){
            list.empty();
            for (var key in attributes){
                var value = attributes[key];
                var ul = $("<ul class='infoul'><li class='infoli'>"+key+"</li><li class='infoli'>"+value+"</li></ul>");
                list.append(ul);
            }

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