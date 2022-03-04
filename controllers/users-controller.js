//controller for users
const { validationResult } = require('express-validator');  //express-validator
const bcrypt = require('bcryptjs');                         //bcrypt(hash pw)
const jwt = require('jsonwebtoken');                        //JWT package

const HttpError = require('../models/http-error');  //HttpError model
const User = require('../models/user');             //User model

//function that gets users
const getUsers = async (req, res, next) => {
    //try to get all users in DB
    let users;
    try {
        //find all users in users collection and get everything except the password
        users = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError('Fetching users failed', 500));
    }
    
    //parse all the items in users array to a js object and take the '_' out of the _id
    //send response with status 200 and array of objects users
    res.status(200).json({users: users.map(user => user.toObject({ getters:true }))});
};

//function that signs users up
const signup = async (req, res, next) => {
    //see if there were any validation error
    const errors = validationResult(req);
    //If there were some validation errors throw error
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input', 422));
    }

    //extract data from request body
    const { name, email, password } = req.body;

    //try to check for a user with that email
    let existingUser;
    try {
        //check to see if a user with that email already exists
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Signing up failed.', 500));
    }
    
    //if a user with that email was found
    if(existingUser){
        return next(new HttpError('An account with that e-mail already exists', 422));
    }

    //try to hash password
    let hashedPassword;
    try {
        //password, salting rounds(12 in this case)
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        //return HttpError to next middleware
        return next(new HttpError('Could not create user.', 500));
    }

    //create new user object with the data provided in the request body
    const createdUser = new User({
        name: name,
        email: email,
        image: req.file.path,       //file path on the server
        password: hashedPassword,   //hashed password
        places: [],
    });

    //try to store data in DB
    try {
        //store data into DB
        await createdUser.save();
    } catch (err) {
        return next(new HttpError('Signing up failed.', 500));
    }

    //try to generate JWT token
    let token;
    try {
        //encode userId and email into token with a secret key and an expiration date of 2 days
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },   //encoded fields
            process.env.JWT_KEY,                                    //secret key
            { expiresIn: '2 days' }                                 //options
        );

    } catch (err) {
        return next(new HttpError('Signing up failed.', 500));
    }

    //send userId, email and session token as response with code 200
    res.status(200).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

//function that logs users in
const login = async (req, res, next) => {
    //extract data from request body
    const { email, password } = req.body;

    //try to check for a user with that email
    let existingUser;
    try {
        //check to see if a user with that email already exists
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Login failed.', 500));
    }

    //if there is no user with that e-mail OR the password is not correct
    if(!existingUser){
        //return HttpError to next middleware
        return next(new HttpError('Invalid credentials.', 403));
    }

    //try to compared pw with hashed pw
    let passwordIsValid = false;
    try {
        //compare inserted password with password for that existing user with bcrypt.compare
        passwordIsValid = await bcrypt.compare(password, existingUser.password);
    } catch (err) { //if error in bcrypt.compare
        //return HttpError to next middleware
        return next(new HttpError('Invalid credentials.', 500));
    }

    //if password is not valid (result from bcrypt.compare)
    if(!passwordIsValid){
        //return HttpError to next middleware
        return next(new HttpError('Invalid credentials.', 401));
    }

    //try to generate JWT token
    let token;
    try {
        //encode userId and email into token with a secret key and an expiration date of 2 days
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email }, //encoded fields
            process.env.JWT_KEY,                                    //secret key
            { expiresIn: '2 days' }                                 //options
        );

    } catch (err) {
        return next(new HttpError('Login failed.', 500));
    }

    //send userId, email and session token as response with code 200
    res.status(200).json({ userId: existingUser.id, email: existingUser.email, token: token });
};

//export pointer to getUsers function
exports.getUsers = getUsers;
//export pointer to signup function
exports.signup = signup;
//export pointer to login function
exports.login = login;