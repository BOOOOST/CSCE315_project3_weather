var axios = require("axios");
const express = require('express');
const app = express();

var geoDBhost = 'wft-geo-db.p.rapidapi.com';
var geoDBkey = 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88';
var weatherHost = 'visual-crossing-weather.p.rapidapi.com';
var weatherKey = 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88';
var currencyCodes = [];
//returns average value of array
function arrayAvg(array){
    total = 0
    for(let i = 0; i < array.length; i++){
        total += array[i];
    }
    return total/array.length;
}

//get country data with ISO country code as string (US, PK, etc)
function getCountryData(countryCode){
    var result = document.getElementById("countryResult");
    const options = {
    method: 'GET',
    url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries/' + countryCode,
    responseType: 'JSON',
    headers: {
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
        'X-RapidAPI-Key': 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88'
    }
    };
    
    console.log("country data for:",countryCode);
    axios.request(options).then(function (response) {
        console.log("country data response");
        const resp = response.data;
        currencyCodes = resp.data.currencyCodes;
        console.log(currencyCodes);
        console.log("name: " + resp.data.name);
        console.log("capital: " + resp.data.capital);
        console.log("calling code: " + resp.data.callingCode);
        console.log("flagUrl: " + resp.data.flagImageUri);
        result.innerHTML = "name: " + resp.data.name + "<br>" + "capital: " + resp.data.capital + "<br>" + 
        "calling code: " + resp.data.callingCode + "<br>" + 
        "flag: <br><img src=\"" + resp.data.flagImageUri + "\" style=\"width:500px;height:auto;\">";
        setTimeout(() => { getCurrencyConversion('USD', currencyCodes); }, 2000);
    }).catch(function (error) {
    console.error(error);
    });
}

function getCountryCode(){
    var elem = document.getElementById("country");
    return elem.value;
}

//search for city and get its data with searchCity (string) and ISO country code (string)
async function getCityData(searchCity, countryCode){
  console.log("get city data for:",searchCity,countryCode);
    var cityResult = document.getElementById("cityResult");
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
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
        'X-RapidAPI-Key': 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88'
        }
    };
    
    let cityLat = 0;
    let cityLon = 0;
    await axios.request(options2).then(function (response) {
        const resp = response.data;
        let idx = 0;
        console.log("name:", resp.data[idx].name);
        console.log("state/province:", resp.data[idx].region);
        cityLat = resp.data[idx].latitude;
        console.log("lat:", cityLat);
        cityLon = resp.data[idx].longitude;
        console.log("lon:", cityLon);
        console.log("population:", resp.data[idx].population);
        cityResult.innerHTML = "Info about " + resp.data[idx].name + "<br>" + "State/Province: " + resp.data[idx].region + "<br>Latitude: " + cityLat + "<br>Longitude: " + cityLon;
    }).catch(function (error) {
        console.error(error);
    });
    return [cityLat, cityLon];
}

//get forecast with cityLat, cityLon (latitude, longtitude) as float
async function getForecast(cityLat, cityLon){
    console.log(cityLat);
    console.log(cityLon);
    var weatherResult = document.getElementById("weatherResult");
    var weatherString = "<br>";
    let weatherDataCoords = cityLat.toString() + ',' + cityLon.toString();
    let futureDates = [];
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
    await axios.request(forecastOptions).then(function (response) {
        const resp = response.data;
        let forecastData = resp.locations[weatherDataCoords].values;
        for(day in forecastData){
            let date = forecastData[day].datetimeStr.toString().substring(0,10);
            console.log("\ndate:", date);
            weatherString += "Date: " + date + "<br>";
            futureDates.push(date);

            let lowTemp = forecastData[day].mint;
            console.log("low temp:", lowTemp);
            weatherString += "Low Temp: " + lowTemp + "<br>";
            futureLowTemps.push(lowTemp);

            let maxTemp = forecastData[day].maxt;
            console.log("high temp:", maxTemp);
            weatherString += "High Temp: " + maxTemp + "<br>";
            futureHighTemps.push(maxTemp);

            let precipitation = forecastData[day].precip;
            console.log("precipitation: ", precipitation);
            weatherString += "Precipitation: " + precipitation + "<br>";
            futurePrecip.push(precipitation);

            let conditions = forecastData[day].conditions;
            console.log("conditions: ", conditions);
            weatherString += "Conditions: " + conditions + "<br><br>";
            futureConditions.push(conditions);
        }

        //compute averages
        avgLowTemp = arrayAvg(futureLowTemps);
        avgHighTemp = arrayAvg(futureHighTemps);
        avgPrecip = arrayAvg(futurePrecip);
        console.log("\navgs:", avgLowTemp, avgHighTemp, avgPrecip);
        weatherString += "Avg Low Temp: " + avgLowTemp + "<br>" +
        "Avg High Temp: " + avgHighTemp + "<br>" +
        "Avg Precipitation: " + avgPrecip;
        weatherResult.innerHTML = weatherString;
    }).catch(function (error) {
        console.error(error);
    });
}

async function getWalkScore()
{
    console.log("WalkScore Function");
    let cityLat = '29.749907';
    let cityLon = '-95.358421';
    let cityName = 'Houston';
    const options = {
        method: 'GET',
        url: 'https://walk-score.p.rapidapi.com/score',
        params: {
          lat: cityLat,
          address: cityName,
          wsapikey: 'a3d932d96574feac7773fccf866af126',
          lon: cityLon,
          format: 'json',
          bike: '1',
          transit: '1'
        },
        headers: {
          'X-RapidAPI-Host': 'walk-score.p.rapidapi.com',
          'X-RapidAPI-Key': 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88'
        }
      };
      
      axios.request(options).then(function (response) {
          let resp = response.data;
          console.log(resp);
          let walkScore = resp.description;
          console.log(walkScore);
      }).catch(function (error) {
          console.error(error);
      });
}

//baseCurrency is string for currency symbol ('USD'), countryCurrencies is array of strings with currency symbols (['GBP'])
async function getCurrencyConversion(baseCurrency, countryCurrencies){
    const currencyOptions = {
      method: 'GET',
      url: 'https://exchangerate-api.p.rapidapi.com/rapid/latest/' + baseCurrency,
      headers: {
        'X-RapidAPI-Host': 'exchangerate-api.p.rapidapi.com',
        'X-RapidAPI-Key': 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88'
      }
    };
    
    currencyString = "";
    await axios.request(currencyOptions).then(function (response) {
      const resp = response.data;
      for (let i = 0; i < countryCurrencies.length; i++){
        console.log(countryCurrencies[i]);
        console.log(1,baseCurrency,"=",resp.rates[countryCurrencies[i]],countryCurrencies[i]);
        currencyString += "1 " + baseCurrency + " = " + resp.rates[countryCurrencies[i]] + " " + countryCurrencies[i] + "<br>";
      }
    }).catch(function (error) {
      console.error(error);
    });
    currencyResult.innerHTML = currencyString;
}

async function getResult(){
    var weather = document.getElementById("weather");
    if(weather.checked){

    }
    var latlon = await getCityData(document.getElementById("cityname").value, getCountryCode());
    console.log('lat',latlon[0],'lon:',latlon[1]);
    setTimeout(() => { getCountryData(getCountryCode()); }, 2000);
    setTimeout(() => { getForecast(latlon[0], latlon[1]); }, 2500);
    //setTimeout(() => { getCurrencyConversion('USD', currencyCodes); }, 2000); 
}

  
function getCountryCode(){
    let countryCode = document.getElementById("country").value;
    console.log(countryCode);
    return countryCode;
}