var pin = '',reid,propresults,propinfo, pins = [];


function CreatePropertySearch(){
	var html = "Search By  <select id='propertySelect'>";
	html += "<option>Address</option>";
	html += "<option>Street Name</option>";
	html += "<option>Owner</option>";
	html += "<option>PIN</option>";
	html += "<option>REID</option></select>";
	html += "<div><input id='propertyinput' type='text'></input></div>";



	$("#propertydiv").append(html);
	$("#propertySelect").change(function(){
		$("#propertyinput").val(" ");
	});
	$("#propertyinput").autocomplete({
		source: function(request, response){
			$.ajax({
				url:config.property.soe+"/AutoComplete",
				dataType:"jsonp",
				data:{
					input: $("#propertyinput").val(),
					type:$("#propertySelect option:selected").val(),
					f:"json"
				},success:function(data){
					response($.map(data.Results, function(item){
						return{
							label:item,
							value:item
						}
					}));
				}
			});
		},minLength:4,
		select:function(event, ui){
			var values = [];
			values.push(ui.item.value);
			SearchRealEstateAccounts(dojo.toJson(values),$("#propertySelect option:selected").val(), true);
		}
	});

	$("#propertydiv").append("<div id='proptabs'></div>");

	AddTabs();

	$("#resultsContainer").append("<ul class='resultsul'><li class='headerli'>Owner</li><li class='headerli'>Address</li><li class='headerli'>PIN</li></ul><div id='resultsdiv' class='propertydiv'></div>");
	$(".headerli").click(HeaderClick);
}

function HeaderClick(){
	if(propresults || propinfo){
		switch($(this).text()){
			case "Owner":
				break;
			case "Address":
				break;
			case "PIN":
				break;
			case "Field":
				SortPropertyInfo("field")
				break;
			case "Value":
				break;
		}
	}
}

function SortPropertyInfo(field){
	propinfo = propinfo.sort(function(a,b){
		var texta = a[field];
		var textb = b[field];
		return(texta < textb) ? -1 : (texta >textb) ? 1 : 0;
	})
}

