var axios = require("axios");
const express = require("express");
const app = express();
var fs = require("fs");
var papa = require("papaparse");
var path = require("path");
var process = require("process");

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
    var countryName = document.getElementById("countryName");
    var countryFlag = document.getElementById("countryFlag")
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
        //console.log(currencyCodes);
        console.log("name: " + resp.data.name);
        //console.log("capital: " + resp.data.capital);
        //console.log("calling code: " + resp.data.callingCode);
        //console.log("flagUrl: " + resp.data.flagImageUri);
        let countryName = "<br> <h1 class=\"display-3\">" + resp.data.name + "</h1> <br>";
        let countryFlag = "<img id = \"flagIMG\" src=\"" + resp.data.flagImageUri + "\" style=\"width:400px;height:auto;\">";
        localStorage.setItem("countryName", countryName);
        localStorage.setItem("countryFlag", countryFlag);
        //setTimeout(() => { getCurrencyConversion('USD', currencyCodes); }, 2000);
    }).catch(function (error) {
    console.error(error);
    });
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
        //console.log("state/province:", resp.data[idx].region);
        cityLat = resp.data[idx].latitude;
        //console.log("lat:", cityLat);
        cityLon = resp.data[idx].longitude;
        //console.log("lon:", cityLon);
        //console.log("population:", resp.data[idx].population);
        //make coordinates show N/S or W/E
        let cityLatStr = "";
        let cityLonStr= "";
        //make string for latitude
        if(cityLat < 0){ //S
            cityLatStr += Math.abs(cityLat).toFixed(4).toString();
            cityLatStr += "° S";
        }else{ //N
            cityLatStr += cityLat.toFixed(4).toString();
            cityLatStr += "° N";
        }

        //make string for longtitude
        if(cityLon < 0){ //W
            cityLonStr += Math.abs(cityLon).toFixed(4).toString();
            cityLonStr += "° W";
        }else{ //N
            cityLonStr += cityLon.toFixed(4).toString();
            cityLonStr += "° E";
        }
        
        //make HTML for city data display
        let cityResult = "<h1 class=\"display-2\" style=\"text-align: center;\">" + resp.data[idx].name + "</h1>\n";
        cityResult += "<h4 class=\"display-3\" style=\"text-align: center;\"> Coordinates: " + cityLatStr + ", " + cityLonStr  + "</h4>\n";
        cityResult += "<h4 class=\"display-3\" style=\"text-align: center;\"> State/ Province: " + resp.data[idx].region  + "</h4>\n";
        cityResult += "<h4 class=\"display-3\" style=\"text-align: center;\"> Population: " + resp.data[idx].population + "</h4>\n"
        localStorage.setItem("cityResult", cityResult);
    }).catch(function (error) {
        console.error(error);
    });
    return [cityLat, cityLon];
}

//get forecast with cityLat, cityLon (latitude, longtitude) as float
async function getForecast(cityLat, cityLon, startDate, endDate){
    var weatherString = "<br> <div class = \"resultBox\"> <div class = \"row\"> <div class=\"col-md-6 d-flex justify-content-center\"> <h1 class=\"display-6\" style=\"font-weight: bolder;\"> Weather Results </h1> </div> </div>";
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
            let low = futureLowTemps[i];
            let high = futureHighTemps[i];
            let precipitation = futurePrecip[i];
            let conditions = futureConditions[i];
            
            let thermometer = "<img src=\"coldThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
            if(high >= 90){
                thermometer = "<img src=\"veryhotThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
            }
            else if(high >= 80){
                thermometer = "<img src=\"hotThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
            }
            else if(high >= 60){
                thermometer = "<img src=\"mediumThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
            }
            else if(low <= 32){
                thermometer = "<img src=\"coldThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
            }
            else if(low <= 45){
                thermometer = "<img src=\"coolThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
            }

            weatherString += "<div class = \"row\" style = \"background-color: white; margin: 50px; border-radius: 25px; border: 2px solid #51534d;\"> <div class = \"col-md-4 d-flex justify-content-center\"> <h1 class=\"display-6\" style=\"font-size: 50px; font-weight: bold;\">" + convertToUSdate(date) + " </h1></div> <div class = \"col-md-8\"> <h1 class=\"display-6\">" + conditions + "<span>&#8594;</span>" + low + "°F - " + high + "°F " + thermometer + "</h1></div></div>";

        }

        //compute averages
        
        avgLowTemp = arrayAvg(futureLowTemps).toPrecision(3);
        avgHighTemp = arrayAvg(futureHighTemps).toPrecision(3);
        avgPrecip = arrayAvg(futurePrecip).toPrecision(3);
        console.log("\navgs:", avgLowTemp, avgHighTemp, avgPrecip);
        weatherString += "<div class = \"row\"><div class = \"col-md-12 d-flex justify-content-center\"><h1 class=\"display-6\"> Average Low Temperature: " + avgLowTemp + "°F <br> Average High Temperature: " + avgHighTemp + "°F <br> Average Precipitation: " + avgPrecip + " inches</h1></div></div></div>";
        console.log(weatherString);

        let weatherResult = weatherString;
        localStorage.setItem("weather", weatherResult);
        
    }).catch(function (error) {
        console.error(error);
    });
    return [futureDates, futureLowTemps, futureHighTemps, futurePrecip];
}

