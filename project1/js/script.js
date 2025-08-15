// ---------------------------------------------------------
let preloaderRemoved = false;

function removePreloader() {
  if (!preloaderRemoved) {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0';
    preloader.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      preloader.style.display = 'none';
      preloaderRemoved = true;
    }, 500);
  }
}
// GLOBAL DECLARATIONS
let map;
let countryBorder;
let layerControl;
let countryData, weatherData, environmentalData, newsData, currencyData;

var markers = L.markerClusterGroup();
var featureGroup = L.featureGroup();

// Add this function before displayWeather
function mapWeatherDescription(description) {
  const mapping = {
    'clear sky': 'Sunny',
    'few clouds': 'Mostly sunny',
    'scattered clouds': 'Partly cloudy',
    'broken clouds': 'Mostly cloudy',
    'overcast clouds': 'Cloudy',
    'light rain': 'Light rain',
    'moderate rain': 'Rain',
    'heavy intensity rain': 'Heavy rain',
    'thunderstorm': 'Thunderstorm',
    'mist': 'Misty',
    'fog': 'Foggy',
    'light snow': 'Light snow',
    'snow': 'Snow',
    'heavy snow': 'Heavy snow',
    'drizzle': 'Light rain',
    'shower rain': 'Rain showers',
    'rain': 'Rain',
    'thunderstorm with light rain': 'Thunderstorms',
    'thunderstorm with rain': 'Thunderstorms',
    'thunderstorm with heavy rain': 'Severe thunderstorms',
    'light intensity shower rain': 'Light rain showers',
    'heavy intensity shower rain': 'Heavy rain showers',
    'very heavy rain': 'Heavy rain',
    'extreme rain': 'Severe rain',
    'freezing rain': 'Freezing rain',
    'light intensity drizzle': 'Light drizzle',
    'heavy intensity drizzle': 'Drizzle',
    'light thunderstorm': 'Isolated thunderstorms',
    'heavy thunderstorm': 'Severe thunderstorms',
    'ragged thunderstorm': 'Scattered thunderstorms'
  };

  return mapping[description.toLowerCase()] || description;
}

// ---------------------------------------------------------
//Spinner start and stop function for all ajax calls
// function hidePreloader() {
//   $('#preloader').fadeOut(500, function() {
//     $(this).remove();
//   });
//   $('#main-content').fadeIn(500);
// }

$(document).ajaxStart(function() {
  $('#loading-spinner').show();
});

$(document).ajaxStop(function() {
  $('#loading-spinner').hide();
});


// tile layers

// var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
// 	maxZoom: 19,
// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// });

var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
});

var basemaps = {
  "Streets": streets,
  "Satellite": satellite
};

//Overlays & Polygons
let markerClusters = {
  cities: L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  }),
  airports: L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  }),
  mountains: L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  }),
  historicalSites: L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#fff",
      color: "#000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.5
    }
  })
};


// ---------------------------------------------------------
// EVENT HANDLERS


function initMap() {
  map = L.map("map", {
    layers: [streets]
  }).setView([54.5, -4], 6);
  
//Overlays


  var overlayMaps = {
    "Cities": markerClusters.cities,
    "Airports": markerClusters.airports,
    "Mountains": markerClusters.mountains,
    "Historical Sites": markerClusters.historicalSites

};

 // Add all layers by default
  
layerControl = L.control.layers(basemaps, overlayMaps).addTo(map);
map.addLayer(markerClusters.cities);
 
map.addLayer(markerClusters.cities);



  // Get user's location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      map.setView([lat, lon], 5);
      getCountryInfo(lat, lon);
    }, function(error) {
      console.error("Error getting location:", error);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

//Overlay Markers
const airportIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-plane",
  iconColor: "black",
  markerColor: "white",
  shape: "square"
});

const cityIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-city",
  markerColor: "green",
  shape: "square"
});

const mountainIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-mountain",
  iconColor: "white",
  markerColor: "blue",
  shape: "square"
});

const historicalSiteIcon = L.ExtraMarkers.icon({
  prefix: "fa",
  icon: "fa-landmark",
  iconColor: "white",
  markerColor: "red",
  shape: "square"
});




function loadCountries() {
  $.ajax({
      url: 'php/getCountries.php',
      type: 'GET',
      dataType: 'json',
      success: function(data) {
          let select = $('#countrySelect');
           // Convert the object to an array of [code, name] pairs
           let countries = Object.entries(data);
            
           // Sort the array based on country names
           countries.sort((a, b) => a[1].localeCompare(b[1]));
           
           // Populate the dropdown with sorted countries
           countries.forEach(function([code, name]) {
               select.append($('<option>').val(code).text(name));
           });
       },
       error: function(jqXHR, textStatus, errorThrown) {
           console.error("AJAX error in loadCountries:", textStatus, errorThrown);
      }
  });
}



