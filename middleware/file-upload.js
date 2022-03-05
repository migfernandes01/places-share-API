//custom middleware
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

//config aws
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});

const s3 = new aws.S3();

//helper constant with mimetypes and their ext
const MIME_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg',
};

//configure multer and get fileUpload middleware
const fileUpload = multer({
    limits: 500000,     //limit of 500kB
    storage: multerS3({     //storage with multer-S3
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    }),
    fileFilter: (req, file, callback) => {
        //check if mimetype is valid(!! to convert to true/false)
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValid ? null : new Error('Invalid file type.');
        //use callback function with the error and isValid to accept/deny file
        callback(error, isValid);
    }
});

//export middleware
module.exports = fileUpload;