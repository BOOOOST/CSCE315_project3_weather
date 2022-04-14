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
async function getForecast(cityLat, cityLon, startDate, endDate){
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
            //console.log("\ndate:", date);
            futureDates.push(date);

            let lowTemp = forecastData[day].mint;
            //console.log("low temp:", lowTemp);
            futureLowTemps.push(lowTemp);

            let maxTemp = forecastData[day].maxt;
            //console.log("high temp:", maxTemp);
            futureHighTemps.push(maxTemp);

            let precipitation = forecastData[day].precip;
            //console.log("precipitation: ", precipitation);
            futurePrecip.push(precipitation);

            let conditions = forecastData[day].conditions;
            //console.log("conditions: ", conditions);
            futureConditions.push(conditions);
        }

        //store indexes of data arrays with start and end dates 
        console.log("filter with dates:", startDate, endDate);
        let startIndex = -1;
        let endIndex = -1;
        //filter data to display relevant dates only
        for(let i = 0; i < futureDates.length; i++){
            console.log("date:",futureDates[i]);
            if(futureDates[i] === startDate){ //found start date in array
                startIndex = i;
            }
            if(futureDates[i] === endDate){ //found end date
                endIndex = i;
                break;
            }
        }

        //do filtering
        if(startIndex == -1){ //start index not found, forecast not available
            console.log("Forecast not Available");
            console.log("Indexes:", startIndex, endIndex);
        }
        else if(startIndex != -1 && endIndex == -1){ //found start date but not end date
            console.log("Indexes:", startIndex, endIndex);
            let dataPoints = futureDates.length; //number of datapoints in date range
            futureDates = futureDates.slice(startIndex, dataPoints);
            futureLowTemps = futureLowTemps.slice(startIndex, dataPoints);
            futureHighTemps = futureHighTemps.slice(startIndex, dataPoints);
            futurePrecip = futurePrecip.slice(startIndex, dataPoints);
            futureConditions = futureConditions.slice(startIndex, dataPoints);

        }
        else if(startIndex != -1 && endIndex != -1){ //found start and end
            console.log("Indexes:", startIndex, endIndex);
            futureDates = futureDates.slice(startIndex, endIndex + 1);
            futureLowTemps = futureLowTemps.slice(startIndex, endIndex + 1);
            futureHighTemps = futureHighTemps.slice(startIndex, endIndex + 1);
            futurePrecip = futurePrecip.slice(startIndex, endIndex + 1);
            futureConditions = futureConditions.slice(startIndex, endIndex + 1);
        }
        else{ //bruh
            console.log("ERROR: Forecast date range filtering error");
            console.log("Indexes:", startIndex, endIndex);
        }

        //push results to response data
        for(let i = 0; i < futureDates.length; i++){
            let date = futureDates[i];
            let lowTemp = futureLowTemps[i];
            let maxTemp = futureHighTemps[i];
            let precipitation = futurePrecip[i];
            let conditions = futureConditions[i];
            weatherString += "Date: " + date + "<br>";
            weatherString += "Low Temp: " + lowTemp + "<br>";
            weatherString += "High Temp: " + maxTemp + "<br>";
            weatherString += "Precipitation: " + precipitation + "<br>";
            weatherString += "Conditions: " + conditions + "<br><br>";

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

//get historical weather data between dates
//date format: yyyy-mm-dd ('2020-04-01')
//cityLat, cityLon are latitude, loingtitude as float, start date, end date are date range to get weather
async function historicalWeather(cityLat, cityLon, startDate, endDate){
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
        'X-RapidAPI-Host': weatherHost,
        'X-RapidAPI-Key': weatherKey
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
    await axios.request(optionsHistoricWeather).then(function (response) {
        const resp = response.data;
        //console.log(resp);
        let historicalData = resp.locations[weatherDataCoords].values;
        //console.log(historicalData);
        for(day in historicalData){
            console.log("day data:");
            //console.log(historicalData[day]);
            let date = historicalData[day].datetimeStr.toString().substring(0,10);
            //console.log("\ndate:", date);
            historicalDates.push(date);

            let lowTemp = historicalData[day].mint;
            //console.log("low temp:", lowTemp);
            historicalLowTemps.push(lowTemp);

            let maxTemp = historicalData[day].maxt;
            //console.log("high temp:", maxTemp);
            historicalHighTemps.push(maxTemp);

            let precipitation = historicalData[day].precip;
            //console.log("precipitation: ", precipitation);
            historicalPrecip.push(precipitation);

            let conditions = historicalData[day].conditions;
            //console.log("conditions: ", conditions);
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
    let dateRange = getDatesAsDate();
    if(weather.checked){

    }
    var latlon = await getCityData(document.getElementById("cityname").value, getCountryCode());
    console.log('lat',latlon[0],'lon:',latlon[1]);
    setTimeout(() => { getCountryData(getCountryCode()); }, 2000);
    setTimeout(() => { getForecast(latlon[0], latlon[1], dateRange[0], dateRange[1]); }, 2500);
    //setTimeout(() => { getCurrencyConversion('USD', currencyCodes); }, 2000); 
}
  
function getCountryCode(){
    let countryCode = document.getElementById("country").value;
    console.log(countryCode);
    return countryCode;
}

function dateToString(date){
    //https://stackoverflow.com/questions/32378590/
    let dd = date.getDate();
    let mm = date.getMonth() + 1; //January is 0!
    let yyyy = date.getFullYear();

    if (dd < 10) {dd = '0' + dd;}

    if (mm < 10) {mm = '0' + mm;} 

    let dateString = yyyy + '-' + mm + '-' + dd;
    return dateString;
}

function stringToDate(dateString){
    let dateArray = dateString.split("-");
    let convertedDate = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
    return convertedDate;
}

function getDatesAsDate(){
    let startDateStr = document.getElementById("startDate").value;
    let endDateStr = document.getElementById("endDate").value;
    let startDateDate = stringToDate(startDateStr);
    let endDateDate = stringToDate(endDateStr);
    let lastYearStart = startDateDate;
    let lastYearEnd = endDateDate;
    lastYearStart.setFullYear(startDateDate.getFullYear() -1);
    lastYearEnd.setFullYear(endDateDate.getFullYear() -1);
    console.log("dates:", startDateStr, endDateStr, dateToString(lastYearStart), dateToString(lastYearEnd));
    return [startDateStr, endDateStr, dateToString(lastYearStart), dateToString(lastYearEnd)];
}