function loadCountryData(countryCode) {
  $.ajax({
    url: 'php/getCountryInfo.php',
    type: 'GET',
    data: { country: countryCode },
    dataType: 'json',
    success: function(data) {
      if (data && typeof data === 'object') {
        countryData = data;
        countryData.currencyCode = data.currency ? data.currency.code : 'USD';
        loadCountryBorder(countryCode);
        Object.values(markerClusters).forEach(cluster => cluster.clearLayers());
        loadCities(countryCode);
        loadAirports(countryCode);
        loadMountains(countryCode);
        loadHistoricalSites(countryCode);
        if (data.capital && data.capital.lat && data.capital.lng) {
          loadWeather(data.capital.lat, data.capital.lng);
        }
        loadEnvironmentalStats(countryCode);
        loadNews(countryCode);
        loadCurrencyData(countryCode);
        removePreloader();
      } else {
        console.error('Invalid data received from getCountryInfo.php');
        removePreloader();
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error in loadCountryData:", textStatus, errorThrown);
      removePreloader();
    }
  });
}


function setupEventListeners() {
  $('#countrySelect').change(function() {
      let countryCode = $(this).val();
      loadCountryData(countryCode);
  });
}


function loadCountryBorder(countryCode) {
  $.ajax({
      url: 'php/getCountryBorder.php',
      type: 'GET',
      data: { country: countryCode },
      dataType: 'json',
      success: function(data) {
          if (countryBorder) {
              map.removeLayer(countryBorder);
          }
          countryBorder = L.geoJSON(data, {
            style: {
              color: "#000000",
              weight: 2,
              opacity: 0.65,
              fillColor: "#000000",
              fillOpacity: 0.2
            }
          }).addTo(map);
          map.fitBounds(countryBorder.getBounds());
      }
  });
}

function loadCities(countryCode) {
  $.ajax({
    url: 'php/getCities.php',
    type: 'GET',
    data: { country: countryCode },
    dataType: 'json',
    success: function(data) {
      markerClusters.cities.clearLayers();
      data.forEach(function(city) {
         // Add population data handling
         let marker = L.marker([city.lat, city.lng], {icon: cityIcon})
         .bindTooltip(`${city.name}${city.population ? '<br>Population: ' + 
           numeral(city.population).format('0,0') : ''}`,
           { direction: 'top', sticky: true });
       markerClusters.cities.addLayer(marker);
      });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error: " + textStatus + ' : ' + errorThrown);
    }
  });
}




//Implement error handling:
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global error handler:", message, "at", source, ":", lineno);
  // You can send this error to your server or handle it as needed
  return true; // Prevents the firing of the default event handler
};

