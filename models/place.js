//mongoose schema (data model) for a place
const mongoose = require('mongoose');   //mongoose

//get Schema object from mongoose
const Schema = mongoose.Schema;

//create a new Schema for a place
const placeSchema = new Schema({
    //we ommit id because it is generated automatically
    title: { type: String, required: true },        //place's title
    description: { type: String, required: true },  //place's description
    image: { type: String, required: true },        //place's image URL
    address: { type: String, required: true },      //place's address
    location: {                                     //place's location(object)
        lat: { type: Number, required: true},       //place's latitude
        lng: { type: Number, required: true},       //place's longitude
    },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },     //places's creator(User id)
});

//export mongoose model
module.exports = mongoose.model('Place', placeSchema);