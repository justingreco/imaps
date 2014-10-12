;(function ( $, window, document, undefined ) {

    var pluginName = "asbuiltSearch",
		defaults = {
			title: 'As-Built Search',
			id: 'asbuiltdiv',
            progressid:"progressDialog",
            messageid:"progressMessage",
            services:[
                {
                    label:"Water",
                    url:"http://mapststarcsvr1:6080/arcgis/rest/services/AsBuilts/MapServer/1/query"
                },
                {
                    label:"Sewer",
                    url:"http://mapststarcsvr1:6080/arcgis/rest/services/AsBuilts/MapServer/0/query"
                }
            ],
            projectField:"PROJECT",
            sheetNumField:"SHEETNUM",
            sheetNameField:"SHEETNAME",
            imageurl:"http://mapststarcsvr1:6080/arcgis/rest/services/AsBuilts/imageserver"
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
            this.mr = new esri.layers.MosaicRule();
            this.mr.method = esri.layers.MosaicRule.METHOD_LOCKRASTER;
            this.imglayer = new esri.layers.ArcGISImageServiceLayer(this.options.imageurl);
            this.imglayer.setMosaicRule(this.mr);
            this.imglayer.setOpacity(0.5);
            this.imglayer.setVisibility(false);
            map.addLayer(this.imglayer);

        },

        createContent: function(container, options){
            var plugin = this;
            var select = $("<select style='margin-right:100px'></select>");
            $(options.services).each(function(i, service){
                select.append("<option value='"+service.url+"'>"+service.label+"</option>");
            });
            container.append(select);
            select.kendoDropDownList();

            container.append("<p/>");

            var input = $("<input type='text' style='width:97%'></input>");
            container.append(input);
           
            container.append("<p/>");

            var slider = $("<div style='padding:0px !important'></div>"); 
            container.append(slider);
            slider.slider({min:0, max:100, value:50, step:1,
                slide:function(event,ui){
                    plugin.imglayer.setOpacity(ui.value/100);
                }});
            container.append("<p/>");
            var list = $("<div id='asbuiltGrid'></div>");
            container.append(list);
            var url = $("option:selected", select).val();
            this.createAutoComplete(input, url, list, options);
            this.createGrid(list, options);
        },
        createAutoComplete:function(input, url, list, options){
            var plugin = this;


            var ds = new kendo.data.DataSource({
                serverFiltering:true,
                transport:{
                    read:function(option){
                        $.ajax({
                            url:url,
                            dataType:"jsonp",
                            data:{
                                where: "UPPER("+options.projectField+") LIKE '"+input.val().toUpperCase()+"%'",
                                outFields:options.projectField,
                                orderByFields:options.projectField,
                                f:"json",
                                returnGeometry:false,
                                returnDistinctValues:true
                            },success: function(data){
                                var items = [];
                                $(data.features).each(function(i, feature){
                                    items.push(feature.attributes[options.projectField]);
                                });

                                option.success(items);
                            }
                        });                        
                    }
                }
            });

            input.kendoAutoComplete({
                minLength:4,
                dataSource:ds,
                select:function(e){
                    var values = [];
                    values.push(e.item.text());
                    plugin.getSheets(e.item.text(), url, list, options);
                },highlightFirst:true,suggest:true
            });

            input.closest(".k-autocomplete").css("width","100%");
            input.closest(".k-autocomplete").css("margin","5px 0 5px 0");

        },

        createGrid:function(grid, options){
            var plugin = this;

            grid.on("mouseup", "a", function(e) {
                //$(e.target).closest("tr").removeClass("k-state-selected"); //remove select indication
                //todo: uncheck the box
                plugin.linkClicked = true;
            });

            grid.kendoGrid({
                pageable:false,
                sortable:true,
                resizeable:true,
                selectable:true,
                columns:[
                    {field:"sheet", title:"Sheet", encoded:false},
                    {field:"doc", title:"Document", encoded:false},
                    {image:"image", title:"Image", encoded:false, hidden:true}                                  
                ],
                change:function(e){
                    if(!plugin.linkClicked){
                        var row = this.select()[0];
                        var sheet = this.dataItem(row).image;
                        var q = new esri.tasks.Query();
                        var qt = new esri.tasks.QueryTask(options.imageurl);
                        q.where = "Name = '"+sheet+"'";
                        q.returnGeometry = true;
                        qt.execute(q, function(featureSet){

                            if (featureSet.features.length > 0){
                                var feature = featureSet.features[0];
                                plugin.mr.lockRasterIds = [feature.attributes.OBJECTID];
                                plugin.imglayer.setVisibility(true);
                                plugin.imglayer.setMosaicRule(plugin.mr);                             
                            }
                            
                        });
                    }


                    plugin.linkClicked = false;
                }
            });



        },

        getSheets:function(project, url, list, options){
            var plugin = this;
            var qt = new esri.tasks.QueryTask(url);
            var q = new esri.tasks.Query();
            q.returnGeometry = true;
            q.where = "PROJECT = '"+project+"'";
            q.outFields = ['*'];
            qt.execute(q, function(featureSet){
                var asbuilts = featureSet.features;
                map.setExtent(esri.graphicsExtent(featureSet.features), true);
                var sheets = [];
                 $(asbuilts).each(function(i, asbuilt){
                    var sheet = asbuilt.attributes[plugin.options.sheetNumField];
                    var project = asbuilt.attributes[plugin.options.projectField];
                    var image = asbuilt.attributes[plugin.options.sheetNameField].split(".")[0];

                    sheets.push({sheet:sheet,
                        doc:"<a href='http://gis.raleighnc.gov/asbuilts/"+project+"/"+image+".pdf' target='_blank'>PDF</a>",
                        image:image});
                });               

                 var ds = new kendo.data.DataSource({data:sheets});

                 $("#asbuiltGrid").data("kendoGrid").setDataSource(ds);
            });

        },

        refreshGrid:function(gridElement){
                var newHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;

                otherElements.each(function(){
                    otherElementsHeight += $(this).outerHeight();
                });

                gridElement.children(".k-grid-content").height(newHeight - otherElementsHeight);
                
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