function loadAirports(countryCode) {
  $.ajax({
    url: 'php/getAirports.php',
    type: 'GET',
    data: { country: countryCode },
    dataType: 'json',
    success: function(data) {
      markerClusters.airports.clearLayers();
      if (Array.isArray(data)) {
        data.forEach(function(airport) {
          let marker = L.marker([airport.lat, airport.lng], {icon: airportIcon})
            .bindTooltip(`${airport.name}`,
              { direction: 'top', sticky: true });
          markerClusters.airports.addLayer(marker);
        });
      } else {
        console.error("Invalid airport data received");
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error in loadAirports:", textStatus, errorThrown);
    }
  });
}



function loadMountains(countryCode) {
  $.ajax({
    url: 'php/getMountains.php',
    type: 'GET',
    data: { country: countryCode },
    dataType: 'json',
    success: function(result) {
      markerClusters.mountains.clearLayers();
      if (result && result.data && Array.isArray(result.data)) {
        result.data.forEach(function(mountain) {
          if (mountain.lat && mountain.lng) {
            let marker = L.marker([mountain.lat, mountain.lng], {icon: mountainIcon});
            
            // Create popup content
            let popupContent = `<b>${mountain.name}</b><br>${mountain.elevation}`;
            
            // Bind popup to marker
            marker.bindPopup(popupContent);
            
            // Add hover functionality
            marker.on('mouseover', function (e) {
              this.openPopup();
            });
            marker.on('mouseout', function (e) {
              this.closePopup();
            });
            
            markerClusters.mountains.addLayer(marker);
          }
        });
      } else {
        console.log("No mountain data available for this country");
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error loading mountains:", textStatus, errorThrown);
    }
  });
}



function loadHistoricalSites(countryCode) {
  $.ajax({
    url: 'php/getHistoricalSites.php',
    type: 'GET',
    data: { country: countryCode },
    dataType: 'json',
    success: function(result) {
      markerClusters.historicalSites.clearLayers();
      if (result.status && result.status.name === "ok" && Array.isArray(result.data)) {
        result.data.forEach(function(site) {
          if (site.countryCode === countryCode) {
            let marker = L.marker([site.lat, site.lng], {icon: historicalSiteIcon})
              .bindTooltip(`${site.name}`,
                { direction: 'top', sticky: true });
            markerClusters.historicalSites.addLayer(marker);
          }
        });
      } else {
        console.error("Invalid historical site data received:", result);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error in loadHistoricalSites:", textStatus, errorThrown);
    }
  });
}




function loadWeather(lat, lng) {
  $.ajax({
      url: 'php/getWeather.php',
      type: 'GET',
      data: { lat: lat, lng: lng },
      dataType: 'json',
      success: function(data) {
          weatherData = data;
          
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("AJAX error in loadWeather:", textStatus, errorThrown);
      }
  });
}




function loadEnvironmentalStats(countryCode) {
  $.ajax({
      url: 'php/getEnvironmentalStats.php',
      type: 'GET',
      data: { country: countryCode },
      dataType: 'json',
      success: function(data) {
          environmentalData = data;
          
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("AJAX error in loadEnvironmentalStats:", textStatus, errorThrown);
      }
  });
}


function loadNews(countryCode) {
  $.ajax({
    url: 'php/getNews.php',
    type: 'GET',
    data: { country: countryCode },
    dataType: 'json',
    success: function(data) {
      if (data.error) {
        console.error("Error loading news:", data.error);
        newsData = [];
      } else {
        newsData = data;
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("AJAX error in loadNews:", textStatus, errorThrown);
      newsData = [];
    }
  });
}


function loadCurrencyData(countryCode) {
  $.ajax({
    url: 'php/getCurrencyData.php',
    type: 'GET',
    dataType: 'json',
    success: function(response) {
      if (response && response.data) {
        currencyData = response.data;
        // Show currency modal button once data is loaded
        $('.currency-btn').prop('disabled', false);
        // If the currency modal is already open, update it
        if ($('#currencyModal').hasClass('show')) {
          displayCurrency(currencyData, countryData);
        }
      } else {
        console.error('Invalid currency data structure:', response);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Currency API error:', textStatus, errorThrown);
    }
  });
}






//Loading Information Based on User's Location:


function getCountryInfo(lat, lon) {
  $.ajax({
      url: 'php/getCountryFromCoordinates.php',
      type: 'GET',
      data: { lat: lat, lon: lon },
      dataType: 'json',
      success: function(data) {
          if (data.countryCode && data.countryName) {
              $('#countryName').text(data.countryName);
              $('#countrySelect').val(data.countryCode).trigger('change');
              loadCountryData(data.countryCode);
          } else {
              console.error("Country not found");
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("AJAX error: " + textStatus + ' : ' + errorThrown);
      }
  });
}

//to allow users to select the country by click
function onCountryClick(e) {
  let layer = e.target;
  if (layer.feature && layer.feature.properties && layer.feature.properties.ISO_A2) {
      let clickedCountry = layer.feature.properties.ISO_A2;
      $('#countrySelect').val(clickedCountry).trigger('change');
  }
}


// ---------------------------------------------------------

// functions for populating and showing these modals:

function displayCountryInfo(data) {
  if (!data) {
      $('#pre-load').html('<div class="alert alert-warning">Country data not available</div>');
      return;
  }

  // Clear any previous loading message
  $('#pre-load').html('');

  // Populate the fields
  $('#capitalCity').text(data.capital?.name || 'N/A');
  $('#continent').text(data.continent || 'N/A');
  $('#languages').text(data.languages || 'N/A');
  $('#currency').text(data.currency ? `${data.currency.name} (${data.currency.code})` : 'N/A');
  $('#isoAlpha2').text(data.isoAlpha2 || 'N/A');
  $('#population').text(data.population ? data.population.toLocaleString() : 'N/A');
  
  // Add Wikipedia link row
  const wikipediaLink = `https://en.wikipedia.org/wiki/${encodeURIComponent(data.name)}`;
  $('.wiki-row').remove(); // Remove any existing wiki row
  $('#isoAlpha2').closest('tr').after(`
      <tr class="wiki-row">
          <td class="text-center">
              <i class="fa-brands fa-wikipedia-w fa-xl text-success"></i>
          </td>
          <td>
              Wikipedia
          </td>
          <td class="text-end">
              <a href="${wikipediaLink}" target="_blank" class="text-decoration-none">Learn More</a>
          </td>
      </tr>
  `);

  // Show the modal
  $('#countryInfoModal').modal('show');
}



function displayWeather(data) {
  if (!data || !data.city) {
    $('#weatherContent').html("Weather data not available.");
    return;
  }

  $('#weatherModalLabel').html(`<i class="fa-solid fa-cloud fa-xl me-2"></i>${data.city}`);


  $('#weatherModalLabel').html(data.city);
  $('#todayConditions').html(mapWeatherDescription(data.condition.description));
  $('#todayIcon').attr("src", `http://openweathermap.org/img/w/${data.condition.icon}.png`);

  const currentTemp = data.forecast[0].temp;
  const currentMin = data.forecast[0].temp_min || currentTemp - 2;
  const currentMax = data.forecast[0].temp_max || currentTemp + 2;
  $('#todayHighTemp').html(Math.round(currentMax));
  $('#todayLowTemp').html(Math.round(currentMin));
  $('#lastUpdated').text(new Date().toLocaleString());

  // Create 2x2 grid for remaining forecast days
  let forecastHtml = '<div class="row">';
  
  // Get today's date to calculate future dates
  const today = new Date();

  // Skip first day (today) and show next 4 days in 2x2 grid
  for (let i = 1; i <= 4; i++) {
    if (!data.forecast[i]) break;
    
    const day = data.forecast[i];
    
    // Calculate the date for this forecast day
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    
    // Format the date and weekday
    const dayNum = forecastDate.getDate();
    const weekday = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayDisplay = `${weekday}`;
    
    const maxTemp = day.temp_max || Math.round(day.temp) + 2;
    const minTemp = day.temp_min || Math.round(day.temp) - 2;
    
    // Add column class for 2x2 grid
    forecastHtml += `
      <div class="col-6 mb-3">
        <div class="card h-100">
          <div class="card-body text-center">
            <h5 class="card-title">${dayDisplay}</h5>
            <img src="http://openweathermap.org/img/w/${day.icon}.png" alt="${mapWeatherDescription(day.condition)}" class="mb-2">
            <p class="card-text">${mapWeatherDescription(day.condition)}</p>
            <p class="card-text">
              <span class="fw-bold">${Math.round(maxTemp)}°</span> / 
              <span class="text-secondary">${Math.round(minTemp)}°</span>
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Add row break after every 2 cards
    if (i % 2 === 0 && i < 4) {
      forecastHtml += '</div><div class="row">';
    }
  }
  
  forecastHtml += '</div>';
  $('#forecastContainer').html(forecastHtml);
  $('#weatherModal').modal('show');
}




function displayEnvironmentalStats(data) {
  if (!data) {
    $('#environmentalStatsContent').html('<div class="alert alert-warning">Environmental data not available</div>');
    return;
  }

  // Handle null values with N/A display
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return Number(parseFloat(value)).toFixed(1);
  };

  // Update the table cells with formatted data
  $('#forestArea').text(data.forestArea ? `${formatValue(data.forestArea)}% of land area` : 'N/A');
  $('#co2Emissions').text(data.co2Emissions ? `${formatValue(data.co2Emissions)} metric tons per capita` : 'N/A');
  $('#renewableEnergy').text(data.renewableEnergy ? `${formatValue(data.renewableEnergy)}% of total energy` : 'N/A');

  $('#environmentalStatsModal').modal('show');
}



function displayNews(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    $('#newsContent').html("<p class='text-center'>No news articles found for this country.</p>");
    return;
  }

  $('#newsModalLabel').html(`<i class="fa-solid fa-newspaper fa-xl me-2"></i>Latest News`);


  const articlesPerPage = 2;
  let currentPage = 1;
  const totalPages = 2;

  function renderNewsPage(page) {
    const start = (page - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    const pageArticles = data.slice(start, end);

    let content = `
      <div class="row">
        ${pageArticles.map(article => `
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <img src="${article.image || 'placeholder-image-url.jpg'}" class="card-img-top" alt="${article.title}">
              <div class="card-body">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.description}</p>
              </div>
              <div class="card-footer">
                <a href="${article.url}" class="btn btn-primary" target="_blank">Read More</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <nav aria-label="News navigation">
        <ul class="pagination justify-content-center">
          <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${page - 1}">Previous</a>
          </li>
          ${Array.from({length: totalPages}, (_, i) => i + 1).map(p => `
            <li class="page-item ${p === page ? 'active' : ''}">
              <a class="page-link" href="#" data-page="${p}">${p}</a>
            </li>
          `).join('')}
          <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${page + 1}">Next</a>
          </li>
        </ul>
      </nav>
    `;

    $('#newsContent').html(content);

    $('.pagination .page-link').on('click', function(e) {
      e.preventDefault();
      const newPage = $(this).data('page');
      if (newPage >= 1 && newPage <= totalPages) {
        renderNewsPage(newPage);
      }
    });
  }

  renderNewsPage(currentPage);
  $('#newsModal').modal('show');
}



function displayCurrency(data, countryData) {
  if (!data || !data.rates) {
    $('#currencyContent').html('Currency data not available');
    return;
  }

  const rates = data.rates;
  const baseUSD = 1;
  const countryCurrency = countryData?.currency?.code || 'USD';

  // Set the last updated time
  $('.last-updated').text(`Last updated: ${new Date(data.timestamp * 1000).toLocaleString()}`);

  // Populate currency selects
  const currencyOptions = Object.keys(rates).sort().map(curr => 
    `<option value="${curr}" ${curr === countryCurrency ? 'selected' : ''}>${curr}</option>`
  ).join('');
  
  $('#fromCurrency').html(currencyOptions);
  $('#toCurrency').html(
    Object.keys(rates).sort().map(curr =>
      `<option value="${curr}" ${curr === 'USD' && curr !== countryCurrency ? 'selected' : ''}>${curr}</option>`
    ).join('')
  );

  function performConversion() {
    const amount = parseFloat($('#amountToConvert').val()) || 0;
    const fromCurrency = $('#fromCurrency').val();
    const toCurrency = $('#toCurrency').val();
    
    let result;
    if (fromCurrency === 'USD') {
      result = amount * rates[toCurrency];
    } else if (toCurrency === 'USD') {
      result = amount / rates[fromCurrency];
    } else {
      const amountInUSD = amount / rates[fromCurrency];
      result = amountInUSD * rates[toCurrency];
    }

    const rate = (rates[toCurrency] / rates[fromCurrency]);
    
    $('.conversion-amount').text(
      `${amount.toFixed(2)} ${fromCurrency} = ${result.toFixed(2)} ${toCurrency}`
    );
    $('.conversion-rate').text(
      `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`
    );
  }

  $('#amountToConvert, #fromCurrency, #toCurrency').on('input change', performConversion);
  performConversion();
}

// Update the currency button in modalButtons array
const currencyButtonConfig = {
  title: 'Currency Converter',
  icon: 'fa-solid fa-money-bill-wave',
  onClick: function() {
    if (currencyData) {
      displayCurrency(currencyData, countryData);
      $('#currencyModal').modal('show');
    } else {
      loadCurrencyData();
      $('#currencyModal').modal('show');
    }
  }
};



// array of button configurations
var infoBtn = L.easyButton("fa-solid fa-circle-info fa-xl", function (btn, map) {
  $("#newsModal").modal("show");
});

// Update the modalButtons array
var modalButtons = [
  {
    title: 'Country Information',
    icon: 'fa-solid fa-earth-americas fa-xl',
    onClick: function() { displayCountryInfo(countryData); }
  },
  {
    title: 'Weather',
    icon: 'fa-solid fa-cloud-sun fa-xl',
    onClick: function() { displayWeather(weatherData); }
  },
  {
    title: 'News',
    icon: 'fa-solid fa-newspaper fa-xl',
    onClick: function() {
      if (newsData && newsData.length > 0) {
        displayNews(newsData);
        $('#newsModal').modal('show');
      } else {
        $('#newsContent').html("No news articles available for this country.");
        $('#newsModal').modal('show');
      }
    }
  },
  {
    title: 'Currency',
    icon: 'fa-solid fa-coins fa-xl',
    onClick: function() {
      displayCurrency(currencyData, countryData);
      $('#currencyModal').modal('show');
    }
  },
  {
    title: 'Environmental Statistics',
    icon: 'fa-solid fa-tree fa-xl',
    onClick: function() { displayEnvironmentalStats(environmentalData); }
  }
];


// Update the button creation in the addModalButtons function
function addModalButtons() {
  var buttonControls = [];
  modalButtons.forEach(function(button) {
    var newButton = L.easyButton({
      position: 'topleft',
      leafletClasses: false,
      states: [{
        stateName: 'default',
        onClick: button.onClick,
        title: button.title,
        icon: `<i class="${button.icon}"></i>`
      }]
    });
    buttonControls.push(newButton);
  });
  var buttonBar = L.easyBar(buttonControls);
  buttonBar.addTo(map);
}



// initialise and add controls once DOM is ready

$(document).ready(function() {
  initMap();
  loadCountries();
  setupEventListeners();
  addModalButtons();

  
}); 


