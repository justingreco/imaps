var layerlistloaded= false;

function CreateLayerList(){
	if (!layerlistloaded){
		CreateLayerNode();
	}
	layerlistloaded = true;
}

function CreateLayerNode(){
	$(config.map.oplayers.sort(SortFunction)).each(function(i, item){
		if(item.inlist){
			var tocdiv = $("<div></div>");
			$("#layersdiv").append(tocdiv);
			var layerdiv = $("<div></div>");
			var label = (item.visible)?"On":"Off";
			var layerdiv = $("<div></div>");
			var label = (item.visible)?"On":"Off";
			var minscale = (item.minscale)?item.minscale:0;
			var layercheck = $("<input type='checkbox' id='layer_check_"+i+"' value='"+item.id+"' data-minscale='"+minscale+"' class='layercheck'/>");
			if(item.visible){
				layercheck = $("<input type='checkbox' id='layer_check_"+i+"' value='"+item.id+"' data-minscale='"+minscale+"' class='layercheck' checked='checked'/>");
			}
			layerdiv.append(layercheck);

			layerdiv.append("<label for='layer_check_"+i+"' class='checklabel' title=''>"+label+"</label><h4>"+item.label+"</h4>");
			tocdiv.append(layerdiv);			
			layercheck.button().bind('change', LayerCheckButtonChange).css("background-color","red");	

			if (minscale < map.getScale() && minscale > 0){
				layercheck.button("option","disabled", true);
			}
			if(item.visible){
				//CreateSubLayerNode(layer,layerdiv);
				var layer = CreateLayer(item);
				map.addLayer(layer);
				dojo.connect(layer, "onLoad", function(loadedlayer){
					CreateSubLayerNode(loadedlayer, layerdiv);
					handlers.push(dojo.connect(loadedlayer,"onOpacityChange", LayerUpdated));
					handlers.push(dojo.connect(loadedlayer,"onUpdateEnd", LayerUpdated));
					handlers.push(dojo.connect(loadedlayer,"onSuspend", LayerUpdated));
					handlers.push(dojo.connect(loadedlayer,"onResume", LayerUpdated));
				});
			}
			/*var layer = map.getLayer(item.id);
			var layerdiv = $("<div></div>");
			var label = (layer.visible)?"On":"Off";
			var layercheck = $("<input type='checkbox' id='layer_check_"+i+"' value='"+layer.id+"' data-minscale='"+layer.minScale+"' class='layercheck'/>");
			if(layer.visible){
				layercheck = $("<input type='checkbox' id='layer_check_"+i+"' value='"+layer.id+"' data-minscale='"+layer.minScale+"' class='layercheck' checked='checked'/>");
			}
			layerdiv.append(layercheck);

			layerdiv.append("<label for='layer_check_"+i+"' class='checklabel' title=''>"+label+"</label><h4>"+item.label+"</h4>");
			tocdiv.append(layerdiv);


			layercheck.button().bind('change', LayerCheckButtonChange).css("background-color","red");	
			if (layer.minScale < map.getScale() && layer.minScale > 0){
				layercheck.button("option","disabled", true);
			}
			if(layer.visible){
				CreateSubLayerNode(layer,layerdiv);
			}*/
		}	
	});
	dojo.connect(map,"onZoomEnd", MapZoomEnd);

}

function MapZoomEnd(){
	var disabled = $(".layercheck, .sublayercheck").filter(function(){return $(this).data("minscale") < map.getScale() && $(this).data("minscale") > 0})
	var enabled = $(".layercheck, .sublayercheck").filter(function(){return $(this).data("minscale") > map.getScale()});

	disabled.button("option", "disabled", true);
	enabled.button("option", "disabled", false);

	$("label", disabled.parent()).prop("title", "Layer not visible at this scale");;
	$("label", enabled.parent()).removeProp("title");

}


function LayerCheckButtonChange(){
		var parent = $(this).parent();
		var sublayers = $('.sublayers', $(this).parent());
		var id = $(this).val();
		var layer = map.getLayer(id);
		if ($(this).is(":checked")){
										$(this).button("option", "label", "On");
			sublayers.css("display","block");

			if(!layer){

				var item = $(config.map.oplayers).filter(function(){
					return this.id == id;
				});
				layer = CreateLayer(item[0]);
				map.addLayer(layer);
				dojo.connect(layer, "onLoad", function(loadedlayer){
					layer.setVisibility(true);
					if($("> div.sublayers",parent).length == 0){
						CreateSubLayerNode(loadedlayer, parent);
					}
					handlers.push(dojo.connect(loadedlayer,"onOpacityChange", LayerUpdated));
					handlers.push(dojo.connect(loadedlayer,"onUpdateEnd", LayerUpdated));
					handlers.push(dojo.connect(loadedlayer,"onSuspend", LayerUpdated));
					handlers.push(dojo.connect(loadedlayer,"onResume", LayerUpdated));					
				});
			
			}else{
				layer.setVisibility(true);
			}

		}else{
			$(this).button("option", "label", "Off");
			sublayers.css("display","none");
			layer.setVisibility(false);
		}
}

