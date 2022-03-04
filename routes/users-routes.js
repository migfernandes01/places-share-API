//file that contains routes for users
const express = require('express');                 //express
const { check } = require('express-validator');     //express-validator

//import controllers for users
const usersControllers = require('../controllers/users-controller');

//import fileUpload middleware
const fileUpload = require('../middleware/file-upload');

//get router from express
const router = express.Router();

//listen to GET requests on /api/users
router.get('/', usersControllers.getUsers);

//listen to POST requests on /api/users/signup
//pass through validation middlewares and then a controller middleware
router.post('/signup',fileUpload.single('image'), [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 })
    ], usersControllers.signup);

//listen to POST requests on /api/users/login
router.post('/login', usersControllers.login);

//export configured router
module.exports = router;