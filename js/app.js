(function () {

    var options = {
        center: [38.2, -94],
        zoom: 4,
        minZoom: 3,
        maxZoom: 9,
        dragging: true,
        zoomControl: true
    }
    var map = L.map('map', options);

    var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });
    map.addLayer(tiles);

    var dataLayer;
    var attribute = "1519NM";
    var breaks;
    //var breakArray = [0, 0.2, 0.4, 0.6, 0.8, 1];
    var breakArray = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    $.getJSON("data/uscounties.json", function (counties) {

        Papa.parse('data/Marital-Status-ACS.csv', {

            download: true,
            header: true,
            complete: function (data) {
                processData(counties, data);
            }
        }); // end of Papa.parse()

    });

    function processData(states, data) {
        for (var state in states.features) {
            var props = states.features[state].properties;

            for (var d in data.data) {
                if (props.AFFGEOID == data.data[d].GEOID) {
                    states.features[state].properties = data.data[d];
                    break;
                }
            } // inner for loop is complete

        } // outer for loop is complete
        drawMap(states);

        $(document).ready(function () {

            $("input[type='range']").change(function () {
                slider = $(this);
                value = (slider.val() - 1);

                $('p.rangeLabel').removeClass('selected');
                $('p.rangeLabel:eq(' + value + ')').addClass('selected');

            });

            $('p.rangeLabel').bind('click', function () {
                label = $(this);
                value = label.index();
                $("input[type='range']").attr('value', value)
                    .trigger('change');
            });

        });
    }

    //        function processData(data) {
    //            for (var i in data.features) {
    //                console.log(data.features[i].properties);
    //            }
    //            drawMap(data);
    //        }

    function drawMap(data) {

        dataLayer = L.geoJson(data, {
            style: function (feature) { // style each feature of GeoJson layer
                return {
                    color: '#363636', // set stroke color
                    weight: .5, // set stroke weight
                    fillOpacity: 1, // override defautl fill opacity
                    fillColor: '#1f78b4' // set fill color
                };
            }
        }).addTo(map);
        breaks = getClassBreaks();

        updateMap(breaks);
        drawInfo();

        drawLegend(breaks);
        buildUI();

        dataLayer.eachLayer(function (layer) {


            // create shorthand variable to access layer properties
            //var props = layer.feature.properties;

            // change the fill color of the layer using the layer's attribute values
            layer.setStyle({
                stroke: 'yellow'
            });

            layer.on('mouseover', function (e) {
                e.target.setStyle({
                    //changes the outline to yellow and weight to 3
                    color: 'yellow',
                    weight: 2,
                });
                e.target.bringToFront();
                updateInfo(this);
            });
            layer.on('mouseout', function (e) {
                e.target.setStyle({
                    //changes the outline to yellow and weight to 1
                    color: getStrokeColor(Number(layer.feature.properties[attribute]), breaks),
                    weight: .5,
                });

                updateInfo(this);
            });
        });
        dataLayer.on('mouseover', function (e) {
            $(".info").show();
        });
        dataLayer.on('mouseout', function () {
            $(".info").hide();
        });
    }


    // function gets the class breaks
    function getClassBreaks() {

        // create empty array to hold range of data values
        //        var values = [];
        //
        //        var headers = ["1519T", "1519NM", "1519W", "1519D", "1519S", "1519NVM", "2034T", "2034NM", "2034W", "2034D", "2034S", "2034NVM", "3544T", "3544NM", "3544W", "3544D", "3544S", "3544NVM", "4554T", "4554NM", "4554W", "4554D", "4554S", "4554NVM", "5564T", "5564NM", "5564W", "5564D", "5564S", "5564NVM", "65OVT", "65OVNM", "65OVW", "65OVD", "65OVS", "65OVNVM"];
        //
        //        var min, max;
        //        min = max =0;
        //
        //        // loop through each layer
        //        dataLayer.eachLayer(function (layer) {
        //            for (i = 0; i < headers.length - 1; i++) {
        //                var value = layer.feature.properties[headers[i]];
        //                if (value != null)
        //                    values.push(Number(value));
        //
        ////                var value = layer.feature.properties[headers[i]];
        ////                if(value != null){
        ////                min = Math.min(min, value);
        ////                max = Math.max(max, value);
        ////                }
        //            
        //                //if (value != null)
        //                //    values.push(Number(value));
        //            }
        //        });

        //breaks = ss.quantile(values, breakArray);
        breaks = breakArray;
        //var breaks = (max - min) / 5;

        return breaks;

    }

    function updateMap(breaks) {
        dataLayer.eachLayer(function (layer) {
            layer.setStyle({
                fillColor: getColor(Number(layer.feature.properties[attribute]), breaks),
                color: getStrokeColor(Number(layer.feature.properties[attribute]), breaks)
            })
        });
    }
    // function to get the color value
    function getColor(d, breaks) {

        if (d <= breaks[1]) {
            return '#ccffff';
        } else if (d <= breaks[2]) {
            return '#99ffff';
        } else if (d <= breaks[3]) {
            return '#66ffff';
        } else if (d <= breaks[4]) {
            return '#33ffff'
        } else if (d <= breaks[5]) {
            return '#00ffff'
        } else if (d <= breaks[6]) {
            return '#00cccc';
        } else if (d <= breaks[7]) {
            return '#009999';
        } else if (d <= breaks[8]) {
            return '#006666'
        } else if (d <= breaks[9]) {
            return '#003333'
        } else if (d <= breaks[10]) {
            return '#001a1a'
        } else
            return "#8a8a8a";
    }

    // function to get the color value
    function getStrokeColor(d, breaks) {

        if (d <= breaks[1]) {
            return '#001a1a';
        } else if (d <= breaks[2]) {
            return '#003333';
        } else if (d <= breaks[3]) {
            return '#006666';
        } else if (d <= breaks[4]) {
            return '#009999'
        } else if (d <= breaks[5]) {
            return '#00cccc'
        } else if (d <= breaks[6]) {
            return '#00ffff';
        } else if (d <= breaks[7]) {
            return '#33ffff';
        } else if (d <= breaks[8]) {
            return '#66ffff'
        } else if (d <= breaks[9]) {
            return '#99ffff'
        } else if (d <= breaks[10]) {
            return '#ccffff'
        }
    }

    function drawInfo() {
        var info = L.control({
            position: 'bottomleft' // draws the info box in the bottom right corner of the map
        });
        var div = info.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info'); //adds the info surrounded by a div called info (used .info in the css to style it)
            return div;
        }
