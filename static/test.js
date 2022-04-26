const fs = require("fs");
const csv = require("csvtojson");
const papa = require("papaparse")

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
    papaparse.parse()
    const csvFilePath='C:/Users/hamza/Documents/A&M/CSCE315/csce315_project3/static/big-mac-full-index.csv'
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
        //console.log(jsonObj);
        var data_filter = jsonObj.filter( element => element.iso_a3 == countryCode)
        data_filter = Object.values(data_filter);
        let bigMacData = data_filter[data_filter.length - 1];
        let bigMacString = "Local Price:" + bigMacData.local_price + bigMacData.currency_code + "\n";
        bigMacString += "USD Price:" + bigMacData.dollar_price + "USD";
        bigMacString += "GDP Adjusted Price:" + bigMacData.adj_price + "USD";
        bigMacString += "Last Updated:" + bigMacData.date;
        //localStorage.setItem("bigMacData",bigMacString);
        console.log(bigMacString)
    })
     
    // Async / await usage
    const jsonArray=await csv().fromFile(csvFilePath);
    
}

async function parseTest(){
    const file = fs.createReadStream('C:/Users/hamza/Documents/A&M/CSCE315/csce315_project3/static/CountryCodes.csv');
    var count = 0; // cache the running count
    csvString = "";
    console.log("parse")
    papa.parse(file, {
        worker: true, // Don't bog down the main thread if its a big file
        step: function(result) {
            // do stuff with result
            for(let i = 0; i < result.data.length; i++){
                //console.log(result.data[i])
                csvString += (result.data[i] + ",");
            }
            csvString += '\n'
            count += 1;
            
        },
        complete: function(results, file) {
            console.log('parsing complete read', count, 'records.'); 
            //console.log(csvString);
            let testy = papa.parse(csvString,{ 
                delimiter: "", // auto-detect 
                newline: "", // auto-detect 
                quoteChar: '"', 
                escapeChar: '"', 
                header: true, // creates array of {head:value} 
                dynamicTyping: false, // convert values to numbers if possible
                skipEmptyLines: true 
              }); 
            //console.log(testy.data)
            return testy.data;
        }
    });
    console.log("done");
    //return csvString;
}
//let code = await countryCode("PK");
//console.log(code);
//bigMacIndex("GB");
async function test(){
    console.log("test");
    let csvdata = await parseTest();
    console.log(csvdata);
    console.log("test end");
}
test();
