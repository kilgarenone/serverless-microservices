"use strict";

const serverless = require("aws-serverless-micro");
const { json, send, sendError } = require("micro");
const AWS = require("aws-sdk");

const ORDERS_TABLE = process.env.ORDERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**
 * Credit: https://github.com/vercel/micro/issues/16#issuecomment-193518395
 */

/**
 * handle POST requests
 */
async function postHandler(request) {
  const { orderId, name } = await json(request);
  // TODO
  if (typeof name !== "string") {
    // res.status(400).json({ error: '"name" must be a string' });
  }
  const params = {
    TableName: ORDERS_TABLE,
    Item: {
      orderId,
      name,
    },
  };

  try {
    await dynamoDb.put(params).promise();

    return { orderId };
  } catch (err) {}
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
  try {
    send(response, 200, await methodHandler(request));
  } catch (error) {
    sendError(request, response, error);
  }
}

module.exports.handler = serverless(server);
