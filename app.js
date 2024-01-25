const express = require("express");
const https = require("https");
const bodyparser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/weather.html');
});


app.post("/", function (req, res) {
    var city = req.body.ccity;
    const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=7f923b2e7e73e7bb65d765e5c7fc0b11&units=metric";

    https.get(weatherApiUrl, function (weatherResponse) {
        weatherResponse.on("data", function (weatherData) {
            const data = {}
            const weatherdata = JSON.parse(weatherData);
            if (weatherdata.cod === '404') {
                res.render(__dirname + '/result.ejs', { message:'CITY NOT FOUND'})
            } else {
                data.city = city;
                data.temp = weatherdata.main.temp;
                data.description = weatherdata.weather[0].description;
                data.icon = weatherdata.weather[0].icon;
                data.coordin1 = weatherdata.coord.lon;
                data.coordin2 = weatherdata.coord.lat;
                data.flslike = weatherdata.main.feels_like;
                data.humidity = weatherdata.main.humidity;
                data.pressure = weatherdata.main.pressure;
                data.windspeed = weatherdata.wind.speed;
                data.councode = weatherdata.id;
                data.rain = weatherdata.rain && weatherdata.rain['3h'] ? weatherdata.rain['3h'] : 0;
                data.imageURL = "https://openweathermap.org/img/wn/" + data.icon + "@2x.png";
             
                const wikipediaApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&titles=${city}&origin=*`;
                axios.get(wikipediaApiUrl)
                    .then((wikipediaResponse) => {
                        const pageId = Object.keys(wikipediaResponse.data.query.pages)[0];
                        data.wikiExtract = wikipediaResponse.data.query.pages[pageId].extract;

                        res.render(__dirname + '/result.ejs', { data })

                    })
                    .catch((error) => {
                        console.error("Error fetching Wikipedia data", error);
                        res.send("Error fetching Wikipedia data");
                    });
            }
        });
    });
});



app.listen(3000, function () {
    console.log("Server started on 3000");
});
