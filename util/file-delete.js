const aws = require('aws-sdk');

//config aws
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});

const s3 = new aws.S3();

const fileDelete = async (imagePath) => {
    const filename = imagePath.split('/').pop();
    const params = { Bucket: process.env.AWS_BUCKET_NAME, Key: filename};

    s3.headObject(params)
        .promise()
        .then((data) => {
            console.log('file found in s3');
            s3.deleteObject(params)
                .promise()
                .then(
                    () => console.log('file deleted successfully!'),
                    () => console.log('ERROR in file deleting: ')
                );
        },
        (err) => console.log('file not found: ' + err.code)
        );
};

module.exports = fileDelete;