window.onload = function(){
    console.log("test");
    document.getElementById("cityResult").innerHTML = localStorage.getItem("cityResult");
    document.getElementById("countryName").innerHTML = localStorage.getItem("countryName");
    document.getElementById("countryFlag").innerHTML = localStorage.getItem("countryFlag");
    document.getElementById("weatherResult").innerHTML = localStorage.getItem("weatherResult");
    document.getElementById("currencyResult").innerHTML = localStorage.getItem("currencyResult");
    document.getElementById("walkResult").innerHTML = localStorage.getItem("walkResult");
    //document.getElementById("bigMacResult").innerHTML = localStorage.getItem("bigMacData");
    
}