// Include the AWS SDK module
const AWS = require('aws-sdk');

// Instantiate a DynamoDB document client with the SDK
let dynamodb = new AWS.DynamoDB.DocumentClient();
// https://qeiizsc5ra.execute-api.us-east-1.amazonaws.com/dev

async function querySingleTitle(title_id, cols) {
  let jsonBody = '';
  console.log('querySingleTitle.title_id: ' + title_id);
  const params = {
    TableName: 'database_hollywoodSearch_titles',
    Select: "SPECIFIC_ATTRIBUTES",
    KeyConditionExpression: 'ttl_id = :val',
    ExpressionAttributeValues: {":val": title_id},
    ProjectionExpression: cols
  };
  
  console.log('params: ' + JSON.stringify(params));

  try {
    console.log('inside try');
    await dynamodb.query(params).promise()
    .then(queryResults => {
      console.log('inside first then');
      jsonBody = queryResults.Items[0];
    });
    console.log('returning...');
    return jsonBody;
  } catch (err) {
    console.log('error here');
    return err;
  }
}

async function getSingleTitle(title_id) {
  // set up database information
  let titleData = await querySingleTitle(title_id);
  
  console.log("Title data: " + titleData);
  
  return titleData;
}

async function getTitleInfo(titleIds, columnsToRead) {
  // set up database information
  console.log('first title id: ' + titleIds[0]);
  //let titleData = await querySingleTitle(titleIds[0], columnsToRead);
  let titleData = [];
  for (const nextTitle of titleIds) {
    console.log('getTitleInfo.nextTitle: ' + nextTitle);
    let nextElem = await querySingleTitle(nextTitle, columnsToRead);
    console.log('adding elem: ' + JSON.stringify(nextElem));
    titleData.push(nextElem);
  }
  console.log("Title data: " + titleData);
  
  return titleData;
}

// Define handler function, the entry point to our code for the Lambda service
// We receive the object that triggers the function as a parameter
exports.handler = async (event) => {
    try {
        //const titleData = await getSingleTitle(event.title_id);
        const titleData = await getTitleInfo(JSON.parse(event.title_ids), event.cols);
        const response = {
            statusCode: 200,
            body: JSON.stringify(titleData)
        };
        return response;
    } catch (err) {
        return { error: err };
    }
};
