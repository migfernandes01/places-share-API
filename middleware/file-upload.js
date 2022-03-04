//custom middleware
const multer = require('multer');           //multer
const { v4: uuidv4 } = require('uuid');     //uuid

//helper constant with mimetypes and their ext
const MIME_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg',
};

//configure multer and get fileUpload middleware
const fileUpload = multer({
    limits: 500000,     //limit of 500kB
    storage: multer.diskStorage({   //storage that takes some configs
        destination: (req, file, callback) => {     //set img destination in disk storage
            //set destination path with callback function
            callback(null, 'uploads/images');
        },            
        filename: (req, file, callback) => {        //set filename
            //set extension with help of a constant
            const ext = MIME_TYPE_MAP[file.mimetype];
            //set filename using callback function
            callback(null, uuidv4() + '.' + ext);
        },
        fileFilter: (req, file, callback) => {
            //check if mimetype is valid(!! to convert to true/false)
            const isValid = !!MIME_TYPE_MAP[file.mimetype];
            let error = isValid ? null : new Error('Invalid file type.');
            //use callback function with the error and isValid to accept/deny file
            callback(error, isValid);
        }
    })
});

//export middleware
module.exports = fileUpload;