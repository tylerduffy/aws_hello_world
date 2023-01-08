// Include the AWS SDK module
const AWS = require('aws-sdk');

// Instantiate a DynamoDB document client with the SDK
let dynamodb = new AWS.DynamoDB.DocumentClient();
// https://qeiizsc5ra.execute-api.us-east-1.amazonaws.com/dev

async function getActorFilmography(actor_id) {
  let jsonBody = '';
  const params = {
    TableName : 'database_hollywoodSearch_actors',
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "filmography",
    KeyConditionExpression: 'nm_id = :val',
    ExpressionAttributeValues: {":val": actor_id}
  };
  
  console.log('params: ' + JSON.stringify(params));

  try {
    //console.log('about to query db');
    await dynamodb.query(params).promise()
    .then(queryResults => {
      console.log('inside first then');
      console.log('queryResults: ' + queryResults);
      if (queryResults.Items[0].filmography) {
        jsonBody = queryResults.Items[0].filmography;
      } else {
        jsonBody = '{}';
      }
    });
    console.log('returning the following jsonBody: ' + jsonBody);
    return jsonBody;
  } catch (err) {
    return err;
  }
}

async function getHumanReadableTitles(titleIds) {
  let jsonBody = '';
  const params = {
    TableName : 'database_hollywoodSearch_titles',
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "name,release_year",
    KeyConditionExpression: 'ttl_id = :val',
    ExpressionAttributeValues: {":val": titleIds}
  };

  try {
    //console.log('about to query db');
    await dynamodb.query(params).promise()
    .then(queryResults => {
      //console.log('inside first then');
      jsonBody = queryResults.Items;
    });
    return jsonBody;
  } catch (err) {
    return err;
  }
}

async function crossReferenceActors(firstActor, secondActor) {
  // set up database information
  let firstActor_filmography = await getActorFilmography(firstActor);
  let secondActor_filmography = await getActorFilmography(secondActor);
  
  let commonTitles = [];
  
  if (firstActor_filmography == '{}' || secondActor_filmography == '{}') {
    return commonTitles;
  }
  
  console.log('firstActor filmography: ' + firstActor_filmography.values);
  console.log('firstActor filmography length: ' + firstActor_filmography);
  console.log('secondActor filmogrpahy: ' + secondActor_filmography);
  for (let elem of firstActor_filmography.values) {
    console.log('elem: ' + elem);
    console.log('includes: ' + secondActor_filmography.values.includes(elem));
    if (secondActor_filmography.values.includes(elem)) {
      commonTitles.push(elem);
    }
  }
  //return getHumanReadableTitles(commonTitles);
  return commonTitles;
}

// Define handler function, the entry point to our code for the Lambda service
// We receive the object that triggers the function as a parameter
exports.handler = async (event) => {
    try {
        const titles = await crossReferenceActors(event.firstActor, event.secondActor);
        const response = {
            statusCode: 200,
            body: JSON.stringify(titles)
        };
        return response;
    } catch (err) {
        return { error: err };
    }
};
