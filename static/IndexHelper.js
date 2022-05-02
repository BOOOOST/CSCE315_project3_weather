//Functios to help with index page
function getCurrentDate(){
    //https://stackoverflow.com/questions/32378590/
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {dd = '0' + dd;}

    if (mm < 10) {mm = '0' + mm;} 

    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

//set the minimum end date to the start date to get a date range
function setMinEndDate(){
    let minEndDay = document.getElementById("startDate").value;
    document.getElementById("endDate").setAttribute("min", minEndDay);
    console.log(minEndDay);
    return minEndDay;
}
  
//get the country code from dropdown
function getCountryCode(){
    let countryCode = document.getElementById("country").value;
    console.log(countryCode);
    return countryCode;
}
