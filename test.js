const fs = require("fs");
const csv = require("csvtojson");

async function csvStuff(countryCode){
    const csvFilePath='C:/Users/hamza/Documents/A&M/CSCE315/csce315_project3/big-mac-full-index.csv'
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        //console.log(jsonObj);
        var data_filter = jsonObj.filter( element => element.iso_a3 == countryCode)
        data_filter = Object.values(data_filter);
        let bigMacData = data_filter[data_filter.length - 1];
        console.log("Local price:",bigMacData.local_price, bigMacData.currency_code);
    })
     
    // Async / await usage
    const jsonArray=await csv().fromFile(csvFilePath);
}

csvStuff("PAK");