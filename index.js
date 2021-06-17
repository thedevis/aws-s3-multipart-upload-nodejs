async function uploadLargeFileToS3(fileLocation, key, bucket, config, isPublic = false, partSize = 5) {

    const fs = require('fs');
    const AWS = require('aws-sdk');

    if (fileLocation === undefined) throw new Error("FILE_LOCATION_IS_REQUIRED");
    if (bucket === undefined) throw new Error("BUCKET_REQUIRED");
    if (key === undefined) throw new Error("KEY_FOR_S3_BUCKET_IS_REQUIRED");

    const S3 = new AWS.S3(config);




    //TODO: file exist error handling
    //TODO: is file readable

    //TODO: check minimum size checking for using multipart

    const readStream = fs.createReadStream(fileLocation);
    let multiPartParams = {
        Bucket: bucket,
        Key: key,
        ACL: 'private' //you can change to public also
    };
    const uploadId = await (function (multiPartParams) {
        return new Promise(function (resolve, reject) {
            S3.createMultipartUpload(multiPartParams, function (err, result) {
                if (err) return reject(err);
                return resolve(result.UploadId);
            })
        })
    })(multiPartParams);
    let partUploadPromises = [];
    let partNum = 0;
    readStream.on('readable', function () {
        let data;
        while ((data = readStream.read(partSize)) != null) {
            partNum++;
            let partParams = {
                Body: data,
                Bucket: bucket,
                Key: key,
                PartNumber: String(partNum),
                UploadId: uploadId
            };
        }
    })

    function uploadPartToS3(s3, partialDataParam, multipartMap, tryCount = 1) {

        return new Promise(function (resolve, reject) {
            let tryNum = tryCount || 1;
            let maxUploadRetryCount = 3;
            s3.uploadPart(partialDataParam, function (err, data) {
                if (err) {
                    console.log('multiErr, upload part error:', multiErr);
                    if (tryNum < maxUploadRetryCount) {
                        console.log('Retrying upload of part: #', partialDataParam.PartNumber)
                        uploadPartToS3(s3, multipart, partParams, multipartMap, tryNum + 1);
                    } else {
                        console.log('Failed uploading part: #', partParams.PartNumber)
                        return reject(multiErr);
                    }
                }
                multipartMap.Parts[this.request.params.PartNumber - 1] = {
                    ETag: mData.ETag,
                    PartNumber: Number(this.request.params.PartNumber)
                };
                console.log("Completed part", this.request.params.PartNumber);
                console.log('mData', mData);
                return resolve(mData);
            });
        })
    }






    //uploading file in chunk







    return uploadId;
}


