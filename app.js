//main entry file of backend server
const fs = require('fs');                   //NodeJS file system module
const path = require('path');               //NodeJS path module
const express = require('express');     //express
const mongoose = require('mongoose');   //mongoose

const placesRoutes = require('./routes/places-routes'); //routes for places
const usersRoutes = require('./routes/users-routes');   //routes for users

const HttpError = require('./models/http-error');       //HttpError model

//create app object by executing express
const app = express();

//parse any incoming data to JSON
app.use(express.json());

//middleware that sets headers
app.use((req, res, next) => {
    //add headers to response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    //move on to next middleware
    next();
});

//middleware to handle requests to /uploads/images
//serve static from uploads/images path
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

//middleware function to handle requests to /api/places/...
app.use('/api/places', placesRoutes);

//middleware function to handle requests to /api/users/...
app.use('/api/users', usersRoutes);

//middleware that sets 404 error for an invalid route
app.use((req, res, next) => {
    return next(new HttpError('Could not find this route.', 404));
});

//error handling middleware function
app.use((error, req, res, next) => {
    //if we have a file in the request
    if(req.file){
        //delete file
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    //if response was already sent
    if(res.headerSent){
        return next(error);
    }
    //if response was not sent yet, send response with a custom status(provided in error object) or 500
    res.status(error.code || 500).json({message: error.message || 'Something went wrong!'});
});

//connect to mongoDB
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mbim9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {       //if connection was successful 
        //start server and listen for requests on port 5000
        app.listen(process.env.PORT || 5000);
    })
    .catch((err) => {   //if connection failed
        console.log(err);
    });