function SearchRealEstateAccounts(values, type, zoom){
	ShowProgress("Searching Real Estate Accounts...");
	/*$.ajax({
		url:config.property.soe+"/RealEstateSearch",
		dataType:"jsonp",
		type:'POST',
		data:{
			values: values,
			type:type,
			f:"json"
		},success:function(data){
			HideProgress();
			propresults = data;
			$("#resultsdiv").empty();
			var pins = [];
			$(data.Accounts).each(function(i, account){
				if (i%2 == 0){
					$("#resultsdiv").append("<ul class='resultsul even'><li class='resultsli' value='"+account.pin+"'>"+account.owner+"</li><li class='resultsli' value='"+account.pin+"'>"+account.siteAddress+"</li><li class='resultsli' value='"+account.pin+"'>"+account.pin+"</li></ul>");
				}else{
					$("#resultsdiv").append("<ul class='resultsul odd'><li class='resultsli' value='"+account.pin+"'>"+account.owner+"</li><li class='resultsli' value='"+account.pin+"'>"+account.siteAddress+"</li><li class='resultsli' value='"+account.pin+"'>"+account.pin+"</li></ul>");
				}
				if (pins.length <= 1000){
					if ($.inArray(account.pin, pins) == -1){
						pins.push("'"+account.pin+"'");
					}
				}

				if (data.Accounts.length == 1){
					EnableTabs();
					SwitchTabs($("#infoContainer"));
					SelectTab(1);
					AddPropertyInfo(data.Accounts[0], data.Fields);
				}else{
					SwitchTabs($("#resultsContainer"));
					DisableTabs();
				}

			});
			AddPropertiesToMap(pins);
			$(".resultsli").click(function(e){
				EnableTabs();
				SwitchTabs($("#infoContainer"));
				SelectTab(1);
				AddPropertyInfo(data.Accounts[$(this).parent().index()], data.Fields);
				AddSinglePropertyToMap($(this).val());
			});
		}, error:function(error){
			HideProgress();
		}
	});	*/

	var request = esri.request({
		url:config.property.soe+"/RealEstateSearch",
		handleAs:"json",
		content:{
			values: values,
			type:type,
			f:"json"
		}}, {usePost:true});
	request.then(function(data){
			HideProgress();
			propresults = data;
			$("#resultsdiv").empty();
			pins = [];
			$(data.Accounts).each(function(i, account){
				if (i%2 == 0){
					$("#resultsdiv").append("<ul class='resultsul even'><li class='resultsli' value='"+account.pin+"'>"+account.owner+"</li><li class='resultsli' value='"+account.pin+"'>"+account.siteAddress+"</li><li class='resultsli' value='"+account.pin+"'>"+account.pin+"</li></ul>");
				}else{
					$("#resultsdiv").append("<ul class='resultsul odd'><li class='resultsli' value='"+account.pin+"'>"+account.owner+"</li><li class='resultsli' value='"+account.pin+"'>"+account.siteAddress+"</li><li class='resultsli' value='"+account.pin+"'>"+account.pin+"</li></ul>");
				}
				if (pins.length <= 1000){
					if ($.inArray(account.pin, pins) == -1){
						pins.push("'"+account.pin+"'");
					}
				}

				if (data.Accounts.length == 1){
					EnableTabs();
					SwitchTabs($("#infoContainer"));
					SelectTab(1);
					AddPropertyInfo(data.Accounts[0], data.Fields);
				}else{
					SwitchTabs($("#resultsContainer"));
					DisableTabs();
				}

			});
			AddPropertiesToMap(pins, zoom);
			$(".resultsli").click(function(e){
				EnableTabs();
				SwitchTabs($("#infoContainer"));
				SelectTab(1);
				AddPropertyInfo(data.Accounts[$(this).parent().index()], data.Fields);
				AddSinglePropertyToMap($(this).val());
			});
		},function(error){
			HideProgress();
		});

}
function AddPropertiesToMap(pins, zoom){
	var where = "PIN_NUM IN ("+pins.toString()+")";
	var q = new esri.tasks.Query();
	q.where = where;
	q.returnGeometry = true;
	q.outFields = ['PIN_NUM', 'OWNER', 'SITE_ADDRESS', 'REID'];
	var qt = new esri.tasks.QueryTask(config.property.propertyService);
	ShowProgress("Searching Property Location...");
	qt.execute(q, function(featureset){
		HideProgress();
		map.graphics.clear();
		$(featureset.features).each(function(i, feature){
			feature.setSymbol(new esri.symbol.SimpleFillSymbol(config.property.symbolMultiple));
			map.graphics.add(feature);
		});
		if (zoom){
			map.setExtent(esri.graphicsExtent(map.graphics.graphics), true);			
		}

	}, function(error){
		HideProgress();
	} );
}

function AddSinglePropertyToMap(pin){
	$(map.graphics.graphics).each(function(i,graphic){
		if (graphic.attributes.PIN_NUM == pin){
			graphic.setSymbol(new esri.symbol.SimpleFillSymbol(config.property.symbolSingle));
			//map.setExtent(graphic.geometry.getExtent(), true);
			//map.graphics.graphics.splice(i,1);
			//map.graphics.graphics.push(graphic);

		}
	});
}

