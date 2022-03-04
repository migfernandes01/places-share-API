//file that contains routes for places
const express = require('express');                 //express
const { check } = require('express-validator');     //express-validator

//import controllers for places
const placesControllers = require('../controllers/places-controller');

const fileUpload = require('../middleware/file-upload');    //fileUplaod middleware
const checkAuth = require('../middleware/check-auth');      //checkAuth middleware

//get router from express
const router = express.Router();

//listen to GET requests on /api/places/:placeId
router.get('/:placeId', placesControllers.getPlaceById);

//listen to GET requests on /api/places/user/:userId
router.get('/user/:userId', placesControllers.getPlacesByUserId);

//autorization middleware
router.use(checkAuth);

//routes below are protected by checkAuth middleware

//listen to POST requests on /api/places
//pass through validation middlewares and then a controller middleware
router.post('/',fileUpload.single('image'), [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
        check('address').not().isEmpty()
    ],placesControllers.createPlace);

//listen to PATCH requests on /api/places/:placeId
//pass through validation middlewares and then a controller middleware
router.patch('/:placeId',[
    check('title').not().isEmpty(),
    check('description').isLength({min: 5}),
], placesControllers.updatePlace);

//listen to DELETE requests on /api/places/:placeId
router.delete('/:placeId', placesControllers.deletePlace);

//export configured router
module.exports = router;