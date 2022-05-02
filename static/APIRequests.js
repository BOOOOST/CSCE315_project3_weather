var axios = require("axios");
const express = require("express");
const app = express();
var fs = require("fs");
var papa = require("papaparse");
var path = require("path");

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
        console.log("state/province:", resp.data[idx].region);
        cityLat = resp.data[idx].latitude;
        console.log("lat:", cityLat);
        cityLon = resp.data[idx].longitude;
        console.log("lon:", cityLon);
        console.log("population:", resp.data[idx].population);
        let cityResult = "<h1 class=\"display-2\">" + resp.data[idx].name + "</h1>";
        localStorage.setItem("cityResult", cityResult);
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
            else if(low <= 30){
                thermometer = "<img src=\"coldThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
            }
            else if(low <= 40){
                thermometer = "<img src=\"coolThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
            }

            weatherString += "<div class = \"row\"> <div class = \"col-md-6 d-flex justify-content-center\"> <h1 class=\"display-6\">" + date + " </h1></div> <div class = \"col-md-6\"> <h1 class=\"display-6\">" + low + " - " + high + thermometer + "</h1></div></div>";

        }

        //console.log(weatherString);
        let weatherResult = weatherString;
        localStorage.setItem("weatherResult", weatherResult);
        //compute averages
        
        avgLowTemp = arrayAvg(futureLowTemps);
        avgHighTemp = arrayAvg(futureHighTemps);
        avgPrecip = arrayAvg(futurePrecip);
        console.log("\navgs:", avgLowTemp, avgHighTemp, avgPrecip);
        weatherString += "Avg Low Temp: " + avgLowTemp + "<br>" +
        "Avg High Temp: " + avgHighTemp + "<br>" +
        "Avg Precipitation: " + avgPrecip;
        console.log(weatherString);
        
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
      
      //TODO: fix bike score
      axios.request(options).then(function (response) {
          let resp = response.data;
          console.log(resp);
          let walkScore = resp.walkscore;
          let walkDescription = resp.description;
          let bikeScore = -1; //resp.bike.score;
          let bikeDescription = "Not Available";//resp.bike.description;
          let walkColor = 'red';
          let hasBikeScore = true;
          try{
            bikeScore = resp.bike.score;
            bikeDescription = resp.bike.description;
          }
          catch(e){
            console.log("Bike Score Not Available");
            hasBikeScore = false;
          }
          if(walkScore <= 50){
            walkColor = 'red';
          }
          else if(walkScore <= 75){
            walkColor = 'yellow';
          }
          
          let bikeColor = 'green';
          if(bikeScore <= 50){
            bikeColor = 'red';
          }
          else if(bikeScore <= 75) {
            bikeColor = 'orange';
          }
          walkString = "<h1 class=\"display-6\">";
          console.log("walk score:",walkDescription, walkScore, "| bike score:",bikeScore, bikeDescription, walkColor, bikeColor);
          if(hasBikeScore == true){
            walkString += "<div style=\"color:" + walkColor + ";float:left;\">" + walkScore + "</div> " + "<span>&#8594;</span>"+ walkDescription + "<br>" + "<div style=\"color:" + bikeColor + ";float:left;\">" + bikeScore + "</div>" +  "<span>&#8594;</span>" + bikeDescription + "<br> </h1>";
          }else{
            walkString += "<div style=\"color:" + walkColor + ";float:left;\">" + walkScore + "</div> " + "<span>&#8594;</span>"+ walkDescription + "</h1>";
          }

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
    
    currencyString = "<h1 class=\"display-6\">";
    await axios.request(currencyOptions).then(function (response) {
      const resp = response.data;
      for (let i = 0; i < countryCurrencies.length; i++){
        console.log(countryCurrencies[i]);
        //console.log(1,baseCurrency,"=",resp.rates[countryCurrencies[i]],countryCurrencies[i]);
        currencyString += "1 " + baseCurrency + " = " + resp.rates[countryCurrencies[i]] + " " + countryCurrencies[i] + "</h1><br>";
      }
    }).catch(function (error) {
      console.error(error);
    });
    console.log(currencyString);
    let currencyResult = currencyString;
    localStorage.setItem("currencyResult", currencyResult);
}

async function getResult(){
    var weather = document.getElementById("weather");
    let dateRange = getDatesAsDate();
    if(weather.checked){

    }
    //var latlon = await getCityData(document.getElementById("cityname").value, getCountryCode());
    //console.log('lat',latlon[0],'lon:',latlon[1], 'city name: ', document.getElementById("cityname").value);
    //setTimeout(() => { getCountryData(getCountryCode()); }, 1000);
    //setTimeout(() => { getForecast(latlon[0], latlon[1], dateRange[0], dateRange[1]); }, 2500);
    //setTimeout(() => { getCurrencyConversion('USD', currencyCodes); }, 1500); 
    //setTimeout(() => { getWalkScore(latlon[0], latlon[1], document.getElementById("cityname").value); }, 1000);
    setTimeout(() => { getBigMacIndex(getCountryCode()); }, 1000); 
    setTimeout(() => {progressBar(3000); }, 500); 
    setTimeout(() => { window.open('results.html','_blank').focus();}, 2500);
}

async function weatherTest(){
    let weatherString = "";
    let high = [43.4, 67.9, 23.6];
    let low = [41.4, 61.9, 21.6];
    let date = ['1/01/2022', '1/02/2022', '1/03/2022'];
    for(let i = 0; i < 3; i++){
        let thermometer = "<img src=\"coldThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
        if(high[i] >= 90){
            thermometer = "<img src=\"veryhotThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
        }
        else if(high[i] >= 80){
            thermometer = "<img src=\"hotThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
        }
        else if(high[i] >= 60){
            thermometer = "<img src=\"mediumThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
        }
        else if(low[i] <= 30){
            thermometer = "<img src=\"coldThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
        }
        else if(low[i] <= 40){
            thermometer = "<img src=\"coolThermometer_transparent.png\" style=\"width:100px;height:300px;margin-left:60px\">"
        }

        weatherString += "<div class = \"row\"> <div class = \"col-md-6 d-flex justify-content-center\"> <h1 class=\"display-6\">" + date[i] + " </h1></div> <div class = \"col-md-6\"> <h1 class=\"display-6\">" + low[i] + " - " + high[i] + thermometer + "</h1></div></div>";
    }
    //console.log(weatherString);
    let weatherTestResult = weatherString;
    localStorage.setItem("weatherResult", weatherTestResult);
    
}

//for big mac index
//Convert 2 letter to 3 letter country code
async function convertCountryCode(countryCode){
    console.log("country code");
    let jsonObj = await convertCSVtoJSON("C:/Users/hamza/Documents/A&M/CSCE315/csce315_project3/static/CountryCodes.csv"); //convert csv to json
    return new Promise((resolve,reject) => { //fpr aync stuff
        //filter json to get correct country
        var data_filter = jsonObj.filter( element => element.two_letter == countryCode);
        data_filter = Object.values(data_filter);
        console.log(data_filter);
        three_letter = data_filter[0].three_letter;
        resolve(three_letter);
    });

}

//get big mac index for country
async function getBigMacIndex(countryCode2){
    console.log("big mac ind");
    let countryCode = await convertCountryCode(countryCode2); //convert 2 letter code to 3 letter
    console.log("Big mac index for:",countryCode);
    let jsonObj = await convertCSVtoJSON("C:/Users/hamza/Documents/A&M/CSCE315/csce315_project3/static/big_mac_full_index.csv"); //load csv file
    var data_filter = jsonObj.filter( element => element.iso_a3 == countryCode); //filter to find matching country
    data_filter = Object.values(data_filter);
    let bigMacData = data_filter[data_filter.length - 1]; //get most recent data in file
    let localPrice = bigMacData.local_price; //make string of results
    let currencyCode = bigMacData.currency_code;
    let dollarPrice = bigMacData.dollar_price;
    let adjPrice = bigMacData.adj_price;
    let lastUpdated = bigMacData.date;
    dollarPrice = parseFloat(dollarPrice).toFixed(2); //round proces to 2 decimals
    adjPrice = parseFloat(adjPrice).toFixed(2);
    let bigMacString = "Local Price: " + localPrice + " " + currencyCode + "\n";
    bigMacString += "USD Price: " + dollarPrice + " USD\n";
    bigMacString += "GDP Adjusted Price: " + adjPrice + " USD\n";
    bigMacString += "Last Updated: " + lastUpdated + "\n";
    localStorage.setItem("bigMacResult",bigMacString);
    console.log(bigMacString)
    
}

//convert a csv file to json
async function convertCSVtoJSON(csvPath){
    //console.log("read file in:", __dirname);
    //let csvPath = path.resolve(__dirname, filename); //get file path
    //console.log("read path:",csvPath);
    const file = fs.createReadStream(csvPath);
    var count = 0; // cache the running count
    csvString = "";
    console.log("parse");
    return new Promise((resolve,reject) => { //for async
    papa.parse(file, {
        worker: true, // Don't bog down the main thread if its a big file
        step: function(result) { //read csv data line by line
            // do stuff with result
            for(let i = 0; i < result.data.length; i++){
                //console.log(result.data[i])
                csvString += (result.data[i] + ",");
            }
            csvString += '\n';
            count += 1;
            
        },
        complete: function(results, file) { //convert csv data to json 
            console.log('parsing complete read', count, 'records.'); 
            //console.log(csvString);
            //resolve(csvString);
            let testy = papa.parse(csvString,{ //json conversion
                delimiter: "", // auto-detect 
                newline: "", // auto-detect 
                quoteChar: '"', 
                escapeChar: '"', 
                header: true, // creates array of {head:value} 
                dynamicTyping: false, // convert values to numbers if possible
                skipEmptyLines: true 
              }); 
            //console.log(testy.data)
            resolve(testy.data);
        }
    });
    });
    console.log("done");
    //return csvString;
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

async function progressBar(loadTime){
    let bar = document.getElementById("loadingbar");
    let barWidth = 0;
    while(barWidth < 100){
        await new Promise(r => setTimeout(r, loadTime/1000));
        barWidth += 1;
        bar.style.width = barWidth.toString() + "%";
    }

}

