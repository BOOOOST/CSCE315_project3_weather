function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function arrayAvg(array){
    total = 0
    for(let i = 0; i < array.length; i++){
        total += array[i];
    }
    return total/array.length;
}
let geoDBhost = 'wft-geo-db.p.rapidapi.com';
let geoDBkey = 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88';
const axios = require("axios");

function getCountryData(countryCode){
  const options = {
    method: 'GET',
    url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries/' + countryCode,
    responseType: 'JSON',
    headers: {
      'X-RapidAPI-Host': geoDBhost,
      'X-RapidAPI-Key': geoDBkey
    }
  };

  axios.request(options).then(function (response) {
      const resp = response.data;
      console.log("name: " + resp.data.name);
      console.log("capital: " + resp.data.capital);
      console.log("calling code: " + resp.data.callingCode);
      console.log("flagUrl: " + resp.data.flagImageUri);
      console.log("=== start ===")
      console.log("=== end ===")
  }).catch(function (error) {
    console.error(error);
  });
}

//search for city and get its data
function getCityData(searchCity, countryCode){
    const options2 = {
        method: 'GET',
        url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities',
        params: {
        countryIds: countryCode,
        minPopulation: '1000',
        namePrefix: searchCity,
        sort: '-population',
        types: 'CITY'
        },
        headers: {
        'X-RapidAPI-Host': geoDBhost,
        'X-RapidAPI-Key': geoDBkey
        }
    };
    
    let cityLat = 0;
    let cityLon = 0;
    axios.request(options2).then(function (response) {
        const resp = response.data;
        let idx = 0;
        console.log("name:", resp.data[idx].name);
        console.log("state/province:", resp.data[idx].region);
        cityLat = resp.data[idx].latitude;
        console.log("lat:", cityLat);
        cityLon = resp.data[idx].longitude;
        console.log("lon:", cityLon);
        console.log("population:", resp.data[idx].population);
    }).catch(function (error) {
        console.error(error);
    });
    return [cityLat, cityLon];
}

  //get historical weather data between dates
  //date format: yyyy-mm-dd ('2020-04-01')
function historicalWeather(cityLat, cityLon, startDate, endDate){
    let weatherDataCoords = cityLat.toString() + ',' + cityLon.toString();
    console.log("getting historical weather for:", weatherDataCoords);

    const optionsHistoricWeather = {
    method: 'GET',
    url: 'https://visual-crossing-weather.p.rapidapi.com/history',
    params: {
        startDateTime: startDate + 'T00:00:00',
        aggregateHours: '24',
        location: weatherDataCoords,
        endDateTime: endDate + 'T00:00:00',
        unitGroup: 'us',
        contentType: 'json',
        shortColumnNames: '0'
    },
    headers: {
        'X-RapidAPI-Host': 'visual-crossing-weather.p.rapidapi.com',
        'X-RapidAPI-Key': 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88'
    }
    };

    let historicalDates = [];
    let historicalLowTemps = [];
    let historicalHighTemps = [];
    let historicalPrecip = [];
    let historicalConditions = [];
    let avgLowTemp = 200
    let avgHighTemp = 200;
    let avgPrecip = 200;
    axios.request(optionsHistoricWeather).then(function (response) {
        const resp = response.data;
        console.log(resp);
        let historicalData = resp.locations[weatherDataCoords].values;
        console.log(historicalData);
        for(day in historicalData){
            console.log("day data:");
            //console.log(historicalData[day]);
            let date = historicalData[day].datetimeStr.toString().substring(0,10);
            console.log("\ndate:", date);
            historicalDates.push(date);

            let lowTemp = historicalData[day].mint;
            console.log("low temp:", lowTemp);
            historicalLowTemps.push(lowTemp);

            let maxTemp = historicalData[day].maxt;
            console.log("high temp:", maxTemp);
            historicalHighTemps.push(maxTemp);

            let precipitation = historicalData[day].precip;
            console.log("precipitation: ", precipitation);
            historicalPrecip.push(precipitation);

            let conditions = historicalData[day].conditions;
            console.log("conditions: ", conditions);
            historicalConditions.push(conditions);
        }

        //compute averages
        avgLowTemp = arrayAvg(historicalLowTemps);
        avgHighTemp = arrayAvg(historicalHighTemps);
        avgPrecip = arrayAvg(historicalPrecip);
        console.log("avgs:", avgLowTemp, avgHighTemp, avgPrecip);

    }).catch(function (error) {
        console.error(error);
    });
    return [avgLowTemp, avgHighTemp, avgPrecip];
}

function getForecast(cityLat, cityLon){
    let weatherDataCoords = cityLat.toString() + ',' + cityLon.toString();
    let futureDates = []
    let futureLowTemps = [];
    let futureHighTemps = [];
    let futurePrecip = [];
    let futureConditions = [];
    const forecastOptions = {
    method: 'GET',
    url: 'https://visual-crossing-weather.p.rapidapi.com/forecast',
    params: {
        aggregateHours: '24',
        location: weatherDataCoords,
        contentType: 'json',
        unitGroup: 'us',
        shortColumnNames: '0'
    },
    headers: {
        'X-RapidAPI-Host': 'visual-crossing-weather.p.rapidapi.com',
        'X-RapidAPI-Key': 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88'
    }
    };

    let avgLowTemp = 200
    let avgHighTemp = 200;
    let avgPrecip = 200;
    axios.request(forecastOptions).then(function (response) {
        //console.log(response.data);
        const resp = response.data;
        let forecastData = resp.locations[weatherDataCoords].values;
        //console.log(forecastDatas[day]);
        for(day in forecastData){
            let date = forecastData[day].datetimeStr.toString().substring(0,10);
            console.log("\ndate:", date);
            futureDates.push(date);

            let lowTemp = forecastData[day].mint;
            console.log("low temp:", lowTemp);
            futureLowTemps.push(lowTemp);

            let maxTemp = forecastData[day].maxt;
            console.log("high temp:", maxTemp);
            futureHighTemps.push(maxTemp);

            let precipitation = forecastData[day].precip;
            console.log("precipitation: ", precipitation);
            futurePrecip.push(precipitation);

            let conditions = forecastData[day].conditions;
            console.log("conditions: ", conditions);
            futureConditions.push(conditions);
        }

        //compute averages
        avgLowTemp = arrayAvg(futureLowTemps);
        avgHighTemp = arrayAvg(futureHighTemps);
        avgPrecip = arrayAvg(futurePrecip);
        console.log("\navgs:", avgLowTemp, avgHighTemp, avgPrecip);
        
    }).catch(function (error) {
        console.error(error);
    });
    return [avgLowTemp, avgHighTemp, avgPrecip];
}

//base currency is string for currency symbol, countryCurrencies is array of strings
function getCurrencyConversion(baseCurrency, countryCurrencies){
    const currencyOptions = {
      method: 'GET',
      url: 'https://exchangerate-api.p.rapidapi.com/rapid/latest/' + baseCurrency,
      headers: {
        'X-RapidAPI-Host': 'exchangerate-api.p.rapidapi.com',
        'X-RapidAPI-Key': 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88'
      }
    };
    
    axios.request(currencyOptions).then(function (response) {
      const resp = response.data;
      for (let i = 0; i < countryCurrencies.length; i++){
        console.log(countryCurrencies[i]);
        console.log(resp.rates[countryCurrencies[i]]);
      }
      //console.log(response.data);
    }).catch(function (error) {
      console.error(error);
    });
}

historicalWeather(32.77, 96.78, '2021-03-08', '2021-03-15')
getCurrencyConversion('USD', ['RUB', 'PKR']);