//        var uicontrols = document.getElementById("ui-controls");
//        uicontrols.appendChild(div);
        info.addTo(map); //adds infobox to map
        $(".info").hide();
    }

    function updateInfo(layer) {
        var props = layer.feature.properties; // creates variable from json file (drilling down by dot notation)
        var attributeYear = attribute.substr(0, 4);
        var displayYears = attributeYear.substr(0, 2);
        if (attributeYear == "65OV")
            displayYears += "+ ";
        else
            displayYears += " - " + attributeYear.substr(2, 2);
        var nowmarried = props[attributeYear + "NM"];
        var nevermarried = props[attributeYear + "NVM"];
        var divorced = props[attributeYear + "D"];
        var widowed = props[attributeYear + "W"];
        if (nowmarried == "#VALUE!")
            nowmarried = "No Data";
        else
            nowmarried += "%";
        if (nevermarried == "#VALUE!")
            nevermarried = "No Data";
        else
            nevermarried += "%";
        if (divorced == "#VALUE!")
            divorced = "No Data";
        else
            divorced += "%";
        if (widowed == "#VALUE!")
            widowed = "No Data";
        else
            widowed += "%";

        var html = "<h3>Percentage of " + displayYears + " year-olds per Marital Status in " + props['Geography'] + "</h3>Now Married: " + nowmarried + "<br>" + "Never Married: " + nevermarried + "<br>" + "Divorced: " + divorced + "<br>" + "Widowed: " + widowed;


        $(".info").html(html); //changes the html in the info box
    };

    function buildUI() {

        // listen for user clicks on radio buttons and call clickRadioButton() function
        $('#ui-controls input[type="radio"]').on('click', clickRadioButton);

        // create a Leaflet control object and store a reference to it in a variable
        var sliderControl = L.control({
            position: 'topleft'
        });

        // when we add this control object to the map
        sliderControl.onAdd = function (map) {

            // select an existing DOM element with an id of "ui-controls"
            var slider = L.DomUtil.get("ui-controls");

            // when the user clicks on the slider element
            L.DomEvent.addListener(slider, 'mousedown', function (e) {

                // prevent the click event from bubbling up to the map
                L.DomEvent.stopPropagation(e);

            });

            // return the slider from the onAdd method
            return slider;
        }

        // add the control object containing our slider element to the map
        sliderControl.addTo(map);
        $(".year-slider").on("input change", function () {
            if ($(this).val() == 1)
                attribute = "1519";
            else if ($(this).val() == 2)
                attribute = "2034";
            else if ($(this).val() == 3)
                attribute = "3544";
            else if ($(this).val() == 4)
                attribute = "4554";
            else if ($(this).val() == 5)
                attribute = "5564";
            else if ($(this).val() == 6)
                attribute = "65OV";
            attribute += getRadioVal(document.getElementById('formname'), "radiogroup");
            updateMap(breaks);

        });
    }

    function getRadioVal(form, name) {
        var val;
        // get list of radio buttons with specified name
        var radios = form.elements[name];

        // loop through list of radio buttons
        for (var i = 0, len = radios.length; i < len; i++) {
            if (radios[i].checked) { // radio checked?
                val = radios[i].value; // if so, hold its value in val
                break; // and break out of for loop
            }
        }
        return val; // return value of checked radio or undefined if none checked
    }

    function clickRadioButton() {
        attribute = attribute.substr(0, 4) + getRadioVal(document.getElementById('formname'), "radiogroup");
        updateMap(breaks);
        updateLegend(breaks);
    }

    function drawLegend(breaks) {


        // create a new Leaflet control object, and position it top left
        var legendControl = L.control({
            position: 'topright'
        });

        // when the legend is added to the map
        legendControl.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'legend');
            return div;
        };

        // add the legend to the map
        legendControl.addTo(map);
        updateLegend(breaks);

    }

    function updateLegend(breaks) {
        var selectedID = getRadioVal(document.getElementById('formname'), "radiogroup").toLowerCase();
        var selector = 'label[for=' + selectedID + ']';
        var label = document.querySelector(selector);
        var selectedRadioButton = label.innerHTML;

        var legend = $('.legend').html("<h3>Percent " + selectedRadioButton + "</h3><ul>");

        for (var i = 0; i < breaks.length - 1; i++) {
            var color = getColor(breaks[i + 1], breaks);
            $('.legend ul').append('<li><span style="background:' + color + '"></span>' + breaks[i] + ' &mdash; ' + breaks[i + 1] + '%</li>');
        }
    };
})();
