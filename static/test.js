const fs = require("fs");
const csv = require("csvtojson");

async function convertCountryCode(countryCode){
    let three_letter = "USA";
    const csvFilePath='C:/Users/hamza/Documents/A&M/CSCE315/csce315_project3/static/CountryCodes.csv'
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        //console.log(jsonObj);
        var data_filter = jsonObj.filter( element => element.two_letter == countryCode)
        data_filter = Object.values(data_filter);
        //console.log(data_filter);
        three_letter = data_filter[0].three_letter;
        //console.log("2 letter",three_letter);
    })
     
    // Async / await usage
    const jsonArray=await csv().fromFile(csvFilePath);
    return three_letter;
}

async function bigMacIndex(countryCode2){
    let countryCode = await convertCountryCode(countryCode2);
    console.log(countryCode);
    
    const csvFilePath='C:/Users/hamza/Documents/A&M/CSCE315/csce315_project3/static/big-mac-full-index.csv'
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        //console.log(jsonObj);
        var data_filter = jsonObj.filter( element => element.iso_a3 == countryCode)
        data_filter = Object.values(data_filter);
        let bigMacData = data_filter[data_filter.length - 1];
        let bicMacString = "Local Price:" + bigMacData.local_price + bigMacData.currency_code + "\n";
        bicMacString += "USD Price:" + bigMacData.dollar_price + "USD";
        bicMacString += "GDP Adjusted Price:" + bigMacData.adj_price + "USD";
        bicMacString += "Last Updated:" + bigMacData.date;
        localStorage.setItem("bigMacData",bigMacString);
    })
     
    // Async / await usage
    const jsonArray=await csv().fromFile(csvFilePath);
    
}

//let code = await countryCode("PK");
//console.log(code);
bigMacIndex("GB");
