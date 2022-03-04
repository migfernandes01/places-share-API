//controller for places
const fs = require('fs');                                   //File system from NodeJS

const { validationResult } = require('express-validator');  //express-validator

const HttpError = require('../models/http-error');          //error model
const Place = require('../models/place');                   //place model
const User = require('../models/user');                     //user model

const getCoordsForAddress = require('../util/location');    //function to get coordinates from address
const { default: mongoose } = require('mongoose');

//function that gets place by it's ID
const getPlaceById = async (req, res, next) => {
    //extract placeId from request params
    const placeId = req.params.placeId;

    let place;
    //try to get a place by id
    try {
        //get place with placeId by finding in DB by id
        place = await Place.findById(placeId);
    } catch (err) {
        //create a new HttpError
        const error = new HttpError('Could not find a place with that id.', 500);
        //return error to next middleware
        return next(error);
    }

    //if place was not found, set response status to 404 and a JSON message
    if(!place){
        //call next middleware with the HttpError
        return next(new HttpError('Could not find a place with that id.', 404));
    }

    //parse place to object and get rid of _id, send the object in the response
    res.json({place: place.toObject( { getters: true } )});
};

//function that gets a place by userId
const getPlacesByUserId = async (req, res, next) => {
    //extract userId from request params
    const userId = req.params.userId;

    let places;
    //try to get places by user id
    try {
        //get places for a user finding places in DB using userId
        places = await Place.find({ creator: userId });
    } catch (err) {
        //create a new HttpError
        const error = new HttpError('Could not find places for that user', 500);
        //return error to next middleware
        return next(error);
    }

    //if place was not found, call next middleware passing an error
    if(!places || places.length === 0){
        //call next middleware with the HttpError
        return next(new HttpError('Could not find places for that user.', 404));
    }

    //map array of places to get rid of '_' in _id in each place and
    //send response in json containing the array of places
    res.json({places: places.map(place => place.toObject({ getters: true }))});
};

//function that creates a new place
const createPlace = async (req, res, next) => {
    //see if there were any validation error
    const errors = validationResult(req);
    //If there were some validation errors throw error
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input', 422));
    }

    //extract data from request body
    const { title, description, address } = req.body;
    //try to get coordinates from address
    let coordinates;
    try {
        //get coordinates from address
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }
    
    //create new place object
    const createdPlace = new Place({
        title: title,
        description: description,
        address: address,
        location: coordinates,
        image: req.file.path,           //file.path from request
        creator: req.userData.userId,   //userData.userId from request
    });

    //try to check if user exists
    let user;
    try {
        //check if user exists
        user = await User.findById(req.userData.userId);
    } catch (error) {
        return next(new HttpError('Creating place failed.', 500));
    }

    //if user doesn't exist
    if(!user){
        return next(new HttpError('Could not find user for the provided id.', 500));
    }

    //try to store createdPlace in DB and add placeId to the user.places
    try {
        //start new mongoose session
        //const session = await mongoose.startSession();
        //start new transition on session
        //session.startTransaction();
        //store createdPlace into DB
        await createdPlace.save(/*{ session: session }*/);
        //push creaedPlace into user places array field
        user.places.push(createdPlace);
        //store user into DB
        await user.save(/*{ session }*/);
        //commit transactions in session
        //await session.commitTransaction();
    } catch (err) {
        console.log(err);
        //create new HttpError
        const error = new HttpError('Failure creating place.', 500);
        //return error to next middleware
        return next(error);
    }

    //send new reponse with 201 code and created place as json
    res.status(201).json({place: createdPlace});
};

//function that updates a place by its id
const updatePlace = async (req, res, next) => {
    //see if there were any validation error
    const errors = validationResult(req);
    //If there were some validation errors throw error
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input', 422));
    }

    //extract data from request body
    const { title, description } = req.body;
    //extract placeId from request params
    const placeId = req.params.placeId;

    //try to find place by id
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        //create new HttpError
        const error = new HttpError('Could not update place.', 500);
        //return error to next middleware
        return next(error);
    }

    //if place creator(convert objectId to string) is not user sending PATCH request
    if(place.creator.toString() !== req.userData.userId){
        //return HttpError to next middleware
        return next(new HttpError('You are not allowed to edit this place', 401));
    }

    //update place title to new title
    place.title = title;
    //update place description to new description
    place.description = description;

    //try to store new place into DB
    try {
        //store place into DB
        await place.save();
    } catch (err) {
        //create new HttpError
        const error = new HttpError('Could not update place.', 500);
        //return error to next middleware
        return next(error);
    }

    //parse place to object and get rid of _id, send the object in the response
    res.status(200).json({place: place.toObject({ getters:true })});
};

//function that deletes a place by its id
const deletePlace = async (req, res, next) => {
    //extract placeId from request params
    const placeId = req.params.placeId;
    
    //try to find place by id
    let place;
    try {
        //find place in DB by its ID and get reference from 'creator' field(user id)
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        //create new HttpError
        const error = new HttpError('Could not delete place.', 500);
        //return error to next middleware
        return next(error);
    }

    //if place doesn't exist
    if(!place){
        return next(new HttpError('Could not find a place with that id.', 404));
    }

    //if place creator is not the same as the user questing
    if(place.creator.id !== req.userData.userId){
        //return HttpError to next middleware
        return next(new HttpError('You are not allowed to delete this place', 401));
    }

    //get image path from place
    const imagePath = place.image;

    //try to remove place from DB and from places array in the user
    try {
        //start mongose session
        //const session = await mongoose.startSession();
        //start transaction on session
        //session.startTransaction();
        //remove place from DB
        await place.remove(/*{ session: session }*/);
        //remove place from user places array
        await place.creator.places.pull(place);
        //store user places array in DB
        await place.creator.save(/*{ session: session }*/)
        //commit session transactions
        //session.commitTransaction();
    } catch (err) {
        console.log(err);
        //create new HttpError
        const error = new HttpError('Could not delete place.', 500);
        //return error to next middleware
        return next(error);
    }

    //delete image from file system, catch error if needed
    fs.unlink(imagePath, err => {
        console.log(err);
    });

    //send new response with code 200 and message
    res.status(200).json({message: 'Deleted place.'});
};

//export pointer to getPlaceById function
exports.getPlaceById = getPlaceById;
//export pointer to getPlaceByUserId function
exports.getPlacesByUserId = getPlacesByUserId;
//export pointer to createPlace function
exports.createPlace = createPlace;
//export pointer to createPlace function
exports.updatePlace = updatePlace;
//export pointer to deletePlace function
exports.deletePlace = deletePlace;