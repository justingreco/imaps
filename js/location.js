dojo.require("esri.dijit.Geocoder");

function CreateLocationSearch(){
	var html = "Search By  <select id='locationSelect'>";
	html += "<option>Address</option>";
	html += "<option>Intersection</option>";
	html += "<option>Place of Interest</option>";
	html += "<option>Subdivision</option>";
	html += "<option>Coordinates</option></select>";



	$("#locationdiv").append(html);

	AddContainers();
	CreateAddressSearch($("#addressContainer"));
	CreatePlaceSearch($("#poiContainer"));

	$("#locationSelect").change(function(){
		var index = $(this).prop("selectedIndex");
		SearchTypeChanged(".locationcontainer:eq("+index+")");
	});
}

function SearchTypeChanged(container){
	$('.locationcontainer').removeClass("visible");
	$('.locationcontainer').addClass("invisible");
	$(container).removeClass("invisible");
	$(container).addClass("visible");
}

function AddContainers(){
	var tabbar = $("#proptabs");
	$("#locationdiv").append("<div id='addressContainer' class='locationcontainer visible'></div>");
	$("#locationdiv").append("<div id='intersectionContainer' class='locationcontainer invisible'></div>");
	$("#locationdiv").append("<div id='poiContainer' class='locationcontainer invisible'></div>");
	$("#locationdiv").append("<div id='subdivisionContainer' class='locationcontainer invisible'></div>");
	$("#locationdiv").append("<div id='coordinatesContainer' class='locationcontainer invisible'></div>");
}


function CreateAddressSearch(container){
	container.append("<div id='geocoder'></div>");
	var geocoders = [{url:config.location.geocoder,name:"Wake Locator"}];
	var geocoder = new esri.dijit.Geocoder({map:map, geocoders:geocoders, arcgisGeocoder:false}, "geocoder");
	geocoder.startup();
}

function CreatePlaceSearch(container){

	$.ajax({
		url:config.location.poi+"/query",
		dataType:"jsonp",
		data:{
			where:"1=1",
			outFields:"ICON",
			orderByFields:"ICON",
			returnGeometry:false,
			returnDistinctValues:true,
			f:"json"
		},success:function(data){
			container.append("<select id='placetype'><option id='prompt'>Select Category...</option></select>");
			$(data.features).each(function (i, feature){
				$("#placetype").append("<option>"+feature.attributes.ICON+"</option>");
			});
			container.append("<select id='placename' style='display:none;'><option id='prompt'>Select Place...</option></select><div id='poiInfo'></div>");
			$("#placetype").change(PlaceTypeChanged);
		}
	});

}

function PlaceTypeChanged(){
	var category = $(this).val();
	$("#placename").css("display","block");
	$.ajax({
		url:config.location.poi+"/query",
		dataType:"jsonp",
		data:{		
			returnGeometry:false,
			outFields:"NAME",
			orderByFields:"NAME",
			where:"ICON = '"+category+"'",
			f:"json"
		},success:function(data){
			$("#placename").empty();
			$(data.features).each(function (i, feature){
				$("#placename").append("<option>"+feature.attributes.NAME+"</option>");
			});
		}
	});
	$("#placename").change(PlaceNameChanged);
}

function PlaceNameChanged(){
	var name = $(this).val();
	$.ajax({
		url:config.location.poi+"/query",
		dataType:"jsonp",
		data:{		
			returnGeometry:true,
			outFields:"*",
			where:"NAME = '"+name+"'",
			f:"json"
		},success:function(data){
			if (data.features.length > 0){
				var feature = data.features[0];
				map.centerAndZoom(feature.geometry, 10);
				var container = $("#poiInfo");
				container.empty();
				container.append("<h3>"+feature.attributes.NAME+"</h3>");
				container.append("<img src='http://maps.raleighnc.gov/photos/poi/"+feature.attributes.NAME+".jpg'/>");
				container.append("<div>"+feature.attributes.ADDRESS+"</div>");
				var city = feature.attributes.CITY+", NC";
				if (feature.attributes.ZIP){
					city += " "+feature.attributes.ZIP;
				}
				container.append("<div>"+city+"</div>");	
				if(feature.attributes.URL){	
					container.append("<div>"+feature.attributes.TELEPHONE +"</div>");
				}
	
				if(feature.attributes.URL){
					container.append("<div><a href='"+feature.attributes.URL+"' target='_blank'>Website</a></div>");						
				}		
						
			}
		}
	});
}