async function getWalkScore(cityLat, cityLon, cityName){
    console.log("WalkScore Function");
    //var walkResult = document.getElementById("walkResult");
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
          let walkScore = resp.walkscore;
          let walkDescription = resp.description;
          let bikeScore = -1; //resp.bike.score;
          let bikeDescription = "Not Available";//resp.bike.description;
          let transportScore = -1; //resp.bike.score;
          let transportDescription = "Not Available";//resp.bike.description;
          let walkColor = 'green';
          let hasBikeScore = true;
          try{
            bikeScore = resp.bike.score;
            bikeDescription = resp.bike.description;
            transportScore = resp.transit.score;
            transportDescription = resp.transit.description;
          }
          catch(e){
            console.log("Bike Score Not Available");
            hasBikeScore = false;
          }
          if(walkScore <= 50){
            walkColor = 'red';
          }
          else if(walkScore <= 75){
            walkColor = 'orange';
          }
          
          let bikeColor = 'green';
          if(bikeScore <= 50){
            bikeColor = 'red';
          }
          else if(bikeScore <= 75) {
            bikeColor = 'orange';
          }
          let walkScoreLink = "<a class=\"display-6\" style=\"font-weight: bold;color: #212529;text-decoration: none;\" href=\"https://www.redfin.com/how-walk-score-works\">Walk Score</a>";
          let walkString = "<div class = \"resultBox\"><div class = \"row mt-5\"> <div class=\"col-md-6 d-flex justify-content-center\"> <h1 class=\"display-6\" style=\"font-weight: bold;\">" + walkScoreLink +  "</h1> </div>";
          walkString += "<div class=\"col-md-6 d-flex justify-content-center\"> <h1 class=\"display-6\">";
          console.log("walk score:",walkDescription, walkScore, "| bike score:",bikeScore, bikeDescription, walkColor, bikeColor, transportScore, transportDescription);
          if(hasBikeScore == true){
            walkString += "<div style=\"color:" + walkColor + ";float:left;\">" + walkScore + "</div> " + "<span>&#8594;</span>"+ walkDescription + "<br>" + "<div style=\"color:" + bikeColor + ";float:left;\">" + bikeScore + "</div>" +  "<span>&#8594;</span>" + bikeDescription + "<br> </h1></div></div></div>";
          }else{
            walkString += "<div style=\"color:" + walkColor + ";float:left;\">" + walkScore + "</div> " + "<span>&#8594;</span>"+ walkDescription + "</h1></div></div></div>";
          }

          console.log(walkString);
          localStorage.setItem("walkResult", walkString);
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
    
    currencyString = "<div class = \"resultBox\"> <div class = \"row mt-5\"> <div class=\"col-md-6 d-flex justify-content-center\"> <h1 class=\"display-6\" style=\"font-weight: bolder;\"> Currency Rates </h1> </div> <div class=\"col-md-6 d-flex justify-content-center\"> <h1 class=\"display-6\">";
    await axios.request(currencyOptions).then(function (response) {
      const resp = response.data;
      for (let i = 0; i < countryCurrencies.length; i++){
        console.log(countryCurrencies[i]);
        //console.log(1,baseCurrency,"=",resp.rates[countryCurrencies[i]],countryCurrencies[i]);
        currencyString += "1 " + baseCurrency + " = " + resp.rates[countryCurrencies[i]] + " " + countryCurrencies[i] + "</h1></div></div></div><br>";
      }
    }).catch(function (error) {
      console.error(error);
    });
    console.log(currencyString);
    let currencyResult = currencyString;
    localStorage.setItem("currencyResult", currencyResult);
}

async function getResult(){

    let weather = document.getElementById("weather");
    let currency = document.getElementById("currency");
    let transport = document.getElementById("transport");
    let dateRange = getDatesAsDate();

    var latlon = await getCityData(document.getElementById("cityname").value, getCountryCode());
    console.log('lat',latlon[0],'lon:',latlon[1], 'city name: ', document.getElementById("cityname").value);
    setTimeout(() => { getCountryData(getCountryCode()); }, 1500);
    if(weather.checked){
        setTimeout(() => { getForecast(latlon[0], latlon[1], dateRange[0], dateRange[1]); }, 2500);
        //weatherTest();
    }
    if(currency.checked){
        setTimeout(() => { getCurrencyConversion('USD', currencyCodes); }, 2500);
    }
    if(transport.checked){
        setTimeout(() => { getWalkScore(latlon[0], latlon[1], document.getElementById("cityname").value); }, 2500);
    }
    //setTimeout(() => { getBigMacIndex(getCountryCode()); }, 1000); 
    //setTimeout(() => {weatherTest(); }, 500);
    setTimeout(() => {progressBar(4000); }, 500); 
    setTimeout(() => { window.open('results.html','_self').focus();}, 4000);
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

function convertToUSdate(dateString){
    let dateArray = dateString.split("-");
    return dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0];
}

async function progressBar(loadTime){
    let bar = document.getElementById("loadingbar");
    let barWidth = 0;
    bar.style.width = barWidth.toString() + "%";
    while(barWidth < 100){
        await new Promise(r => setTimeout(r, loadTime/1000));
        barWidth += 1;
        bar.style.width = barWidth.toString() + "%";
    }

}

async function resultsButton(){
    location.href = 'index.html';
    localStorage.clear();
}
