const AWS = require('aws-sdk');
require('dotenv').config();


exports.updloadToS3 = (data, filename) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY =process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    let s3Bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    })
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }
    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3responce) => {
            if (err) {
                console.log(`Something went wrong`, err);
                reject(err);
            } else {
                console.log(`work has done ===>`, s3responce);
                resolve(s3responce.Location);
            }
        })
    })
}

exports.listObjectsInBucket = () => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey:process.env.IAM_USER_SECRET,
        
    });

    const params = {
        Bucket: process.env.BUCKET_NAME
    };

    return new Promise((resolve, reject) => {
        s3.listObjects(params, (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log(data.Contents)
                resolve(data.Contents);
            }
        });
    });
};
