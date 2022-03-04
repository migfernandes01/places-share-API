//mongoose schema (data model) for a user
const mongoose = require('mongoose');                           //mongoose
const uniqueValidator = require('mongoose-unique-validator');   //mongoose-unique-validator

//get Schema object from mongoose
const Schema = mongoose.Schema;

//create a new Schema for a user
const userSchema = new Schema({
    //we ommit id because it is generated automatically
    name: { type: String, required: true },                     //user's name
    email: { type: String, required: true, unique: true },      //user's email (unique)
    password: { type: String, required: true, minlength: 6 },   //user's password (min length 6 chars)
    image: { type: String, required: true, minlength: 6 },      //user's image URL
    places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }],   //user's places(array of objectId's)
});

//add uniqueValidator for e-mail to userSchema
userSchema.plugin(uniqueValidator);

//export mongoose model
module.exports = mongoose.model('User', userSchema);