function AddTabs(){
	var tabbar = $("#proptabs");
	tabbar.append("<ul id='tabsul'></ul>");
	$("#tabsul").append("<li id='resultstab' value='results' title='Results' class='tabli enabled'><img src='./img/results_selected.png'></img></li>");
	$("#propertydiv").append("<div id='resultsContainer' class='tabcontainer header visible'></div>");
	$("#tabsul").append("<li class='tabli disabled' value='info' title='Property Information'><img src='./img/info_disabled.png'></img></li>");
	$("#propertydiv").append("<div id='infoContainer' class='tabcontainer header invisible'><ul class='infoul'><li class='headerli'>Field</li><li class='headerli'>Value</li></ul><div id='infodiv' class='propertydiv'></div></div>");
	$("#tabsul").append("<li class='tabli disabled' value='photos' title='Building Photos'><img src='./img/photo_disabled.png'></img></li>");
	$("#propertydiv").append("<div id='photoContainer' class='tabcontainer invisible'><div id='photodiv' class='propertydiv'></div></div>");
	$("#tabsul").append("<li class='tabli disabled' value='deeds' title='Deeds'><img src='./img/deed_disabled.png'></img></li>");
	$("#propertydiv").append("<div id='deedContainer' class='tabcontainer invisible'></div>");
	$("#tabsul").append("<li class='tabli disabled' value='tax' title='Tax Information'><img src='./img/tax_disabled.png'></img></li>");
	$("#propertydiv").append("<div id='bufferContainer' class='tabcontainer invisible'></div>");	
	$("#tabsul").append("<li class='tabli disabled' value='buffer' title='Buffer'><img src='./img/buffer_disabled.png'></img></li>");
	$("#propertydiv").append("<div id='bufferContainer' class='tabcontainer invisible'></div>");
	$("#tabsul").append("<li class='tabli disabled' value='services' title='Services'><img src='./img/services_disabled.png'></img></li>");
	$("#propertydiv").append("<div id='servicesContainer' class='tabcontainer invisible'></div>");
	$("#tabsul").append("<li class='tabli disabled' value='addresses' title='Addresses'><img src='./img/address_disabled.png'></img></li>");
	$("#propertydiv").append("<div id='addressesContainer' class='tabcontainer invisible'></div>");	
	$(".tabli").click(TabClick);
}

function EnableTabs(){
	$(".tabli").removeClass("disabled");
	$(".tabli").addClass("enabled");


	$(".tabli img").each(function(i, img){
		var src = $(img).attr("src").replace('_disabled','_default');
		$(img).attr("src",src);
	});
}

function DisableTabs(){
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
}

function SwitchTabs(container){
	$('.tabcontainer').removeClass("visible");
	$('.tabcontainer').addClass("invisible");
	$(container).removeClass("invisible");
	$(container).addClass("visible");
}

function AddPropertyInfo(info, fields){

	pin = info['pin'];
	reid = info['reid'];
	$("#infodiv").empty();
	var cnt=0;
	var i=0;
	
	for (var key in info){
		var type = fields[i].type;
		var alias = fields[i].alias;
		var value = info[key];

		if (type == "currency"){
			value = FormatToCurrency(value);
		}

		if (cnt%2 == 0){
			if(info[key] != ' '){
				$("#infodiv").append("<ul class='infoul even'><li class='infoli'>"+alias+"</li><li class='infoli'>"+value+"</li></ul>");
				cnt += 1;					
			}

		}else{
			if(info[key] != ' '){
				$("#infodiv").append("<ul class='infoul odd'><li class='infoli'>"+alias+"</li><li class='infoli'>"+value+"</li></ul>");
				cnt += 1;	
			}
		}	

		i+=1;

	}

	GetSepticPermits(pin, $("#infodiv"));


}

function GetSepticPermits(pin, div){
	ShowProgress("Searching Septic Permits...");
	$.ajax({
		url:config.property.soe+"/Septic Permits",
		dataType:"jsonp",
		data:{
			pin: pin,
			f:"json"
		},success:function(data){
			HideProgress();

			$(data['Septic Permits']).each(function(i, permit){
				var permnum = permit.permitNumber;
				var permul = $("<ul class='infoul'><li class='infoli'>Septic Permit</li><li class='infoli'><a href='http://imaps.co.wake.nc.us/imaps/RequestedPermit.aspx?permit="+permnum+"' target='_blank'>"+permnum+"</a></li></ul>");

				if (div.children().length%2 == 0){
					permul.addClass("even");
				}else{
					permul.addClass("odd");
				}

				div.append(permul);

			});
			
		}, error:function(error){
			HideProgress();
		}
	});	
}



