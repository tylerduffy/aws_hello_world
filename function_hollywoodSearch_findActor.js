// Include the AWS SDK module
const AWS = require('aws-sdk');

// Instantiate a DynamoDB document client with the SDK
let dynamodb = new AWS.DynamoDB.DocumentClient();

async function listActors(eventTrigger) {
  // set up database information
  const params = {
    AttributesToGet: eventTrigger.args,
    TableName : 'database_hollywoodSearch_actors'
  };

  try {
    const actors = await dynamodb.scan(params).promise();
    return actors;
  } catch (err) {
    return err;
  }
}

// Define handler function, the entry point to our code for the Lambda service
// We receive the object that triggers the function as a parameter
exports.handler = async (event) => {
    try {
        const actors = await listActors(event);
        const response = {
            statusCode: 200,
            body: JSON.stringify(actors)
        };
        return response;
    } catch (err) {
        return { error: err };
    }
};
