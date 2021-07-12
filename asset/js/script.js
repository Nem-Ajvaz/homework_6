const $inputEle = $("#inputSearch");
const $btnEle = $("#searchBtn");
const $todayEle = $("#presentForecast");
const $futureForecast = $("#futureForecast");
const $pastSearches = $("#pastSearches");

$(window).ready(function () {
  const cities = getHistorysFromLocalStorage();
  renderHistory(cities);
});

// Onclick
$("#inputSearch").on("keypress", keyPress);

function keyPress(e) {
  if (e.which == 13) {
    // enter
    searchCity();
  }
}

function formatDate(date) {
  return moment(date).format("dd/MMM/yyyy");
}

const LOCAL_STORAGE_HISTORY_KEY = "city_history";

function getHistorysFromLocalStorage() {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY)) || [];
}

function setDatesToLocalStorage(cities) {
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(cities));
}

function renderHistory(cities) {
  $pastSearches.empty();
  for (let i = 0; i < cities.length; i++) {
    const $historyItem = $("<p>");
    $historyItem.text(cities[i]);
    $historyItem.addClass("historyItem");
    $historyItem.click(function () {
      $inputEle.val(cities[i]);
      searchCity();
    });
    $pastSearches.append($historyItem);
  }
}

function createIconUrl(iconCode) {
  return "https://openweathermap.org/img/wn/" + iconCode + ".png";
}

function searchCity() {
  let cityName = $inputEle.val();

  const cities = getHistorysFromLocalStorage();
  cities.push(cityName);
  console.log(cities);
  setDatesToLocalStorage(cities);

  renderHistory(cities);

  fetchURL =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    cityName +
    "&units=metric&APPID=1d19c017b53989918559e63da6116e5b";

  fetch(fetchURL)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(
          "Failed to retrive weather data for: '" + cityName + "'"
        );
      }
    })
    .then(function (response) {
      const dataAsString = formatDate(Date.now());
      // Creating Elements
      let $cityTitle = $("<h3>");
      let $weatherIconEle = $("<img>");
      console.log(response.weather[0]);
      let weatherIconIdEle = response.weather[0].icon;
      let forecastIconUrl = createIconUrl(weatherIconIdEle);
      $weatherIconEle.attr("src", forecastIconUrl);

      let $tempEle = $("<p>");
      let $windEle = $("<p>");
      let $humidityEle = $("<p>");

      // Assigning a value to the created elements
      $cityTitle.text(response.name + " " + dataAsString);
      $cityTitle.append($weatherIconEle);
      $tempEle.text("Temp: " + response.main.temp + " ˚C");
      $windEle.text(
        "Wind: " + parseFloat(response.wind.speed * 2.237).toFixed(2) + " MPH"
      );
      $humidityEle.text("Humidity: " + response.main.humidity + " %");

      // Adding classes to the elements
      $cityTitle.addClass("searchOuputTitle");
      $tempEle.addClass("tempClass");
      $windEle.addClass("windClass");
      $humidityEle.addClass("humidityClass");

      //console.log(response.weather[0].description);

      // Get the forecast for the next 7 days.
      let lon = response.coord.lon;
      let lat = response.coord.lat;
      let forecastApiUrl =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        lat +
        "&lon=" +
        lon +
        "&exclude=current,minutely,hourly,alert&units=metric&APPID=1d19c017b53989918559e63da6116e5b";
      return fetch(forecastApiUrl)
        .then(function (data) {
          if (data.ok) {
            return data.json();
          } else {
            return Promise.reject(
              "Failed to retrive weather data for: '" + cityName + "'"
            );
          }
        })
        .then(function (data) {
          // Appending created elements to DOM
          $todayEle.empty();
          $futureForecast.empty();
          $todayEle.append($cityTitle);
          $todayEle.append($tempEle);
          $todayEle.append($windEle);
          $todayEle.append($humidityEle);
          // Creating the UV Index Ele and condition statement
          let $uvIndexEle = $("<p>");
          let $uvValueEle = $("<span>");
          $uvValueEle.text(data.daily[0].uvi);

          $todayEle.append($uvIndexEle);
          $uvIndexEle.text("UV Index: ");
          $uvIndexEle.addClass("uvClass ");
          $uvIndexEle.append($uvValueEle);
          if (data.daily[0].uvi >= 0 && data.daily[0].uvi <= 2) {
            $uvValueEle.addClass("nPR");
          } else if (data.daily[0].uvi >= 3 && data.daily[0].uvi <= 5) {
            $uvValueEle.addClass("pR");
          } else if (data.daily[0].uvi >= 6 && data.daily[0].uvi <= 7) {
            $uvValueEle.addClass("pE");
          } else if (data.daily[0].uvi >= 8 && data.daily[0].uvi <= 10) {
            $uvValueEle.addClass("nS");
          } else {
            $uvValueEle.addClass("stayIndoors");
          }

          $("#forecast_heading").removeClass("hidden");

          for (let i = 0; i < 5; i++) {
            console.log(data.daily[i]);

            //$futureForecast
            // Creating 5 day forecast elements
            let $divEle = $("<div>");
            let $dateEle = $("<h3>");
            let $imgEle = $("");
            let $futureTempEle = $("<p>");
            let $futureWindEle = $("<p>");
            let $futureHumidityEle = $("<p>");
            let $iconForDayEle = $("<img>");
            $iconForDayEle.attr(
              "src",
              createIconUrl(data.daily[i].weather[0].icon)
            );
            $iconForDayEle.addClass("itemImage");

            // Assigning elements value.
            $futureTempEle.text("Temp: " + data.daily[i].temp.day + " ˚C");
            $futureWindEle.text(
              "Wind: " +
                parseFloat(data.daily[i].wind_speed * 2.237).toFixed(2) +
                " MPH"
            );
            $futureHumidityEle.text(
              "Humidity: " + data.daily[i].humidity + " %"
            );
            // Assigning Classes to the element
            $divEle.addClass("forecastDiv");
            $imgEle.addClass("");
            $futureTempEle.addClass("futureTemp");
            $futureWindEle.addClass("futureWind");
            $futureHumidityEle.addClass("futureHumidity");
            $dateEle.text(formatDate(data.daily[i].dt * 1000));
            $dateEle.addClass("dateClass");
            // Appending Elements
            $futureForecast.append($divEle);
            //$futureForecast.append($titleEle);
            $divEle.append($dateEle);
            $divEle.append($imgEle);
            $divEle.append($iconForDayEle);
            $divEle.append($futureTempEle);
            $divEle.append($futureWindEle);
            $divEle.append($futureHumidityEle);
            // $containerEle.append($divEle);
          }
        });
    });
  //Write a catch for an error
}

$btnEle.on("click", searchCity);

//function renderCurrentWeather(response) {}
