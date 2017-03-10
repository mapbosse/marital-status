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
    var attribute = "2034NM";
    var breakArray = [0, 20, 40, 60, 80, 100];

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

    }

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
        }).addTo(map);;

        updateMap(breakArray);
        drawInfo();

        drawLegend(breakArray);
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
                    color: "#363636",
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

    function updateMap(breakArray) {
        dataLayer.eachLayer(function (layer) {
            layer.setStyle({
                fillColor: getColor(Number(layer.feature.properties[attribute]), breakArray)
            })
        });
    }
    // function to get the color value
    function getColor(d, breakArray) {

        if (d <= breakArray[1]) {
            return '#ffffb2';
        } else if (d <= breakArray[2]) {
            return '#fecc5c';
        } else if (d <= breakArray[3]) {
            return '#fd8d3c';
        } else if (d <= breakArray[4]) {
            return '#f03b20'
        } else if (d <= breakArray[5]) {
            return '#bd0026'
        }
    }


    function drawInfo() {
        var info = L.control({
            position: 'bottomright' // draws the info box in the bottom right corner of the map
        });
        var div = info.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info'); //adds the info surrounded by a div called info (used .info in the css to style it)
            return div;
        }

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
            var uicontrols = L.DomUtil.get("ui-controls");

            // when the user clicks on the slider element
            L.DomEvent.addListener(L.DomUtil.get("year-slider"), 'mousedown', function (e) {

                // prevent the click event from bubbling up to the map
                L.DomEvent.stopPropagation(e);

            });

            // return the slider from the onAdd method
            return uicontrols;
        }

        // add the control object containing our slider element to the map
        sliderControl.addTo(map);

        $("#year-slider").on("input change", function () {

            var slider = $(this),
                value = (slider.val() - 1);

            $('p.rangeLabel').removeClass('selected');
            $('p.rangeLabel:eq(' + value + ')').addClass('selected');

            if (slider.val() == 1)
                attribute = "1519";
            else if (slider.val() == 2)
                attribute = "2034";
            else if (slider.val() == 3)
                attribute = "3544";
            else if (slider.val() == 4)
                attribute = "4554";
            else if (slider.val() == 5)
                attribute = "5564";
            else if (slider.val() == 6)
                attribute = "65OV";

            attribute += getRadioVal(document.getElementById('formname'), "radiogroup");



            updateMap(breakArray);

        });

        // when user clicks on class break, update slider
        $('p.rangeLabel').on('click', function () {

            // get current class clicked on by user
            var value = $(this).index() - 1;

            // update the slider value
            $('#year-slider').val(value + 1);

            // remove/add current selected classes
            $('p.rangeLabel').removeClass('selected');
            $('p.rangeLabel:eq(' + value + ')').addClass('selected');

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
        updateMap(breakArray);
        updateLegend(breakArray);
    }

    function drawLegend(breakArray) {


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
        updateLegend(breakArray);

    }

    function updateLegend(breakArray) {
        var selectedID = getRadioVal(document.getElementById('formname'), "radiogroup").toLowerCase();
        var selector = 'label[for=' + selectedID + ']';
        var label = document.querySelector(selector);
        var selectedRadioButton = label.innerHTML;

        var legend = $('.legend').html("<h3>Percent " + selectedRadioButton + "</h3><ul>");

        for (var i = 0; i < breakArray.length - 1; i++) {
            var color = getColor(breakArray[i + 1], breakArray);
            $('.legend ul').append('<li><span style="background:' + color + '"></span>' + breakArray[i] + ' &mdash; ' + breakArray[i + 1] + '%</li>');
        }
    };
})();
