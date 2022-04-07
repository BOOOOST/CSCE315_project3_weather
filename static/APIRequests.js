var axios = require("axios");
const express = require('express');
const app = express();

//app.use('/js', express.static(__dirname + '/public/js'));
function getCurrencyConversion(baseCurrency, countryCurrencies){
  const currencyOptions = {
    method: 'GET',
    url: 'https://exchangerate-api.p.rapidapi.com/rapid/latest/' + baseCurrency,
    headers: {
      'X-RapidAPI-Host': 'exchangerate-api.p.rapidapi.com',
      'X-RapidAPI-Key': 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88'
    }
  };
  
  axios.request(currencyOptions).then(function (response) {
    const resp = response.data;
    for (let i = 0; i < countryCurrencies.length; i++){
      console.log(countryCurrencies[i]);
      console.log(resp.rates[countryCurrencies[i]]);
    }
  }).catch(function (error) {
    console.error(error);
  });
}