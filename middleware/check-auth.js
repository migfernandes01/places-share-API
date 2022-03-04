// middleware for authentication & authorization

const jwt = require('jsonwebtoken');                //jwt token

const HttpError = require("../models/http-error");  //HttpError model

//function that checks if we have a valid JWT token
module.exports = (req, res, next) => {
    //if it's an OPTIONS request, continue to next middlware
    if(req.method === 'OPTIONS'){
        return next();
    }

    //try to extract token from request headers
    try{
        //get token from headers (second word after space)
        const token = req.headers.authorization.split(' ')[1];    // Authorization: 'Bearer TOKEN'
        
        //if token is undefined/null
        if(!token) {
            //throw new error to get catched in catch block
            throw new Error('Authentication failed!');
        }
        //verify token with jwt.verify using the token from request and secret key
        const decodedToken = jwt.verify(token, process.env.JWT_KEY,);
        
        //add userdId from decodedToken to request
        req.userData = { userId: decodedToken.userId }
        //if we got here, user is authenticated, move to next middleware
        next();

    }catch(err){
        //return HttpError to next middleware
        return next(new HttpError('Authentication failed', 403));
    }
    


};