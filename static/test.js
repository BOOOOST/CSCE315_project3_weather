const fs = require("fs");
const papa = require("papaparse");
const path = require("path");

//Convert 2 letter to 3 letter country code
async function convertCountryCode(countryCode){
    let jsonObj = await convertCSVtoJSON("CountryCodes.csv"); //convert csv to json
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
async function bigMacIndex(countryCode2){
    let countryCode = await convertCountryCode(countryCode2); //convert 2 letter code to 3 letter
    console.log("Big mac index for:",countryCode);
    let jsonObj = await convertCSVtoJSON("big_mac_full_index.csv"); //load csv file
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
    //localStorage.setItem("bigMacResult",bigMacString);
    console.log(bigMacString)
    
}

//convert a csv file to json
function convertCSVtoJSON(filename){
    let csvPath = path.resolve(__dirname, filename); //get file path
    console.log(csvPath);
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

async function test(){
    console.log("test");
    bigMacIndex("GB");
    console.log("test end");
}

test();