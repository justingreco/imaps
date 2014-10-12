(function($){
	$.fn.measureDialog = function(draw){

		var dialog = $("#measuredialog");
		if (dialog.length == 0){
			$.fn.measureDialog.initializedialog(this,$("<div id='measuredialog'></div>"), "Measure", draw);			
		}

		$(dialog).dialog("open");
	}


	$.fn.measureDialog.initializedialog = function(container,dialog, title, draw){
		$(container).append(dialog);
		dialog.dialog({autoOpen:false});
		dialog.dialog("option","title", title);	
		$.fn.measureDialog.createcontent(dialog, draw);

	};

	$.fn.measureDialog.createcontent = function(dialog, draw){
		var radio = $("<div id='measureradio'></div>");
		dialog.append(radio);
		var labels = [{label:'Coordinates', value:'point'}, 
			{label:'Distance', value:'polyline'},{label:'Area', value:'polygon'}];
		$(labels).each(function(i, item){
			var input = $("<input type='radio' id='"+item.label.toLowerCase()+"Radio' name='radio' value='"+item.value+"'/>");
			var label = $("<label for='"+item.label.toLowerCase()+"Radio'>"+item.label+"</label>");
			radio.append(input);
			radio.append(label);
		});

		radio.buttonset();
		$('input', radio).bind('change', function(){
			if (drawhandlers){
				$.fn.measureDialog.cleardrawtool(drawhandlers);					
			}

			draw.deactivate();
			draw.activate($(this).val());
		});		
	}

	$.fn.measureDialog.cleardrawtool = function(handlers){
		$(handlers).each(function(i, handler){
			dojo.disconnect(handler);
		});
	};
}(jQuery));