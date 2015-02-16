;(function ( $, window, document, undefined ) {
    var pluginName = "propertySearch",
		defaults = {
			title: 'Property Search',
			id: 'propertydiv',
            progressid: "progressDialog",
            messageid: "progressMessage",
            services:{
                url: "http://maps.raleighnc.gov/ArcGIS/rest/services/Services/ServicesIMaps/MapServer/identify",
                categories: [
                    {title: "Voting",
                        services: [
                            {
                                title: "Precinct [PRECINCT] Polling Place",
                                labels: "[POLL_PL];[ST_NUMBER] [ST_NAME:proper], [CITY:proper]",
                                layerId: 1,
                                url: ""
                            },
                            {
                                title: "State Senate District [DISTRICT]",
                                labels: "[NAME] ([PARTY]);<a href='[WEBSITE]' target='_blank'>Website</a>",
                                layerId: 2
                            },
                            {
                                title: "US House District [DISTRICT]",
                                labels: "[NAME] ([PARTY]);<a href='[WEBSITE]' target='_blank'>Website</a>",
                                layerId: 3
                            },
                            {
                                title: "State House District [DISTRICT]",
                                labels: "[NAME] ([PARTY]);<a href='[WEBSITE]' target='_blank'>Website</a>",
                                layerId: 4
                            },
                            {
                                title: "Wake County Commissioners District [DISTRICT]",
                                labels: "[NAME];<a href='http://www.wakegov.com/commissioners/districts/Pages/district[DISTRICT].aspx' target='_blank'>Website</a>",
                                layerId: 5
                            },
                            {
                                title: "Board of Education District [DISTRICT]",
                                labels: "[NAME];<a href='http://www.wcpss.net/Board/boeinfo.html' target='_blank'>Website</a>",
                                layerId: 6
                            },
                            {
                                title: "Raleigh Council District [DISTRICT]",
                                labels: "[NAME];<a href='http://www.raleighnc.gov/home/content/BoardsCommissions/Articles/CityCouncil.html' target='_blank'>Website</a>",
                                layerId: 7
                            },
                            {
                                title: "Cary Council District [DIST]",
                                labels: "[REP];<a href='http://www.townofcary.org/Departments/Town_Clerk_s_Office/Cary_Town_Council.htm' target='_blank'>Website</a>",
                                layerId: 8
                            }
                        ]
                    },
                    {title: "Planning",
                        services: [
                            {title: "Angier Zoning",
                                labels: "[CLASS]",
                                layerId: 11
                            },
                            {title: "Apex Zoning",
                                labels: "[CLASS]",
                                layerId: 12
                            },
                            {title: "Cary Zoning",
                                labels: "[NAME]",
                                layerId: 13
                            },
                            {title: "County Zoning",
                                labels: "[CLASS]",
                                layerId: 14
                            },
                            {title: "Fuquay-Varina Zoning",
                                labels: "[CLASS]",
                                layerId: 15
                            },
                            {title: "Garner Zoning",
                                labels: "[CLASS]",
                                layerId: 16
                            },
                            {title: "Holly Springs Zoning",
                                labels: "[CLASS]",
                                layerId: 17
                            },
                            {title: "Knightdale Zoning",
                                labels: "[CLASS]",
                                layerId: 18
                            },
                            {title: "Morrisville Zoning",
                                labels: "[CLASS]",
                                layerId: 19
                            },
                            {title: "Rolesville Zoning",
                                labels: "[CLASS]",
                                layerId: 20
                            },
                            {title: "Wake Forest Zoning",
                                labels: "[CLASS]",
                                layerId: 21
                            },
                            {title: "Wendell Zoning",
                                labels: "[CLASS]",
                                layerId: 22
                            },
                            {title: "Zebulon Zoning",
                                labels: "[CLASS]",
                                layerId: 23
                            },
                            {title: "City Limit",
                                labels: "[LONG_NAME:proper]",
                                layerId: 24
                            },
                            {title: "Planning Jurisdiction (ETJ)",
                                labels: "[JURISDICTION:proper]",
                                layerId: 25
                            },
                            {title: "Raleigh Annexation Year",
                                labels: "[CASE_YEAR]",
                                layerId: 27
                            },
                            {title: "Raleigh Future Landuse",
                                labels: "[Land_Use]",
                                layerId: 28
                            },{title: "Subdivision",
                                labels: "[NAME:proper]",
                                layerId: 29
                            },{title: "Development Plans",
                                labels: "File #: [CASE];Name: [FILE_NAME:proper]",
                                layerId: 30
                            }
                        ]
                    } ,
                    {title: "Solid Waste",
                        services: [
                            {title: "Collection Day",
                                labels: "[TRASH_COLLECTION_DAY];<a href='[URL]' target='_blank'>Website</a>;<a href='[HOLIDAY_URL]' target='_blank'>Holiday Schedule</a>",
                                layerId: 32
                            },{
                                title: "Trash Collection Route",
                                labels: "[Trash Route]",
                                layerId: 33
                            },{
                                title: "Yardwaste Collection Route",
                                labels: "[Yardwaste Route]",
                                layerId: 33
                            },{
                                title: "Bi-Weekly Recycling Collection",
                                labels: "Route: [Recycling Route]",
                                layerId: 33
                            },{
                                title: "Bi-Weekly Recycling Collection",
                                labels: "Collection Day: [Collection Day];Rollout Phase: <a href='http://www.raleighnc.gov/content/SolidWaste/Documents/[Collection Day:upper].pdf' target='_blank'>[PHASE]</a>;Rollout Start Date: [PHASE_DATE];Recycling Week: <a href='http://www.raleighnc.gov/content/SolidWaste/Documents/Calendars2012/[Collection Day][WEEK].pdf' target='_blank'>[WEEK]</a>",
                                layerId: 34
                            }
                        ]
                    },{title: "Public Safety",
                        services: [
                            {title: "Sheriff Zone",
                            labels: "[DISTRICT]",
                            layerId: 36},
                            {title: "Raleigh Police Beat",
                            labels: "[Name]",
                            layerId: 37},
                            {title: "Garner Police Beat",
                            labels: "[Name]",
                            layerId: 38},
                            {title: "Fire Insurance District",
                            labels: "[District]",
                            layerId: 39},
                            {title: "County Fire Response District",
                            labels: "[District]",
                            layerId: 40},
                            {title: "Raleigh Fire Response District",
                            labels: "[District]",
                            layerId: 41},
                            {title: "EMS Franchise District",
                            labels: "[District:proper]",
                            layerId: 42},
                            {title: "EMS Response District",
                            labels: "[District:proper]",
                            layerId: 43}
                        ]
                    },{title: "Environmental",
                        services: [
                            {title: "Floodplain",
                            labels: "[ZONE_IMAPS]",
                            layerId: 45},
                            {title: "Soils",
                            labels: "[NAME]",
                            layerId: 46},
                            {title: "Hydrologic Unit",
                            labels: "[HUC_CODE]",
                            layerId: 47},
                            {title: "Critical Wastershed",
                            labels: "[PROPWS]",
                            layerId: 48},
                            {title: "Drainage Basin",
                            labels: "[BASINS:proper]",
                            layerId: 50}
                        ]
                    },{title: "City of Raleigh Assessments",
                        services: [
                            {title: "Assement Liens",
                            labels: "Account #: [Account];Type: [Type];Status: [Status];Confirmed: [Confirmed Date];<a href='http://www.raleighnc.gov/home/content/Finance/Articles/OtherPaymentInformatio.html' target='_blank'>Website</a>",
                            layerId: 52}
                        ]
                    }
                ]
            }
		};
    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.fields = [];
        Plugin.prototype.options = this.options;
        this.init();
    }
    Plugin.prototype = {
        init: function() {
            $("#accordion").on('accordionactivate', function (event, ui) {
                if ($(ui.newPanel).attr('id') === 'propertydiv') {
                    Plugin.prototype.refreshGrid();
                }
            });
            dojo.require("esri.layers.graphics");
			var header = $("<h3>"+this.options.title+"</h3>");
			var container = $("<div id='"+this.options.id+"' class='paneldiv'></div>");
			$(this.element).append(header);
			$(this.element).append(container);
            $( "#accordion" ).on( "accordionactivate", function( event, ui ) {
                if (ui.newPanel.attr('id') === 'propertydiv') {
                    Plugin.prototype.refreshGrid();
                }});
            container.append("Search By  ");
			var select = $("<select id='propertySelect'></select>");
			var options = "<option>Address</option>";
			options += "<option>Street Name</option>";
			options += "<option>Owner</option>";
			options += "<option>PIN</option>";
			options += "<option>REID</option>";
			select.append(options);
			container.append(select);
			var inputdiv = $("<div></div>");
			var input = $("<input id='propertyinput' type='search'></input>");
			inputdiv.append(input);
			container.append(inputdiv);
			this.createAutoComplete(input);
			this.addTabs(container);
		    $(select).kendoDropDownList({change:function(){
                $("#propertyinput").val(" ");
            }});
            $(".k-header", container).css("background-color", "#444");
            this.createResultsGrid($("#resultsContainer"));
			this.checkUrl();
        },
        addTabs: function(container){
            var tabs = $("<div id='proptabs'></div>");
            container.append(tabs);
            var tabul = $("<ul id='tabsul'></ul>");
            tabs.append(tabul);
            tabul.append("<li id='resultstab' value='results' title='Results' class='tabli enabled'><img src='./img/results_selected.png'></img></li>");
            container.append("<div id='resultsContainer' class='tabcontainer header visible'></div>");
            tabul.append("<li class='tabli disabled' value='info' title='Property Information'><img src='./img/info_disabled.png'></img></li>");
            container.append("<div id='infoContainer' class='tabcontainer header invisible'></div>");
            tabul.append("<li class='tabli disabled' value='photos' title='Building Photos'><img src='./img/photo_disabled.png'></img></li>");
            container.append("<div id='photoContainer' class='tabcontainer invisible'><div id='photodiv' class='propertydiv'></div></div>");
            tabul.append("<li class='tabli disabled' value='deeds' title='Deeds'><img src='./img/deed_disabled.png'></img></li>");
            container.append("<div id='deedContainer' class='tabcontainer invisible'></div>");
            tabul.append("<li class='tabli disabled' value='tax' title='Tax Information'><img src='./img/tax_disabled.png'></img></li>");
            container.append("<div id='taxContainer' class='tabcontainer invisible'></div>");
            tabul.append("<li class='tabli disabled' value='buffer' title='Buffer'><img src='./img/buffer_disabled.png'></img></li>");
            container.append("<div id='bufferContainer' class='tabcontainer invisible'></div>");
            tabul.append("<li class='tabli disabled' value='services' title='Services'><img src='./img/services_disabled.png'></img></li>");
            container.append("<div id='servicesContainer' class='tabcontainer invisible' style='overflow-y:auto'></div>");
            tabul.append("<li class='tabli disabled' value='addresses' title='Addresses'><img src='./img/address_disabled.png'></img></li>");
            container.append("<div id='addressesContainer' class='tabcontainer invisible'></div>");
            //handle issue with tabbar position//
            container.css("height","100%");
            $(".tabli").click(function(){
                _gaq.push(['_trackEvent', 'Property Search', 'Tab Click', this.title]);
                Plugin.prototype.tabClick($(this));
            });
        },
        createAutoComplete: function(input){
            var ds = new kendo.data.DataSource({
                serverFiltering:true,
                transport:{
                    read:function(options){
                        $.ajax({
                            url:config.property.soe+"/AutoComplete",
                            dataType: "jsonp",
                            data:{
                                input:input.val(),
                                type:$("#propertySelect option:selected").val(),
                                f: "json"
                            },success:function(data){
                                options.success(data.Results);
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

                    //track search parameter in GA//
                    _gaq.push(['_trackEvent', 'Property Search', $("#propertySelect option:selected").val(), e.item.text()]);

                    Plugin.prototype.searchRealEstateAccounts(dojo.toJson(values), $("#propertySelect option:selected").val(), false);
                },highlightFirst:true,suggest:true
            });
            input.closest(".k-autocomplete").css("width","100%");
            input.closest(".k-autocomplete").css("margin","5px 0 5px 0");
        },
        createResultsGrid:function(div){
            var grid = $("<table id='propResultsGrid' class='compact' style='overflow:hidden;'><thead><tr><th>Owner</th><th>Address</th><th>PIN #</th></tr></table>").appendTo(div);
            Plugin.prototype.t = grid.DataTable({
                paging: false,
                info: false,
                filter: false,
                scrollY: $("#resultsContainer").height(),
                scrollCollapse: true
            });

            $(window).bind("resize", function() {
                Plugin.prototype.refreshGrid();
            });
        },
        refreshGrid:function(){
            console.log($("#resultsContainer").height() - 26);
            $('.dataTables_scrollBody').css('height', $("#resultsContainer").height() - 26);//$('.dataTables_scrollHead').height());
            $('.dataTable').css('width', $("#resultsContainer").width());
        },
        searchRealEstateAccounts: function(values, type, zoom){
            Plugin.prototype.refreshGrid();
            Plugin.prototype.showProgress(Plugin.prototype.options,"Searching Real Estate...");
            $.ajax({
              url: config.property.soe+"/RealEstateSearch",
              type: 'POST',
              dataType: 'json',
              data: {
                values:values,
                type:type,
                f: "json"
              },
              complete: function(xhr, textStatus) {
                Plugin.prototype.hideProgress(Plugin.prototype.options);
              },
              success: function(data, textStatus, xhr) {
                $("#accordion").accordion('option', 'active', 0);
                Plugin.prototype.accounts = data.Accounts;
                $("#propResultsGrid").DataTable().clear();
                $.each(data.Accounts, function(i, account) {
                    var rowArray = [account.owner,account.siteAddress,account.pin];
                    var rowPos = $("#propResultsGrid").dataTable().fnAddData(rowArray);
                    var row = $("#propResultsGrid").dataTable().fnGetNodes(rowPos[0]);
                    $(row).attr('data-pin', account.pin);
                    $(row).attr('data-id', i);
                });
                pins = [];
                $(data.Accounts).each(function(i, account){
                    if (pins.length < 1000){
                        if ($.inArray(account.pin, pins) == -1){
                            pins.push("'"+account.pin+"'");
                        }
                    }
                });
                Plugin.prototype.fields = data.Fields;
                if (!data.error){
                    if (data.Accounts.length == 1){
                        Plugin.prototype.enableTabs();
                        Plugin.prototype.switchTabs($("#infoContainer"));
                        Plugin.prototype.selectTab(1);
                        Plugin.prototype.addPropertyInfo(data.Accounts[0], data.Fields);
                    }else{
                        Plugin.prototype.switchTabs($("#resultsContainer"));
                        Plugin.prototype.selectTab(0);
                        Plugin.prototype.disableTabs();
                    }

                    Plugin.prototype.addPropertiesToMap(pins, true);
                }
                Plugin.prototype.hideProgress(Plugin.prototype.options);
                $("#propResultsGrid tr").click(function () {
                    //var row = this.select()[0];
                    pin = $(this).data('pin');
                    var id = $(this).data('id');
                    Plugin.prototype.enableTabs();
                    Plugin.prototype.switchTabs($("#infoContainer"));
                    Plugin.prototype.selectTab(1);
                    Plugin.prototype.addPropertyInfo(Plugin.prototype.accounts[id], Plugin.prototype.fields);
                    if(pin.length == 9){
                        pin = "0"+pin;
                    }
                    Plugin.prototype.addSinglePropertyToMap(pin, true);
                });
              },
              error: function(xhr, textStatus, errorThrown) {
              }
            });
        },
        enableTabs:function(){
			$(".tabli").removeClass("disabled");
			$(".tabli").addClass("enabled");
			$(".tabli img").each(function(i, img){
				var src = $(img).attr("src").replace('_disabled','_default');
				$(img).attr("src",src);
			});
        },
        disableTabs:function(){
			$(".tabli").removeClass("enabled");
			$(".tabli").addClass("disabled");
			$("#resultstab").removeClass("disabled");
			$("#resultstab").addClass("enabled");
			$(".tabli img").each(function(i, img){
				if ($(img).parent().index() > 0){
					var src = $(img).attr("src").replace('_default','_disabled');
					src = src.replace('_selected','_disabled');
					$(img).attr("src",src);
				}
			});
        },
        switchTabs:function(container){
			$('.tabcontainer').removeClass("visible");
			$('.tabcontainer').addClass("invisible");
			$(container).removeClass("invisible");
			$(container).addClass("visible");
            Plugin.prototype.refreshGrid();
        },
        tabClick:function(tab){
        	var index = tab.index();
        	if(tab.hasClass("enabled")){
        		this.switchTabs(".tabcontainer:eq("+index+")");
        		this.selectTab(index);
				$("img", tab).attr("src",$("img", tab).attr("src").replace("_default", "_selected"));
				switch(index){
                    case 0:
                        break;
                    case 1:
                        break;
					case 2:
						this.getPhotoInfo();
						break;
					case 3:
						this.getDeedInfo();
						break;
					case 4:
						window.open("http://services.wakegov.com/realestate/Account.asp?id="+this.reid,"_blank");
						break;
                    case 5:
                        this.createBuffer($("#bufferContainer"));
                        break;
                    case 6:
                        this.getServices();
                        break;
                    case 7:
                        this.getAddresses();
                        break;
				}
        	}
        },
        selectTab:function(index){
			var src = $("img",".tabli").eq(index).attr("src");
			src = src.replace('_default','_selected');
			$("img",".tabli").eq(index).attr("src",src);

			$("img",".tabli").not(":eq("+index+")").each(function(i,img){
				src = $(img).attr("src");
				src = src.replace('_selected','_default');
				$(img).attr("src",src);
			});
        },
        addPropertyInfo:function(info, fields){
            this.pin = info['pin'];
            pin = info['pin'];
            this.reid = info['reid'];
            if ($("#propInfoGrid").length == 0){
            var grid = $("<table id='propInfoGrid' class='compact' style='overflow:hidden;'><thead><tr><th>Field</th><th>Value</th></tr></table>").appendTo($("#infoContainer"));
                Plugin.prototype.infoT = grid.DataTable({
                    paging: false,
                    info: false,
                    filter: false,
                    bSort: false,
                    scrollY: $(".dataTables_scrollBody").height(),
                    scrollCollapse: true
                });
                Plugin.prototype.refreshGrid();
            }
            var data = [];
            for(var i=0;i<fields.length;i++){
                var field = fields[i];
                var value = info[field.field];
                if (field.type == "currency"){
                    value = this.formatToCurrency(value);
                }
                if (value != " "){
                    data.push({field:field.alias, value:value});
                }
            }
            $("#propInfoGrid").DataTable().clear();
            $.each(data, function(i, d) {
               var rowArray = [d.field, d.value];
               var rowPos = $("#propInfoGrid").dataTable().fnAddData(rowArray);
               var row = $("#propInfoGrid").dataTable().fnGetNodes(rowPos[0]);
            });
            this.getSepticPermits(this.pin, $("#propInfoGrid"));
            this.checkWaterAnalysis(this.pin, $("#propInfoGrid"));
        },
        addGraphicLayersToMap:function(){
            this.multipleGl = new esri.layers.GraphicsLayer({id: "propmultgl"});
            map.addLayer(this.multipleGl);
            this.singleGl = new esri.layers.GraphicsLayer({id: "propsinglegl"})
            map.addLayer(this.singleGl);
        },
        addPropertiesToMap:function(pins, zoom){
            if (!this.multipleGl || !this.singleGl){
                this.addGraphicLayersToMap();
            }
            var where = "PIN_NUM IN ("+pins.toString()+")";
            var params = new esri.tasks.Query();
            params.where = where;
            params.returnGeometry = true;
            params.outFields = ['PIN_NUM', 'OWNER', 'SITE_ADDRESS', 'REID','CITY_DECODE'];
            var qt = new esri.tasks.QueryTask(config.property.propertyService);
            Plugin.prototype.showProgress(Plugin.prototype.options,"Searching Map...");
            qt.execute(params, function(results){
                Plugin.prototype.hideProgress(Plugin.prototype.options);
                Plugin.prototype.multipleGl.clear();
                Plugin.prototype.singleGl.clear();
                $(results.features).each(function(i, feature){
                    feature.setSymbol(new esri.symbol.SimpleFillSymbol(config.property.symbolMultiple));
                    Plugin.prototype.multipleGl.add(feature);
                    if (results.features.length == 1){
                        Plugin.prototype.addSinglePropertyToMap(feature.attributes.PIN_NUM, true);
                    }
                });
                if (zoom){
                    if (Plugin.prototype.multipleGl.graphics.length > 0) {
                        map.setExtent(esri.graphicsExtent(Plugin.prototype.multipleGl.graphics), true);
                    }
                }
            }, function(error){
                console.log(error);
                Plugin.prototype.hideProgress(Plugin.prototype.options);
            });
        },
        addSinglePropertyToMap:function(pin, zoom){
            var multiLayer = map.getLayer('propmultgl'),
                singleLayer = map.getLayer('propsinglegl');
            $(multiLayer.graphics).each(function(i,graphic){
                require(["esri/symbols/SimpleFillSymbol"], function (SimpleFillSymbol) {
                    if (graphic.attributes.PIN_NUM == pin){
                        Plugin.prototype.selProp = graphic;
                        graphic.setSymbol(new SimpleFillSymbol(config.property.symbolSingle));
                        multiLayer.remove(graphic);
                        singleLayer.clear();
                        singleLayer.add(graphic);
                        map.setExtent(graphic.geometry.getExtent(), true);
                        if (graphic.attributes.CITY_DECODE) {
                            if (graphic.attributes.CITY_DECODE.toUpperCase() == "RALEIGH"){
                                Plugin.prototype.addCrimeLink(graphic.geometry.getExtent().getCenter());
                            }
                        }
                    }
                });
            });
        },
        addCrimeLink:function(point){
            console.log(point.x);
               var rowArray = ["Crime Activity", "<a href='http://maps.raleighnc.gov/crime?location="+point.x+","+point.y+"' target='_blank'>View</a>"];
               var rowPos = $("#propInfoGrid").dataTable().fnAddData(rowArray);
               var row = $("#propInfoGrid").dataTable().fnGetNodes(rowPos[0]);
        },
        getSepticPermits:function(pin, div){
            Plugin.prototype.showProgress(Plugin.prototype.options,"Searching Septic Permits...");
        	$.ajax({
        		url:config.property.soe+"/SepticPermits",
        		dataType: "json",
        		data:{
        			pin:pin,
        			f: "json"
        		},success:function(data){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);

        			$(data['SepticPermits']).each(function(i, permit){
        			   var permnum = permit.permitNumber;
                       var rowArray = ["Septic Permit", "<a href='http://gisasp2.wakegov.com/imaps/RequestedPermit.aspx?permit="+permnum+"' target='_blank'>"+permnum+"</a>"];
                       var rowPos = $("#propInfoGrid").dataTable().fnAddData(rowArray);
                       var row = $("#propInfoGrid").dataTable().fnGetNodes(rowPos[0]);
        			});

        		}, error:function(error){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
        		}
        	});
        },
        checkWaterAnalysis:function(pin, div){
            Plugin.prototype.showProgress(Plugin.prototype.options,"Searching Water Analysis Samples...");
            $.ajax({
                url:config.property.soe+"/WellResults",
                dataType: "json",
                data:{
                    pin:pin,
                    f: "json"
                },success:function(data){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                    if (data['WellResults'].length > 0) {
                       var rowArray = ["Water Samples", "<a href='http://justingreco.github.io/water-analysis/app/index.html#/?pin="+pin+"' target='_blank'>View</a>"];
                       var rowPos = $("#propInfoGrid").dataTable().fnAddData(rowArray);
                       var row = $("#propInfoGrid").dataTable().fnGetNodes(rowPos[0]);
                    }
                }, error:function(error){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                }
            });
        },
        getPhotoInfo:function(){
            Plugin.prototype.showProgress(Plugin.prototype.options,"Searching Photos...");
            $.ajax({
                url:config.property.soe+"/PhotoSearch",
                dataType: "jsonp",
                data:{
                    reid: this.reid,
                    f: "json"
                },success:function(data){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                    $("#photodiv").empty();

                    $(data.Photos).each(function(i, photo){
                        var url = "http://services.wakegov.com/realestate/photos/mvideo/"+photo.imageDir+"/"+photo.imageName;
                        $("#photodiv").append("<img src='"+url+"' style='max-width:100%;max-height:100%'/>");
                    });
                    $("#photodiv img").click(function(e){
                        var win = $("#photowindow");
                        if (win.length == 0){
                            win = $("<div id='photowindow'></div>");
                            $("body").append(win);
                            win.kendoWindow({actions: ['Maximize','Close'], visible:false,width: "500px"});
                        }
                        win.empty();
                        win.append("<img src='"+$(this).attr("src")+"' style='max-width:100%;max-height:100%'/>");
                        win.data('kendoWindow').open();
                    });
                }, error:function(error){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                }
            });
        },
        getDeedInfo:function(){
            $("#deedContainer").css("padding", "10px");
            Plugin.prototype.showProgress(Plugin.prototype.options,"Searching Deeds...");
            $.ajax({
                url:config.property.soe+"/DeedSearch",
                dataType: "jsonp",
                data:{
                    reid: this.reid,
                    f: "json"
                },success:function(data){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                    $("#deedContainer").empty();
                    var pins = [];
                    $(data.Deeds).each(function(i, deed){
                        $("#deedContainer").append("Book: "+deed.deedBook+ "<br/>Page: "+deed.deedPage+"<br/>Date: "+deed.deedDate);
                        if (deed.deedDocNum != "0"){
                            $("#deedContainer").append("<h3>Deed Document</h3><button class='deedbutton deedjava btn btn-sm btn-default' value='"+deed.deedDocNum+"'>View</button><button class='deedbutton deedpdf btn btn-sm btn-default' value='"+deed.deedDocNum+"'>PDF</button>");
                        }
                        if (deed.bomDocNum != "0"){
                            $("#deedContainer").append("<h3>Plat Document</h3><button class='deedbutton deedjava btn btn-sm btn-default' value='"+deed.bomDocNum+"'>View</button><button class='deedbutton deedpdf btn btn-sm btn-default' value='"+deed.bomDocNum+"'>PDF</button>");
                        }
                    });
                    $(".deedbutton").click(function(){
                        _gaq.push(['_trackEvent', 'Property Search', 'Deeds', $(this).text()]);
                        var url = "http://services.wakegov.com/booksweb/";
                        if ($(this).hasClass("deedjava")){
                            url+="docview.aspx?docid="+$(this).val();
                        }else if ($(this).hasClass("deedpdf")){
                            url+="pdfview.aspx?docid="+$(this).val()+"&RecordDate=";
                        }
                        window.open(url, "_blank");
                    });
                }, error:function(error){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                }
            });
        },
        formatToCurrency:function(num){
			num = num.toString().replace(/\$|\,/g,'');
			if(isNaN(num))
			num = "0";
			sign = (num == (num = Math.abs(num)));
			num = Math.floor(num*100+0.50000000001);
			cents = num%100;
			num = Math.floor(num/100).toString();
			if(cents < 10)
			cents = "0" + cents;
			for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
			num = num.substring(0,num.length-(4*i+3))+','+ num.substring(num.length-(4*i+3));
			return (((sign)?'':'-') + '$' + num + '.' + cents);
        },
        getServices:function(){
            Plugin.prototype.showProgress(Plugin.prototype.options,"Getting Services...");
            if (this.options.services){
                var geometry = this.singleGl.graphics[0].geometry;
                geomService.simplify([geometry], function(geometries){
                    require(["esri/tasks/BufferParameters"], function (BufferParameters) {
                        var params = new BufferParameters();
                        params.distances = [-5];
                        params.unit = 9002;
                        params.geometries = geometries;
                        geomService.buffer(params, function(geometries){
                            Plugin.prototype.identifyServices(geometries[0]);
                        }, function(error){
                            Plugin.prototype.hideProgress(Plugin.prototype.options)
                        });
                    });
                },function(error){
                        Plugin.prototype.hideProgress(Plugin.prototype.options)
                });
            }
        },
        identifyServices:function(geometry){
            var container = $("#servicesContainer");
            var url = this.options.services.url;
            require(["esri/tasks/IdentifyParameters", "esri/tasks/IdentifyTask"], function (IdentifyParameters, IdentifyTask) {
                var params = new IdentifyParameters();
                params.geometry = geometry;
                params.height = map.height;
                params.width = map.width;
                params.mapExtent = map.extent;
                params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                params.tolerance = 1;
                var idTask = new IdentifyTask(url);
                idTask.execute(params, function(results){
                    container.empty();
                    $(Plugin.prototype.options.services.categories).each(function(i, category){
                        var html = "";
                        var numadded = 0;
                        var header = $("<h3>"+category.title+"</h3>");
                        $(header).css("text-decoration","underline").css("background-color","rgb(37,46,65)").css("padding","8px").css("margin-top","0px");
                        var div = $("<div class='servicediv'></div>");
                        $(category.services).each(function(j,service){
                            var result = $(results).filter(function(){
                                return this.layerId == service.layerId;
                            });
                            if (result.length > 0){
                                $(result).each(function(i, item){
                                    if (i == 0){
                                        div.append("<b>"+Plugin.prototype.getServiceLabel(service.title, service.layerId, item)+"</b><br/>");
                                    }
                                    div.append(Plugin.prototype.getServiceLabel(service.labels, service.layerId, item)+"<p/>");
                                });
                                numadded++;
                            }
                        });
                      if (numadded > 0){
                                container.append(header);
                                container.append(div);
                        }
                    });
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                },function(error){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                });
            });
        },
        getServiceLabel:function(label, id, service){
            var fieldCnt = label.split("[").length - 1;
            for (var i=0;i < fieldCnt;i++){
                var start = label.indexOf("[")+1;
                var end = label.indexOf("]");
                var field = label.substring(start,end);
                var arr = field.split(": ");
                field = arr[0];
                var value = service.feature.attributes[field];
                if (arr.length > 1){
                    value = Plugin.prototype.checkCase(value, arr[1]);
                    label = label.replace(new RegExp(field+": "+arr[1],"gi"), field);
                }
                label = label.replace('['+field+']', value);
            }
            label = label.replace(new RegExp(";", "gi"), "<br/>");
            return label;
        },
        checkCase:function(value, caseType){
            switch (caseType){
                case "upper":
                    value = value.toUpperCase();
                    break;
                case "lower":
                    value = value.toLowerCase();
                    break;
                case "proper":
                    value = value.toProperCase();
                    //handle NC abbreviation
                    value = value.replace(" Nc"," NC");
                    break;
            }
            return value;
        },
        createBuffer:function(div){
            if (div.children().length == 0){
                div.css("padding","10px");
                div.append("Distance");
                var span =$("<span style='margin:0 10px 0 10px;'></span>").appendTo(div);
                var input = $("<input id='propertyBufferDistance' type='number'></input>").css("width","100px").appendTo(span);
                var bufferBtn = $("<button>Buffer</button>").button().appendTo(div);
                input.kendoNumericTextBox({
                    format: "# ft",
                    min:0,
                    max:5000,
                    step:50,
                    value:500
                });
                bufferBtn.click(function(){
                    if (Plugin.prototype.selProp){
                        var dist = parseInt($("#propertyBufferDistance").val());
                        require(["esri/tasks/BufferParameters", "esri/tasks/GeometryService", "esri/tasks/query", "esri/tasks/QueryTask"], function (BufferParameters, GeometryService, Query, QueryTask) {
                            var params = new BufferParameters();
                            params.distances = [dist];
                            params.unit = GeometryService.UNIT_FOOT;
                            params.geometries = [Plugin.prototype.selProp.geometry];
                            geomService.buffer(params, function(geometries){
                                var qt = new QueryTask(config.property.propertyService);
                                var q = new Query();
                                q.outFields = ['PIN_NUM'];
                                q.geometry = geometries[0];
                                qt.execute(q, function(features){
                                    }, function(error){
                                    }
                                );
                            }, function(error){
                            });
                        });
                    }
                });
            }
        },
        getAddresses:function(){
            Plugin.prototype.showProgress(Plugin.prototype.options,"Searching Addresses...");
            $.ajax({
                url:config.property.soe+"/AddressSearch",
                dataType: "jsonp",
                data:{
                    reid: this.reid,
                    pin: this.pin,
                    f: "json"
                },success:function(data){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                    var grid = null;
                    if ($("#addressGrid").length == 0){
                        grid = $("<table id='addressGrid' class='compact' style='overflow:hidden;'><thead><tr><th>Address</th><th>Type</th><th>Description</th></tr></table>").appendTo($("#addressesContainer"));
                        Plugin.prototype.infoT = grid.DataTable({
                            paging: false,
                            info: false,
                            filter: false,
                            scrollY: $(".dataTables_scrollBody").height(),
                            scrollCollapse: true
                        });
                        Plugin.prototype.refreshGrid();
                    }
                    $("#addressGrid").DataTable().clear();
                    $.each(data.Addresses, function(i, d) {
                        console.log(d);
                        var rowArray  =[];
                        if (d.rpidMap) {
                            rowArray = [d.address + (($.trim(d.suite) != '') ? ' STE ' + d.suite : ''), d.type, d.status];
                        } else {
                            rowArray = [d.address, '', '', ''];
                        }
                       var rowPos = $("#addressGrid").dataTable().fnAddData(rowArray);
                    });
                    if (data.Addresses.length > 0) {
                        grid = $("#addressGrid").dataTable();
                        if (data.Addresses[0].rpidMap != null) {
                            grid.fnSetColumnVis( 1, true );
                            grid.fnSetColumnVis( 2, true );
                        } else {
                            grid.fnSetColumnVis( 1, false );
                            grid.fnSetColumnVis( 2, false );
                        }
                    }
                    Plugin.prototype.refreshGrid();
                }, error:function(error){
                    Plugin.prototype.hideProgress(Plugin.prototype.options);
                }
            });
        },
        checkUrl:function(){
            require(["esri/urlUtils"], function(urlUtils) {
                var urlObject = urlUtils.urlToObject(window.location.href);
                if (urlObject.query){
                    var query = urlObject.query;
                    if (query.pins){
                        var pins = query.pins.split(",");
                        Plugin.prototype.searchRealEstateAccounts(dojo.toJson(pins), "pin", false);
                    }
                }
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