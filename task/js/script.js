$(document).ready(function() {
    
    $('#submitWeather').on('click', function() {
        const north = $('#north').val();
        const south = $('#south').val();
        const east = $('#east').val();
        const west = $('#west').val();
    
        $.ajax({
            url: "php/getWeatherInfo.php",
            type: "POST",
            dataType: "json",
            data: {
                north: north,
                south: south,
                east: east,
                west: west
            },
            success: function(result) {
                console.log(JSON.stringify(result));
                if (result.status.name === "ok") {
                    const data = result.data;
                    $('#weatherResult').empty().append(
                        $('<div>').text('Temperature: ' + data[0].temperature + ' °C'),
                        $('<div>').text('Humidity: ' + data[0].humidity),
                        $('<div>').text('Wind Speed: ' + data[0].windSpeed)
                    );
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Error", errorThrown);
            }
        });
    });
    
    

    // Country Info
    $('#submitCountryInfo').on('click', function () {
        const country = $('#country').val();
        const language = $('#language').val();
    
        $.ajax({
            url: "php/getCountryInfo.php",
            type: "POST",
            dataType: "json",
            data: {
                country: country,
                language: language
            },
            success: function(result) {
                
                if (result.status.name == "ok") {

                    const data = result.data;
                    
                    $('#countryInfoResult').empty().append(
                        $('<div>').text('Country Name: ' + data[0].countryName),
                        $('<div>').text('Capital: ' + data[0].capital),
                        $('<div>').text('Population: ' + data[0].population)
                    );
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Error", errorThrown);
                
            }
        });

    // Earthquakes
    $('#submitEarthquakes').on('click', function() {
        const northN = $('#northN').val();
        const southS = $('#southS').val();
        const eastE = $('#eastE').val();
        const westW = $('#westW').val();
        const date = $('#date').val();
        const minMagnitude = $('#minMagnitude').val();

        $.ajax({
            url: "php/getEarthquakes.php",
            type: "POST",
            dataType: "json",
            data: {
                northN: northN,
                southS: southS,
                eastE: eastE,
                westW: westW,
                date: date,
                minMagnitude: minMagnitude
            },
            success: function(result) {
                console.log(JSON.stringify(result));
                if (result.status.name === "ok") {
                    const data = result.data;
                    $('#earthquakesResult').empty().append(
                        $('<div>').text('DateTime: ' + data[0].datetime),
                        $('<div>').text('Magnitude: ' + data[0].magnitude),
                        $('<div>').text('Depth: ' + data.depth[0] + ' km')
                    );
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error", errorThrown);
            }
        });
    });
})});

