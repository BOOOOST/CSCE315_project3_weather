window.onload = function(){
    document.getElementById("cityResult").innerHTML = localStorage.getItem("cityResult");
    document.getElementById("countryName").innerHTML = localStorage.getItem("countryName");
    document.getElementById("countryFlag").innerHTML = localStorage.getItem("countryFlag");
    document.getElementById("weatherResult").innerHTML = localStorage.getItem("weather");
    document.getElementById("currencyResult").innerHTML = localStorage.getItem("currencyResult");
    document.getElementById("walkResult").innerHTML = localStorage.getItem("walkResult");
}