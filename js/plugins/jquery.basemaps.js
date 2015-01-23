;(function ( $, window, document, undefined ) {
    var pluginName = "basemaps",
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
            var html = "<div id='streetmapdiv' name='basemaps' class='basediv'><img src='img/selected/basemap.png'/><label for='streetmapdiv'>Street Map</div>";
            if(config.map.baselayers.length > 1){
                html+="<select id='streetSelect' name='basemaps' class='baseselect'>";
                $(config.map.baselayers).each(function(i, layer){
                    html += "<option value='"+layer.id+"'>"+layer.label+"</option>";
                });
                html+="</select>";
            }
            html += "<div id='aerialsdiv' name='aerials' class='basediv'><img src='img/aerials.png'/>Aerials</div>";
            if(config.map.imagelayers.length > 1){
                html+="<select id='imageSelect' class='baseselect' name='aerials'>";
                $(config.map.imagelayers).each(function(i, layer){
                    var classname = (layer.countywide)?"countyImage":"raleighImage";
                    html += "<option value='"+layer.id+"' class='"+classname+"'>"+layer.label+"</option>";
                });
                //html+="</select><div><input id='labelCheck' type='checkbox'/><label for='labelCheck' class='checklabel' style='font-size:10px'>Labels Off</label></div>";
                html+="</select><div><button type='button' id='labelCheck' class='btn btn-danger btn-xs'>Labels Off</button></div>";
            }
                function CheckAerialInRaleigh(inRaleigh){
                    var aerialselect = $('.baseselect[name="aerials"]');
                    if (aerialselect.parent().is(":visible")){
                        var text = parseInt($('option:selected', aerialselect).text());
                        var id = "image"+text.toString();
                        if(!inRaleigh){
                            $(".raleighImage").css("display","none");
                            if (text > 2010){
                                id = "image2010";
                                $(aerialselect).val("2010").data("kendoDropDownList").text("2010");
                            }else if (text > 2005 && text < 2010){
                                id = "image2005";
                                $(aerialselect).val("2005").data("kendoDropDownList").text("2005");
                            }else if (text > 1999 && text < 2005){
                                id = "image1999";
                                $(aerialselect).val("1999").data("kendoDropDownList").text("1999");
                            }
                            ChangeBaseMap(id);
                            ChangeSelectedAerial(aerialselect, id);
                            if(lastInRaleigh){
                                lastyear = text;
                            }
                        }else{
                            $(".raleighImage").css("display","block");
                            if (!lastInRaleigh){
                                $(aerialselect).val(lastyear.toString()).data("kendoDropDownList").text(lastyear.toString());
                                id = "image"+lastyear;
                                ChangeBaseMap(id);
                                ChangeSelectedAerial(aerialselect,id);
                            }
                        }

                    }
                    lastInRaleigh = inRaleigh;
                }
            function ChangeSelectedAerial(select,id){
                $("option", select).filter(function(){
                    return $(this).val() == id.toString();
                }).prop('selected', true);
            }
            function ChangeBaseMap(id){
                $(basemaps).each(function(i, basemap){
                    if (basemap.id == id){
                        basemap.setVisibility(true);
                    }else{
                        basemap.setVisibility(false);
                    }
                });
            }
            function ToggleLabels (button) {
                if ($(button).hasClass('btn-success')) {
                    $(button).removeClass('btn-success').addClass('btn-danger');
                } else {
                    $(button).removeClass('btn-danger').addClass('btn-success');
                }
                var layer = map.getLayer("labels");
                //layer.setVisibility($(this).is(":checked"));
                layer.setVisibility($(button).hasClass('btn-success'));
                //var label = ($(this).is(":checked"))?"Labels On":"Labels Off";
                var label = ($(button).hasClass('btn-success')) ? "Labels On" : "Labels Off";
                //$(this).button('option','label',label);
                $(button).text(label);
            }
            $(this.element).append(html);
            $(".basediv").click(function(){
                inRaleigh = raleigh.contains(map.extent.getCenter());
                var name = $(this).attr("name");
                var src = $('.basediv[name!="'+name+'"] img').attr("src");
                $('.basediv[name!="'+name+'"] img').attr("src", src.replace("img/selected/", "img/"));
                src = $('.basediv[name="'+name+'"] img').attr("src");
                if (src.indexOf('selected') == -1){
                    $('.basediv[name="'+name+'"] img').attr("src", src.replace("img/", "img/selected/"));
                    $('#basemaps .k-dropdown').toggle();
                    ChangeBaseMap($('.baseselect[name="'+name+'"] option:selected').val());
                    CheckAerialInRaleigh(inRaleigh);
                }
            });
            $(".baseselect").change(function(){
                ChangeBaseMap($("option:selected", this).val());
                CheckAerialInRaleigh(inRaleigh);
            });
            //$("#labelCheck").button().click(ToggleLabels);
            $("#labelCheck").on('click', function () {
                ToggleLabels(this);
            });
            $("label", $("#labelCheck").parent()).css("margin-top","5px");
            $(".baseselect").kendoDropDownList();
            $(".k-header", ".expandable").css("background-color", "#444");
            $("#imageSelect").closest(".k-widget").hide();
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