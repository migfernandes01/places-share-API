const axios = require("axios");
const HttpError = require("../models/http-error");
const API_KEY = "pk.d59f5a202df642ce3acfa5ffafb69792";
 
async function getCoordsForAddress(address) {
    //fetch data from API using axios
    const response = await axios.get(
        `https://us1.locationiq.com/v1/search.php?key=${API_KEY}&q=${encodeURIComponent(
        address
        )}&format=json`
    );
    //get data from the response
    const data = response.data[0];
    
    console.log(data);
    
    //if we can't fetch data, throw new error
    if (!data || data.status === "ZERO_RESULTS") {
        const error = new HttpError(
        "Could not find location for the specified address.",
        422
        );
        throw error;
    }
 
    //arrange coordinates object
    const coorLat = data.lat;
    const coorLon = data.lon;
    const coordinates = {
        lat: coorLat,
        lng: coorLon
    };
    //return coordinates
    return coordinates;
}

//export pointer to getCoordsForAddress function
module.exports = getCoordsForAddress;