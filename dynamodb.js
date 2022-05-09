const AWS = require('aws-sdk');

let options = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  options = {
    region: 'localhost',
    endpoint: 'http://localhost:18000',
  };
}

const client = new AWS.DynamoDB.DocumentClient(options);

export default client;
