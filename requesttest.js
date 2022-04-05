const axios = require("axios");

const options = {
  method: 'GET',
  url: 'https://wft-geo-db.p.rapidapi.com/v1/geo/countries/PK',
  responseType: 'JSON',
  headers: {
    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
    'X-RapidAPI-Key': 'd3f83f8df3mshc7c926e48db29b9p18e5c1jsn83fcb7d5dd88'
  }
};

axios.request(options).then(function (response) {
    const resp = response.data;
    console.log("name: " + resp.data.name);
    console.log("capital: " + resp.data.capital);
    console.log("flagUrl: " + resp.data.flagImageUri);
    console.log("=== start ===")
	console.log(response.data);
    console.log("=== end ===")
}).catch(function (error) {
	console.error(error);
});