function TabClick(e){
	var index = $(this).index();
	if ($(this).hasClass("enabled")){
		SwitchTabs(".tabcontainer:eq("+index+")");
		SelectTab(index);


		$("img", this).attr("src",$("img", this).attr("src").replace("_default", "_selected"));
		switch (index){
			case 2:
				GetPhotoInfo();
				break;
			case 3:
				GetDeedInfo();
				break;
			case 4:
				window.open("http://services.wakegov.com/realestate/Account.asp?id="+reid,"_blank");
				//var url = "http://services.wakegov.com/realestate/Account.asp?id="+reid;
				//$("#dialog").empty();
				//$("#dialog").append("<iframe src='"+url+"'></iframe>");
				//$("#dialog").dialog("open");
				break;
		}
	}

}

function SelectTab(index){
	var src = $("img",".tabli").eq(index).attr("src");
	src = src.replace('_default','_selected');

	$("img",".tabli").eq(index).attr("src",src);

	$("img",".tabli").not(":eq("+index+")").each(function(i,img){
		src = $(img).attr("src");
		src = src.replace('_selected','_default');	
		$(img).attr("src",src);
	});
}

function GetPhotoInfo(){
	ShowProgress("Searching Photo Database...");
	$.ajax({
		url:config.property.soe+"/PhotoSearch",
		dataType:"jsonp",
		data:{
			reid: reid,
			f:"json"
		},success:function(data){
			HideProgress();
			$("#photodiv").empty();

			$(data.Photos).each(function(i, photo){
				var url = "http://services.wakegov.com/realestate/photos/mvideo/"+photo.imageDir+"/"+photo.imageName;
				$("#photodiv").append("<img src='"+url+"' style='max-width:100%;max-height:100%'/>");
			});
			$("#photodiv img").click(function(e){


				var dialog = $("#photodialog");
				if (dialog.length == 0){
					dialog = CreateDialogBox("photodialog", "Building Photo");		
				}
				dialog.empty();
				dialog.append("<img src='"+$(this).attr("src")+"'/img>");
				dialog.css("width",$("#dialog img").css("height"));
				dialog.dialog("open");


			});
		}, error:function(error){
			HideProgress();
		}
	});	
}

function GetDeedInfo(){
	ShowProgress("Searching Deed Database...");
	$.ajax({
		url:config.property.soe+"/DeedSearch",
		dataType:"jsonp",
		data:{
			reid: reid,
			f:"json"
		},success:function(data){
			HideProgress();
			$("#deedContainer").empty();
			var pins = [];
			$(data.Deeds).each(function(i, deed){
				$("#deedContainer").append("Book: "+deed.deedBook+ " Page: "+deed.deedPage+" Date: "+deed.deedDate);
				if (deed.deedDocNum != "0"){
					$("#deedContainer").append("<h3>Deed Document</h3><button class='deedbutton deedjava' value='"+deed.deedDocNum+"'>View</button><button class='deedbutton deedpdf' value='"+deed.deedDocNum+"'>PDF</button>");
				}				
				if (deed.bomDocNum != "0"){
					$("#deedContainer").append("<h3>Plat Document</h3><button class='deedbutton deedjava' value='"+deed.bomDocNum+"'>View</button><button class='deedbutton deedpdf' value='"+deed.bomDocNum+"'>PDF</button>");
				}

			});
			$(".deedbutton").button().click(function(){
				var url = "http://services.wakegov.com/booksweb/";
				if ($(this).hasClass("deedjava")){
					url+="docview.aspx?docid="+$(this).val();
				}else if ($(this).hasClass("deedpdf")){
					url+="pdfview.aspx?docid="+$(this).val()+"&RecordDate=";
				}
				window.open(url, "_blank");
			});
		}, error:function(error){
			HideProgress();
		}
	});	
}

function FormatToCurrency(num)
{
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
}