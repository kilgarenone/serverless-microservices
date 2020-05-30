"use strict";

const serverless = require("aws-serverless-micro");
const { json, send, sendError } = require("micro");
const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid");

const { ORDERS_TABLE, PAYMENTS_SERVICE_FUNCTION } = process.env;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();
/**
 * Credit: https://github.com/vercel/micro/issues/16#issuecomment-193518395
 */

/**
 * handle POST requests
 */
async function postHandler(request) {
  const { itemName, skuId, qty, createdAt, status } = await json(request);
  const orderId = uuid();
  // TODO
  if (typeof qty !== "number") {
    // res.status(400).json({ error: '"name" must be a string' });
  }

  const orderParams = {
    TableName: ORDERS_TABLE,
    Item: {
      orderId,
      itemName,
      skuId,
      qty,
      createdAt,
      status,
    },
  };

  const paymentParams = {
    FunctionName: PAYMENTS_SERVICE_FUNCTION,
    Payload: JSON.stringify({}),
    LogType: "Tail",
  };

  try {
    await dynamoDb.put(orderParams).promise();
  } catch (err) {
    throw err;
  }

  try {
    const paymentResponse = await lambda.invoke(paymentParams).promise();

    const paymentStatus = JSON.parse(paymentResponse.Payload).statusCode;

    const updateOrderParams = {
      TableName: ORDERS_TABLE,
      Key: {
        orderId,
      },
      ExpressionAttributeNames: {
        "#S": "status",
      },
      ExpressionAttributeValues: {
        ":s": paymentStatus,
      },
      ReturnValues: "UPDATED_NEW",
      UpdateExpression: "SET #S = :s",
    };

    const orderItem = await dynamoDb.update(updateOrderParams).promise();

    return {
      ...orderItem,
      paymentStatus: JSON.parse(paymentResponse.Payload).statusCode,
    };
  } catch (paymentErr) {
    throw paymentErr;
  }
}
/**
 * handle GET requests
 */
async function getHandler(request) {
  const params = {
    TableName: ORDERS_TABLE, // give it your table name
    Select: "ALL_ATTRIBUTES",
  };

  try {
    const orders = await dynamoDb.scan(params).promise();
    return orders;
  } catch (err) {}
}

/**
 * Check the request method and use postHandler or getHandler (or other method handlers)
 */
async function methodHandler(request, response) {
  try {
    switch (request.method) {
      case "POST":
        return await postHandler(request);
      case "GET":
        return await getHandler(request);
      default:
        send(response, 405, "Invalid method");
        break;
    }
  } catch (error) {
    throw error;
  }
}

async function server(request, response) {
  // DO THIS TOO TO ENABLE CORS! besides setting 'cors: true' in serverless.yml
  response.setHeader("Access-Control-Allow-Origin", "*");
  try {
    send(response, 200, await methodHandler(request));
  } catch (error) {
    sendError(request, response, error);
  }
}

module.exports.handler = serverless(server);

module.exports.triggerStream = (event, context, callback) => {
  console.log("trigger stream was called");

  const eventData = event.Records[0];
  //console.log(eventData);

  console.log(eventData.dynamodb.NewImage);
  callback(null, null);
};
