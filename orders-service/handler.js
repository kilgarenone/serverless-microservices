"use strict";

const serverless = require("aws-serverless-micro");
const { json, send, sendError } = require("micro");
const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid");

const { ORDERS_TABLE, PAYMENTS_SERVICE_ENDPOINT } = process.env;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();
/**
 * Credit: https://github.com/vercel/micro/issues/16#issuecomment-193518395
 */

/**
 * handle POST requests
 */
async function postHandler(request) {
  const { itemName, skuId, qty, timeStamp } = await json(request);
  const orderId = uuid();
  // TODO
  if (typeof qty !== "number") {
    // res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: ORDERS_TABLE,
    Item: {
      orderId,
      itemName,
      skuId,
      qty,
    },
  };

  const paymentParams = {
    FunctionName: "payments-service-dev-handler",
    InvocationType: "RequestResponse",
    Payload: JSON.stringify({ hello: "bro payment man" }),
    LogType: "Tail",
  };

  let paymentResponse;
  try {
    paymentResponse = await lambda.invoke(paymentParams).promise();
  } catch (paymentErr) {
    throw paymentErr;
  }

  try {
    // await dynamoDb.put(params).promise();

    return { params: paymentResponse };
  } catch (err) {
    throw err;
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