function CreateSubLayerNode(layer,  div){
	var sublayersdiv = $("<div class='sublayers'></div>");
	div.append(sublayersdiv);
	var tocslider = $("<div class='tocslider'></div>");
	sublayersdiv.append(tocslider);
	tocslider.slider({min:0, 
		max:100, 
		value:layer.opacity*100,
		slide:function(event, ui){
			var id = $("input",$($(this).parent().parent())).val();
			var layer = map.getLayer(id);
			layer.setOpacity(ui.value/100);
			$(".legendimg", $($(this).parent().parent())).css("opacity", ui.value/100);
			$(".legendimg", $($(this).parent().parent())).css("filter", "alpha(opacity="+ui.value+")");
		}
	});
	$(layer.layerInfos).each(function(i, layerInfo){
		var sublayerdiv = $("<div class='sublayer' data-value='"+layerInfo.id+"'></div>");
		sublayersdiv.append(sublayerdiv);
		sublayersdiv.css("display","block");



		var visible = ($.inArray(layerInfo.id, layer.visibleLayers) > -1)?true:false;
		var label = (visible)?"On":"Off";

		if (layer.id == "parcels" && layerInfo.id == 4){
			//layerInfo.name = "Dimension Labels";
		}	

		var sublayercheck = $("<input class='sublayercheck' type='checkbox' id='check_"+layer.id+"_"+layerInfo.id+"' data-layer='"+layer.id+"' data-id='"+layerInfo.id+"' data-minscale='"+layerInfo.minScale+"'/>");
		if(visible){
			sublayercheck = $("<input class='sublayercheck' type='checkbox' checked='checked' id='check_"+layer.id+"_"+layerInfo.id+"' data-layer='"+layer.id+"' data-id='"+layerInfo.id+"' data-minscale='"+layerInfo.minScale+"'/>");	
		}

		sublayerdiv.append(sublayercheck);


		sublayerdiv.append("<label for='check_"+layer.id+"_"+layerInfo.id+"' class='checklabel'>"+label+"</label><div class='sublayertitle'><div>"+layerInfo.name+"</div></div>");
		if (layer.id == "parcels" && layerInfo.id == 4){
			sublayerdiv.css("display", "none");
		}	



		//if (visible){

		//}
		sublayersdiv.append(sublayerdiv);
		//sublayercheck.button().bind('change', SublayerCheckChange);

		if (layer.minScale < map.getScale() && layer.minScale > 0){
			sublayercheck.button("option","disabled", true);
		}
		var legenddiv = $("<div class='legend'></div>");
		sublayerdiv.append(legenddiv);
		legenddiv.css("display",(layerInfo.id, ($.inArray(layerInfo.id, layer.visibleLayers) > -1)?"block":"none"));

		sublayercheck.button().bind('change', SublayerCheckChange);
	});
	CreateLegendNode(layer, sublayersdiv);
}

function CreateLegendNode(layer, sublayersdiv){

	$.ajax({
		url:layer.url+"/legend",
		dataType:"jsonp",
		data:{
			f:"json"
		}, success:function(data){
			$(".sublayer", sublayersdiv).each(function(i, sublayerdiv){
				var id = $(sublayerdiv).data("value");
				var renderer = data.layers[id];
				if (renderer){
					var legenddiv = $(".legend", sublayerdiv);
					$(renderer.legend).each(function(j, item){
						legenddiv.append("<div><img class='legendimg' src='data:image/png;base64,"+item.imageData+"'/>"+item.label+"</div>");
					});
				}
			});
			$(".legendimg", sublayersdiv).css("opacity", layer.opacity);
			$(".legendimg", sublayersdiv).css("filter", "alpha(opacity="+layer.opacity*100+")");
		}
	});
}

function SublayerCheckChange(){
	var name = $(this).data("layer");
	var layer = map.getLayer(name);
	var id = $(this).data("id");
	var vislayers = layer.visibleLayers;
	var pos = $.inArray(id, vislayers);
	if ($(this).is(":checked")){
		$(this).button("option", "label", "On");
		$(".legend", $(this).parent()).css("display", "block");
		if (pos == -1){
			vislayers.push(id);
			if (name == "parcels" && id == 3){
				vislayers.push(id+1);
			}
		}
		
	}else{
		$(this).button("option", "label", "Off");
		$(".legend", $(this).parent()).css("display", "none");
		vislayers.splice(pos,1);
		if (vislayers.length == 0){
			vislayers.push(-1);
		}
		
	}	
	layer.setVisibleLayers(vislayers);
}

function SortFunction(dataA, dataB){
	return ((dataA.label < dataB.label) ? -1 : ((dataA.label > dataB.label) ? 1 : 0));
}