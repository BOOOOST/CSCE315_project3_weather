window.onload = function(){
    console.log("test");
    document.getElementById("countryResult").innerHTML = localStorage.getItem("countryData");
    document.getElementById("cityResult").innerHTML = localStorage.getItem("cityData");
    document.getElementById("weatherResult").innerHTML = localStorage.getItem("weatherData");
    document.getElementById("currencyResult").innerHTML = localStorage.getItem("currencyData");
    document.getElementById("bigMacResult").innerHTML = localStorage.getItem("bicMacData");
    
}